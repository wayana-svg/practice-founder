"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "../../lib/supabase/client";

type RowData = Record<string, any>;

type ActiveCell = {
  rowId: string;
  fieldKey: string;
} | null;

type TableField = {
  key: string;
  label: string;
  description: string;
  type: "text" | "textarea" | "date" | "number" | "employee";
  editable: boolean;
};

const tableName = "charge_lag_submissions";

const tableFields: TableField[] = [
  {
    key: "batch_name",
    label: "Batch Name",
    description:
      "The review batch this charge lag record belongs to. Example: Week of June 10 or Batch 4.",
    type: "text",
    editable: true,
  },
  {
    key: "submitted_by",
    label: "Submitted By",
    description:
      "The employee or PF team member who entered this charge lag record.",
    type: "employee",
    editable: true,
  },
  {
    key: "date_of_service",
    label: "Date of Service",
    description:
      "The date the patient was seen. This is the starting point for the charge lag count.",
    type: "date",
    editable: true,
  },
  {
    key: "claim_submission_date",
    label: "Claim Submission Date",
    description:
      "The date the claim was submitted to insurance. This is the ending point for the charge lag count.",
    type: "date",
    editable: true,
  },
  {
    key: "lag_in_days",
    label: "Lag in Days",
    description:
      "The number of days between the date of service and the claim submission date.",
    type: "number",
    editable: false,
  },
  {
    key: "notes",
    label: "Notes",
    description:
      "Notes about the delay, missing documentation, payer issue, claim issue, or follow-up needed.",
    type: "textarea",
    editable: true,
  },
];

const defaultVisibleFieldKeys = [
  "batch_name",
  "submitted_by",
  "date_of_service",
  "claim_submission_date",
  "lag_in_days",
  "notes",
];

function formatDate(value: any) {
  if (!value) return "—";

  const text = String(value);

  if (text.includes("T")) return text.split("T")[0];

  return text;
}

function formatValue(value: any, field: TableField) {
  if (value === null || value === undefined || value === "") return "—";

  if (field.type === "date") return formatDate(value);

  return String(value);
}

function calculateLagInDays(dateOfService: string, claimSubmissionDate: string) {
  if (!dateOfService || !claimSubmissionDate) return 0;

  const start = new Date(`${dateOfService}T00:00:00`);
  const end = new Date(`${claimSubmissionDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  const diff = end.getTime() - start.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  return days < 0 ? 0 : days;
}

function escapeCsvValue(value: any) {
  if (value === null || value === undefined) return "";

  const text = String(value);

  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  values.push(current);

  return values;
}

function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== "");

  if (lines.length < 2) {
    return {
      headers: [] as string[],
      rows: [] as Record<string, string>[],
    };
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());

  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    return row;
  });

  return { headers, rows };
}

export default function ChargeLagListPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [rows, setRows] = useState<RowData[]>([]);
  const [employees, setEmployees] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [searchText, setSearchText] = useState("");
  const [activeMenu, setActiveMenu] = useState<"" | "filter" | "sort" | "viewFields">("");
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [visibleFieldKeys, setVisibleFieldKeys] = useState<string[]>(
    defaultVisibleFieldKeys
  );

  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [rowActionMenuId, setRowActionMenuId] = useState<string | null>(null);
  const [openRecord, setOpenRecord] = useState<RowData | null>(null);
  const [editRecord, setEditRecord] = useState<RowData | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const [activeCell, setActiveCell] = useState<ActiveCell>(null);
  const [cellValue, setCellValue] = useState("");

  const [bulkUpdateFieldKey, setBulkUpdateFieldKey] = useState("batch_name");
  const [bulkUpdateValue, setBulkUpdateValue] = useState("");

  const [form, setForm] = useState({
    batch_name: "",
    submitted_by: "",
    date_of_service: "",
    claim_submission_date: "",
    notes: "",
  });

  useEffect(() => {
    loadRows();
    loadEmployees();
  }, []);

  const visibleTableFields = tableFields.filter((field) =>
    visibleFieldKeys.includes(field.key)
  );

  const availableTableFields = tableFields.filter(
    (field) => !visibleFieldKeys.includes(field.key)
  );

  const selectedRows = rows.filter((row) => selectedRowIds.includes(String(row.id)));

  const filterOptions = useMemo(() => {
    if (!filterField) return [];

    const values = new Set<string>();

    rows.forEach((row) => {
      const value = row[filterField];

      if (value !== null && value !== undefined && String(value).trim() !== "") {
        values.add(String(value));
      }
    });

    return Array.from(values).sort();
  }, [rows, filterField]);


  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    if (params.get("add") === "1") {
      setAddOpen(true);
      window.history.replaceState(null, "", "/charge-lag-list");
    }
  }, []);

  const filteredRows = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let nextRows = [...rows];

    if (search) {
      nextRows = nextRows.filter((row) =>
        tableFields
          .map((field) => String(row[field.key] || "").toLowerCase())
          .some((value) => value.includes(search))
      );
    }

    if (filterField && filterValue) {
      nextRows = nextRows.filter(
        (row) => String(row[filterField] || "") === filterValue
      );
    }

    if (sortBy) {
      const sortField = tableFields.find((field) => field.key === sortBy);

      nextRows.sort((firstRow, secondRow) => {
        const firstValue = firstRow[sortBy];
        const secondValue = secondRow[sortBy];

        if (sortBy === "id") {
          return Number(secondValue || 0) - Number(firstValue || 0);
        }

        if (sortField?.type === "date" || sortField?.type === "number") {
          return Number(secondValue || 0) - Number(firstValue || 0);
        }

        return String(firstValue || "").localeCompare(String(secondValue || ""));
      });
    }

    return nextRows;
  }, [rows, searchText, filterField, filterValue, sortBy]);

  const allVisibleSelected =
    filteredRows.length > 0 &&
    filteredRows.every((row) => selectedRowIds.includes(String(row.id)));

  const averageLag =
    rows.length === 0
      ? 0
      : Math.round(
          rows.reduce((total, row) => total + Number(row.lag_in_days || 0), 0) /
            rows.length
        );

  const metrics = [
    {
      label: "Records Loaded",
      value: rows.length,
      description: "Total charge lag records loaded.",
    },
    {
      label: "Average Lag",
      value: averageLag,
      description: "Average days between service date and claim submission.",
    },
    {
      label: "Over 3 Days",
      value: rows.filter((row) => Number(row.lag_in_days || 0) > 3).length,
      description: "Claims with charge lag greater than 3 days.",
    },
    {
      label: "Over 7 Days",
      value: rows.filter((row) => Number(row.lag_in_days || 0) > 7).length,
      description: "Claims with charge lag greater than 7 days.",
    },
  ];

  async function loadRows() {
    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order("id", { ascending: false })
      .limit(500);

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      setRows([]);
      return;
    }

    setRows(data || []);
  }

  async function loadEmployees() {
    const supabase = createClient();

    const { data } = await supabase
      .from("employees")
      .select("id,name,email,role,active")
      .order("name", { ascending: true })
      .limit(500);

    setEmployees(data || []);
  }

  function getEmployeeName(value: any) {
    if (!value) return "—";

    const employee = employees.find((item) => String(item.id) === String(value));

    return employee?.name || String(value);
  }

  function resetForm() {
    setForm({
      batch_name: "",
      submitted_by: "",
      date_of_service: "",
      claim_submission_date: "",
      notes: "",
    });
  }

  function openAddForm() {
    setMessage("");
    setErrorMessage("");
    resetForm();
    setAddOpen(true);
  }

  function openEditForm(row: RowData) {
    setMessage("");
    setErrorMessage("");
    setEditRecord(row);
    setForm({
      batch_name: String(row.batch_name || ""),
      submitted_by: String(row.submitted_by || ""),
      date_of_service: formatDate(row.date_of_service).replace("—", ""),
      claim_submission_date: formatDate(row.claim_submission_date).replace("—", ""),
      notes: String(row.notes || ""),
    });
  }

  async function saveForm(mode: "create" | "edit") {
    if (!form.batch_name.trim()) {
      setErrorMessage("Batch Name is required.");
      return;
    }

    if (!form.submitted_by) {
      setErrorMessage("Submitted By is required.");
      return;
    }

    if (!form.date_of_service) {
      setErrorMessage("Date of Service is required.");
      return;
    }

    if (!form.claim_submission_date) {
      setErrorMessage("Claim Submission Date is required.");
      return;
    }

    const payload = {
      batch_name: form.batch_name.trim(),
      submitted_by: Number(form.submitted_by),
      date_of_service: form.date_of_service,
      claim_submission_date: form.claim_submission_date,
      lag_in_days: calculateLagInDays(
        form.date_of_service,
        form.claim_submission_date
      ),
      notes: form.notes.trim() || null,
    };

    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const result =
      mode === "create"
        ? await supabase.from(tableName).insert(payload)
        : await supabase.from(tableName).update(payload).eq("id", editRecord?.id);

    if (result.error) {
      setErrorMessage(result.error.message);
      return;
    }

    setMessage(
      mode === "create"
        ? "Charge lag record created."
        : "Charge lag record updated."
    );

    setAddOpen(false);
    setEditRecord(null);
    resetForm();
    await loadRows();
  }

  function getRowId(row: RowData) {
    return String(row.id || "");
  }

  function toggleRowSelection(row: RowData) {
    const rowId = getRowId(row);

    if (!rowId) return;

    setSelectedRowIds((current) => {
      if (current.includes(rowId)) {
        return current.filter((id) => id !== rowId);
      }

      return [...current, rowId];
    });
  }

  function selectAllVisibleRows() {
    const visibleIds = filteredRows.map(getRowId).filter(Boolean);

    if (allVisibleSelected) {
      setSelectedRowIds((current) =>
        current.filter((id) => !visibleIds.includes(id))
      );
      return;
    }

    setSelectedRowIds((current) => Array.from(new Set([...current, ...visibleIds])));
  }

  function startInlineEdit(row: RowData, field: TableField) {
    if (!field.editable) return;

    setMessage("");
    setErrorMessage("");
    setRowActionMenuId(null);
    setActiveCell({ rowId: getRowId(row), fieldKey: field.key });

    const value = row[field.key];

    setCellValue(value === null || value === undefined ? "" : String(value));
  }

  async function saveInlineCell() {
    if (!activeCell) return;

    const field = tableFields.find((item) => item.key === activeCell.fieldKey);

    if (!field) return;

    let valueToSave: any = cellValue || null;

    if (field.type === "employee") {
      valueToSave = cellValue ? Number(cellValue) : null;
    }

    const row = rows.find((item) => String(item.id) === activeCell.rowId);

    const payload: Record<string, any> = {
      [field.key]: valueToSave,
    };

    if (
      row &&
      (field.key === "date_of_service" || field.key === "claim_submission_date")
    ) {
      const nextDateOfService =
        field.key === "date_of_service" ? String(valueToSave || "") : row.date_of_service;
      const nextClaimSubmissionDate =
        field.key === "claim_submission_date"
          ? String(valueToSave || "")
          : row.claim_submission_date;

      payload.lag_in_days = calculateLagInDays(
        String(nextDateOfService || ""),
        String(nextClaimSubmissionDate || "")
      );
    }

    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from(tableName)
      .update(payload)
      .eq("id", activeCell.rowId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`${field.label} updated.`);
    setActiveCell(null);
    setCellValue("");
    await loadRows();
  }

  function cancelInlineEdit() {
    setActiveCell(null);
    setCellValue("");
  }

  function buildDuplicatePayload(row: RowData) {
    return {
      batch_name: row.batch_name,
      submitted_by: row.submitted_by,
      date_of_service: row.date_of_service,
      claim_submission_date: row.claim_submission_date,
      lag_in_days: row.lag_in_days,
      notes: row.notes || null,
    };
  }

  async function duplicateRecord(row: RowData) {
    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase.from(tableName).insert(buildDuplicatePayload(row));

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Charge lag record duplicated.");
    setRowActionMenuId(null);
    await loadRows();
  }

  async function bulkDuplicateRecords() {
    if (selectedRows.length === 0) return;

    const confirmed = window.confirm(
      `Duplicate ${selectedRows.length} selected charge lag record(s)?`
    );

    if (!confirmed) return;

    setMessage("");
    setErrorMessage("");

    const supabase = createClient();
    const payloads = selectedRows.map(buildDuplicatePayload);

    const { error } = await supabase.from(tableName).insert(payloads);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`${selectedRows.length} charge lag record(s) duplicated.`);
    setSelectedRowIds([]);
    await loadRows();
  }

  async function deleteRecord(row: RowData) {
    if (!row.id) return;

    const confirmed = window.confirm(
      "Delete this charge lag record? This cannot be undone."
    );

    if (!confirmed) return;

    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase.from(tableName).delete().eq("id", row.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Charge lag record deleted.");
    setRowActionMenuId(null);
    setSelectedRowIds((current) => current.filter((id) => id !== String(row.id)));
    await loadRows();
  }

  async function bulkDeleteRecords() {
    if (selectedRows.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedRows.length} selected charge lag record(s)? This cannot be undone.`
    );

    if (!confirmed) return;

    const ids = selectedRows.map((row) => row.id).filter(Boolean);

    if (ids.length === 0) return;

    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase.from(tableName).delete().in("id", ids);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`${selectedRows.length} charge lag record(s) deleted.`);
    setSelectedRowIds([]);
    await loadRows();
  }

  async function bulkUpdateRecords() {
    if (selectedRows.length === 0) return;

    if (!bulkUpdateFieldKey || !bulkUpdateValue) {
      setErrorMessage("Choose a field and value before applying a bulk update.");
      return;
    }

    const confirmed = window.confirm(
      `Update ${selectedRows.length} selected charge lag record(s)?`
    );

    if (!confirmed) return;

    const ids = selectedRows.map((row) => row.id).filter(Boolean);

    if (ids.length === 0) return;

    const field = tableFields.find((item) => item.key === bulkUpdateFieldKey);

    if (!field) return;

    let valueToSave: any = bulkUpdateValue;

    if (field.type === "employee") {
      valueToSave = Number(bulkUpdateValue);
    }

    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from(tableName)
      .update({ [bulkUpdateFieldKey]: valueToSave })
      .in("id", ids);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`${selectedRows.length} charge lag record(s) updated.`);
    setSelectedRowIds([]);
    await loadRows();
  }

  function exportCsv() {
    const fields = tableFields.map((field) => field.key);

    const csvRows = rows.map((row) =>
      fields.map((field) => escapeCsvValue(row[field])).join(",")
    );

    const csv = [fields.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "charge-lag-export.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  async function importCsv(file: File) {
    setMessage("");
    setErrorMessage("");

    const text = await file.text();
    const parsed = parseCsv(text);

    if (parsed.rows.length === 0) {
      setErrorMessage("No rows found in the CSV file.");
      return;
    }

    const payloads = parsed.rows.map((csvRow) => {
      const payload: Record<string, any> = {};

      tableFields.forEach((field) => {
        const matchingHeader =
          parsed.headers.find(
            (header) => header.toLowerCase() === field.key.toLowerCase()
          ) || "";

        const value = matchingHeader ? csvRow[matchingHeader] || "" : "";

        if (!value) {
          payload[field.key] = null;
          return;
        }

        if (field.type === "employee") {
          payload[field.key] = Number(value);
          return;
        }

        if (field.type === "number") {
          payload[field.key] = Number(value);
          return;
        }

        payload[field.key] = value;
      });

      if (payload.date_of_service && payload.claim_submission_date) {
        payload.lag_in_days = calculateLagInDays(
          payload.date_of_service,
          payload.claim_submission_date
        );
      }

      return payload;
    });

    const supabase = createClient();

    const { error } = await supabase.from(tableName).insert(payloads);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`${payloads.length} charge lag record(s) imported.`);
    await loadRows();
  }

  function renderCell(row: RowData, field: TableField) {
    const rowId = getRowId(row);
    const value = row[field.key];
    const isEditing =
      activeCell?.rowId === rowId && activeCell?.fieldKey === field.key;

    if (isEditing) {
      return (
        <div style={inlineEditWrapStyle}>
          {field.type === "employee" ? (
            <select
              value={cellValue}
              onChange={(event) => setCellValue(event.target.value)}
              style={inlineInputStyle}
              autoFocus
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name || employee.email || employee.id}
                </option>
              ))}
            </select>
          ) : null}

          {field.type === "date" ? (
            <input
              type="date"
              value={cellValue}
              onChange={(event) => setCellValue(event.target.value)}
              style={inlineInputStyle}
              autoFocus
            />
          ) : null}

          {field.type === "text" ? (
            <input
              type="text"
              value={cellValue}
              onChange={(event) => setCellValue(event.target.value)}
              style={inlineInputStyle}
              autoFocus
            />
          ) : null}

          {field.type === "textarea" ? (
            <textarea
              value={cellValue}
              onChange={(event) => setCellValue(event.target.value)}
              style={inlineTextareaStyle}
              autoFocus
            />
          ) : null}

          <button type="button" onClick={saveInlineCell} style={miniSaveButtonStyle}>
            Save
          </button>

          <button type="button" onClick={cancelInlineEdit} style={miniCancelButtonStyle}>
            Cancel
          </button>
        </div>
      );
    }

    let displayValue = formatValue(value, field);

    if (field.type === "employee") {
      displayValue = getEmployeeName(value);
    }

    if (!field.editable) return displayValue;

    return (
      <button
        type="button"
        onClick={() => startInlineEdit(row, field)}
        style={editableCellButtonStyle}
        title={`Click to edit ${field.label}`}
      >
        {displayValue}
      </button>
    );
  }

  function renderForm(mode: "create" | "edit") {
    return (
      <div style={formGridStyle}>
        <label style={formLabelStyle}>
          Batch Name
          <input
            value={form.batch_name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                batch_name: event.target.value,
              }))
            }
            style={formInputStyle}
          />
          <small style={formHelpStyle}>
            Name the batch this record belongs to.
          </small>
        </label>

        <label style={formLabelStyle}>
          Submitted By
          <select
            value={form.submitted_by}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                submitted_by: event.target.value,
              }))
            }
            style={formInputStyle}
          >
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name || employee.email || employee.id}
              </option>
            ))}
          </select>
          <small style={formHelpStyle}>
            Select who is submitting this charge lag record.
          </small>
        </label>

        <label style={formLabelStyle}>
          Date of Service
          <input
            type="date"
            value={form.date_of_service}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                date_of_service: event.target.value,
              }))
            }
            style={formInputStyle}
          />
          <small style={formHelpStyle}>
            Date the patient was seen.
          </small>
        </label>

        <label style={formLabelStyle}>
          Claim Submission Date
          <input
            type="date"
            value={form.claim_submission_date}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                claim_submission_date: event.target.value,
              }))
            }
            style={formInputStyle}
          />
          <small style={formHelpStyle}>
            Date the claim was submitted to insurance.
          </small>
        </label>

        <div style={calculatedBoxStyle}>
          <div style={metricLabelStyle}>CALCULATED LAG</div>
          <strong>
            {calculateLagInDays(
              form.date_of_service,
              form.claim_submission_date
            )}{" "}
            day(s)
          </strong>
          <p style={formHelpStyle}>
            This number is saved automatically.
          </p>
        </div>

        <label style={formLabelWideStyle}>
          Notes
          <textarea
            value={form.notes}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                notes: event.target.value,
              }))
            }
            style={formTextareaStyle}
          />
          <small style={formHelpStyle}>
            Add delay reason, claim blocker, missing documentation, or follow-up.
          </small>
        </label>

        <div style={formActionsStyle}>
          <button
            type="button"
            onClick={() => {
              if (mode === "create") {
                setAddOpen(false);
              } else {
                setEditRecord(null);
              }

              resetForm();
            }}
            style={secondaryButtonStyle}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => saveForm(mode)}
            style={primaryButtonStyle}
          >
            {mode === "create" ? "Create Charge Lag Record" : "Save Charge Lag Record"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main
      style={pageStyle}
      onClick={() => {
        setRowActionMenuId(null);
      }}
    >
      <section style={headerStyle}>
        <div>
         <a href="/?table=charge_lag_submissions" style={backLinkStyle}>
  ← Back
</a>

          <div style={eyebrowStyle}>PRACTICE FOUNDER · BILLING ACTIVITIES</div>
          <h1 style={titleStyle}>Charge Lag Manager</h1>
          <p style={descriptionStyle}>
            Track how long it takes from the date of service to claim submission.
            Use this page to find lag patterns, fix blockers, and keep billing work moving.
          </p>
        </div>

        <div style={headerActionsStyle}>
          <button type="button" onClick={openAddForm} style={primaryButtonStyle}>
            + Add Charge Lag Record
          </button>

          <div style={buttonRowStyle}>
            <button type="button" onClick={exportCsv} style={secondaryButtonStyle}>
              Export CSV
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={secondaryButtonStyle}
            >
              Import CSV
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  importCsv(file);
                  event.target.value = "";
                }
              }}
            />
          </div>
        </div>
      </section>

      <section style={metricGridStyle}>
        {metrics.map((metric) => (
          <div key={metric.label} style={metricCardStyle}>
            <div style={metricLabelStyle}>{metric.label}</div>
            <div style={metricValueStyle}>{metric.value}</div>
            <p style={metricDescriptionStyle}>{metric.description}</p>
          </div>
        ))}
      </section>

      {message ? <div style={successStyle}>{message}</div> : null}
      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      <section style={tableCardStyle}>
        <div style={toolbarStyle}>
          <div style={searchBoxStyle}>
            <span>⌕</span>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Find charge lag records"
              style={searchInputStyle}
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setActiveMenu((current) => (current === "filter" ? "" : "filter"))
            }
            style={{
              ...toolbarMenuButtonStyle,
              ...(activeMenu === "filter" ? activeToolbarMenuButtonStyle : {}),
            }}
          >
            Filter
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveMenu((current) => (current === "sort" ? "" : "sort"))
            }
            style={{
              ...toolbarMenuButtonStyle,
              ...(activeMenu === "sort" ? activeToolbarMenuButtonStyle : {}),
            }}
          >
            Sort
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveMenu((current) =>
                current === "viewFields" ? "" : "viewFields"
              )
            }
            style={{
              ...toolbarMenuButtonStyle,
              ...(activeMenu === "viewFields"
                ? activeToolbarMenuButtonStyle
                : {}),
            }}
          >
            View Fields
          </button>

          <button type="button" onClick={loadRows} style={refreshButtonStyle}>
            Refresh
          </button>
        </div>

        {activeMenu === "filter" ? (
          <div style={managerPanelStyle}>
            <div style={panelTitleStyle}>Filter Charge Lag Records</div>

            <div style={compactPanelGridStyle}>
              <label style={panelLabelStyle}>
                Field
                <select
                  value={filterField}
                  onChange={(event) => {
                    setFilterField(event.target.value);
                    setFilterValue("");
                  }}
                  style={panelInputStyle}
                >
                  <option value="">Choose field</option>
                  {tableFields.map((field) => (
                    <option key={field.key} value={field.key}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </label>

              <label style={panelLabelStyle}>
                Value
                <select
                  value={filterValue}
                  onChange={(event) => setFilterValue(event.target.value)}
                  style={panelInputStyle}
                  disabled={!filterField}
                >
                  <option value="">All values</option>
                  {filterOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => {
                  setFilterField("");
                  setFilterValue("");
                }}
                style={secondaryButtonStyle}
              >
                Clear Filter
              </button>
            </div>
          </div>
        ) : null}

        {activeMenu === "sort" ? (
          <div style={managerPanelStyle}>
            <div style={panelTitleStyle}>Sort Charge Lag Records</div>

            <div style={fieldListStyle}>
              <button
                type="button"
                onClick={() => {
                  setSortBy("id");
                  setActiveMenu("");
                }}
                style={{
                  ...availableFieldButtonStyle,
                  ...(sortBy === "id" ? selectedSortButtonStyle : {}),
                }}
              >
                <span>
                  <strong>Newest First</strong>
                  <small style={fieldMetaStyle}>Sort by newest record first.</small>
                </span>
              </button>

              {tableFields.map((field) => (
                <button
                  key={field.key}
                  type="button"
                  title={field.description}
                  onClick={() => {
                    setSortBy(field.key);
                    setActiveMenu("");
                  }}
                  style={{
                    ...availableFieldButtonStyle,
                    ...(sortBy === field.key ? selectedSortButtonStyle : {}),
                  }}
                >
                  <span>
                    <strong>{field.label}</strong>
                    <small style={fieldMetaStyle}>{field.description}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {activeMenu === "viewFields" ? (
          <div style={managerPanelStyle}>
            <div style={viewFieldsHeaderStyle}>
              <div>
                <div style={panelEyebrowStyle}>FIELDS TO DISPLAY</div>
                <div style={panelTitleStyle}>Build This View</div>
              </div>

              <div style={buttonRowStyle}>
                <button
                  type="button"
                  onClick={() => setVisibleFieldKeys(tableFields.map((field) => field.key))}
                  style={secondaryButtonStyle}
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={() => setVisibleFieldKeys(defaultVisibleFieldKeys)}
                  style={secondaryButtonStyle}
                >
                  Default View
                </button>
              </div>
            </div>

            <div style={viewFieldsGridStyle}>
              <div style={viewFieldsColumnStyle}>
                <div style={panelEyebrowStyle}>AVAILABLE FIELDS</div>

                <div style={fieldListStyle}>
                  {availableTableFields.map((field) => (
                    <button
                      type="button"
                      key={field.key}
                      title={field.description}
                      onClick={() =>
                        setVisibleFieldKeys((current) => [...current, field.key])
                      }
                      style={availableFieldButtonStyle}
                    >
                      <span>
                        <strong>{field.label}</strong>
                        <small style={fieldMetaStyle}>{field.description}</small>
                      </span>

                      <span style={addFieldCircleStyle}>+</span>
                    </button>
                  ))}

                  {availableTableFields.length === 0 ? (
                    <div style={emptyFieldBoxStyle}>All fields are selected.</div>
                  ) : null}
                </div>
              </div>

              <div style={viewFieldsColumnStyle}>
                <div style={panelEyebrowStyle}>
                  SELECTED FIELDS · {visibleFieldKeys.length}
                </div>

                <div style={fieldListStyle}>
                  {visibleTableFields.map((field) => (
                    <div key={field.key} title={field.description} style={selectedFieldItemStyle}>
                      <div style={{ flex: 1 }}>
                        <strong>{field.label}</strong>
                        <small style={fieldMetaStyle}>{field.description}</small>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setVisibleFieldKeys((current) =>
                            current.length === 1
                              ? current
                              : current.filter((fieldKey) => fieldKey !== field.key)
                          )
                        }
                        style={tinyRemoveButtonStyle}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {selectedRowIds.length > 0 ? (
          <div style={bulkToolbarStyle} onClick={(event) => event.stopPropagation()}>
            <div style={bulkTopRowStyle}>
              <div style={bulkTextStyle}>
                <strong>{selectedRowIds.length}</strong> selected
              </div>

              <div style={buttonRowStyle}>
                <button type="button" onClick={bulkDuplicateRecords} style={secondaryButtonStyle}>
                  Bulk Duplicate
                </button>

                <button type="button" onClick={bulkDeleteRecords} style={deleteButtonStyle}>
                  Bulk Delete
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRowIds([])}
                  style={secondaryButtonStyle}
                >
                  Clear Selection
                </button>
              </div>
            </div>

            <div style={bulkUpdateGridStyle}>
              <label style={bulkLabelStyle}>
                Bulk update field
                <select
                  value={bulkUpdateFieldKey}
                  onChange={(event) => {
                    setBulkUpdateFieldKey(event.target.value);
                    setBulkUpdateValue("");
                  }}
                  style={bulkInputStyle}
                >
                  {tableFields
                    .filter((field) => field.editable)
                    .map((field) => (
                      <option key={field.key} value={field.key}>
                        {field.label}
                      </option>
                    ))}
                </select>
                <small style={bulkHelpStyle}>
                  Update this field for all selected rows.
                </small>
              </label>

              <label style={bulkLabelStyle}>
                New value
                {tableFields.find((field) => field.key === bulkUpdateFieldKey)?.type === "employee" ? (
                  <select
                    value={bulkUpdateValue}
                    onChange={(event) => setBulkUpdateValue(event.target.value)}
                    style={bulkInputStyle}
                  >
                    <option value="">Select employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name || employee.email || employee.id}
                      </option>
                    ))}
                  </select>
                ) : null}

                {tableFields.find((field) => field.key === bulkUpdateFieldKey)?.type === "date" ? (
                  <input
                    type="date"
                    value={bulkUpdateValue}
                    onChange={(event) => setBulkUpdateValue(event.target.value)}
                    style={bulkInputStyle}
                  />
                ) : null}

                {tableFields.find((field) => field.key === bulkUpdateFieldKey)?.type === "text" ? (
                  <input
                    type="text"
                    value={bulkUpdateValue}
                    onChange={(event) => setBulkUpdateValue(event.target.value)}
                    style={bulkInputStyle}
                  />
                ) : null}

                {tableFields.find((field) => field.key === bulkUpdateFieldKey)?.type === "textarea" ? (
                  <input
                    type="text"
                    value={bulkUpdateValue}
                    onChange={(event) => setBulkUpdateValue(event.target.value)}
                    style={bulkInputStyle}
                  />
                ) : null}
              </label>

              <button type="button" onClick={bulkUpdateRecords} style={primarySmallButtonStyle}>
                Apply Bulk Update
              </button>
            </div>
          </div>
        ) : null}

        {loading ? <div style={loadingStyle}>Loading charge lag records...</div> : null}

        {!loading ? (
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={checkboxHeaderStyle}>
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={selectAllVisibleRows}
                      aria-label="Select all visible rows"
                    />
                  </th>

                  {visibleTableFields.map((field) => (
                    <th key={field.key} style={thStyle} title={field.description}>
                      {field.label}
                    </th>
                  ))}

                  <th style={actionsThStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => {
                  const rowId = getRowId(row);

                  return (
                    <tr key={rowId} style={trStyle}>
                      <td style={checkboxCellStyle}>
                        <input
                          type="checkbox"
                          checked={selectedRowIds.includes(rowId)}
                          onChange={() => toggleRowSelection(row)}
                          aria-label="Select row"
                        />
                      </td>

                      {visibleTableFields.map((field) => (
                        <td key={field.key} style={tdStyle} title={field.description}>
                          {renderCell(row, field)}
                        </td>
                      ))}

                      <td style={tdStyle}>
                        <div style={actionMenuWrapStyle} onClick={(event) => event.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() =>
                              setRowActionMenuId(rowActionMenuId === rowId ? null : rowId)
                            }
                            style={actionMenuButtonStyle}
                            aria-label="Open row actions"
                          >
                            ⋯
                          </button>

                          {rowActionMenuId === rowId ? (
                            <div style={actionDropdownStyle}>
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenRecord(row);
                                  setRowActionMenuId(null);
                                }}
                                style={actionDropdownButtonStyle}
                              >
                                Open
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  openEditForm(row);
                                  setRowActionMenuId(null);
                                }}
                                style={actionDropdownButtonStyle}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => duplicateRecord(row)}
                                style={actionDropdownButtonStyle}
                              >
                                Duplicate
                              </button>

                              <button
                                type="button"
                                onClick={() => deleteRecord(row)}
                                style={actionDropdownDangerButtonStyle}
                              >
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredRows.length === 0 ? (
              <div style={emptyStateStyle}>No charge lag records match this view.</div>
            ) : null}
          </div>
        ) : null}
      </section>

      {addOpen ? (
        <div style={modalBackdropStyle} onClick={() => setAddOpen(false)}>
          <section style={largeModalStyle} onClick={(event) => event.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <div style={eyebrowStyle}>ADD RECORD</div>
                <h2 style={modalTitleStyle}>Add Charge Lag Record</h2>
                <p style={modalIntroStyle}>
                  Enter the service date and claim submission date. Lag in days saves automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAddOpen(false);
                  resetForm();
                }}
                style={secondaryButtonStyle}
              >
                Close
              </button>
            </div>

            {renderForm("create")}
          </section>
        </div>
      ) : null}

      {editRecord ? (
        <div style={modalBackdropStyle} onClick={() => setEditRecord(null)}>
          <section style={largeModalStyle} onClick={(event) => event.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <div style={eyebrowStyle}>EDIT RECORD</div>
                <h2 style={modalTitleStyle}>Edit Charge Lag Record #{editRecord.id}</h2>
                <p style={modalIntroStyle}>
                  Update the charge lag record. Lag in days recalculates when dates change.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditRecord(null);
                  resetForm();
                }}
                style={secondaryButtonStyle}
              >
                Close
              </button>
            </div>

            {renderForm("edit")}
          </section>
        </div>
      ) : null}

      {openRecord ? (
        <div style={modalBackdropStyle} onClick={() => setOpenRecord(null)}>
          <section style={largeModalStyle} onClick={(event) => event.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <div style={eyebrowStyle}>OPEN RECORD</div>
                <h2 style={modalTitleStyle}>Charge Lag Record #{openRecord.id}</h2>
                <p style={modalIntroStyle}>
                  Read-only review of this charge lag record.
                </p>
              </div>

              <button type="button" onClick={() => setOpenRecord(null)} style={secondaryButtonStyle}>
                Close
              </button>
            </div>

            <div style={openGridStyle}>
              {tableFields.map((field) => (
                <div key={field.key} style={openFieldStyle}>
                  <div style={metricLabelStyle}>{field.label}</div>
                  <strong>
                    {field.type === "employee"
                      ? getEmployeeName(openRecord[field.key])
                      : formatValue(openRecord[field.key], field)}
                  </strong>
                  <p style={metricDescriptionStyle}>{field.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

const colors = {
  navy: "#1C2333",
  gold: "#C9A84C",
  goldPale: "#F5EDD8",
  cream: "#F8F5EE",
  white: "#FFFFFF",
  slate: "#5F6673",
  border: "#DED8C8",
  red: "#9F1239",
  green: "#166534",
};

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: colors.cream,
  color: colors.navy,
  fontFamily: "var(--font-dm-sans), Arial, sans-serif",
  padding: "34px",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "24px",
  marginBottom: "22px",
};

const headerActionsStyle: CSSProperties = {
  display: "grid",
  gap: "10px",
  justifyItems: "end",
  height: "fit-content",
};

const backLinkStyle: CSSProperties = {
  display: "inline-block",
  marginBottom: "16px",
  color: colors.navy,
  textDecoration: "none",
  fontWeight: 800,
};

const eyebrowStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "11px",
  letterSpacing: "0.16em",
};

const titleStyle: CSSProperties = {
  margin: "8px 0 0",
  fontFamily: "var(--font-playfair), serif",
  fontSize: "42px",
  fontWeight: 600,
};

const descriptionStyle: CSSProperties = {
  color: colors.slate,
  fontSize: "16px",
  maxWidth: "860px",
  lineHeight: 1.6,
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const primaryButtonStyle: CSSProperties = {
  background: colors.gold,
  color: colors.navy,
  border: "none",
  borderRadius: "10px",
  padding: "12px 16px",
  fontWeight: 900,
  cursor: "pointer",
  textDecoration: "none",
};

const primarySmallButtonStyle: CSSProperties = {
  background: colors.gold,
  color: colors.navy,
  border: "none",
  borderRadius: "8px",
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
  height: "42px",
  alignSelf: "end",
};

const secondaryButtonStyle: CSSProperties = {
  background: colors.goldPale,
  color: colors.navy,
  border: "none",
  borderRadius: "8px",
  padding: "9px 12px",
  fontWeight: 900,
  cursor: "pointer",
};

const deleteButtonStyle: CSSProperties = {
  background: colors.red,
  color: colors.white,
  border: "none",
  borderRadius: "8px",
  padding: "9px 12px",
  fontWeight: 900,
  cursor: "pointer",
};

const metricGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "18px",
};

const metricCardStyle: CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "18px",
};

const metricLabelStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "10px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
};

const metricValueStyle: CSSProperties = {
  marginTop: "8px",
  fontSize: "22px",
  fontWeight: 900,
};

const metricDescriptionStyle: CSSProperties = {
  color: colors.slate,
  fontSize: "12px",
  lineHeight: 1.4,
};

const successStyle: CSSProperties = {
  background: "#ecfdf5",
  color: colors.green,
  border: "1px solid #bbf7d0",
  padding: "14px",
  marginBottom: "16px",
};

const errorStyle: CSSProperties = {
  background: "#fff1f2",
  color: colors.red,
  border: "1px solid #fecdd3",
  padding: "14px",
  marginBottom: "16px",
};

const tableCardStyle: CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  boxShadow: "0 18px 42px rgba(28,35,51,0.06)",
};

const toolbarStyle: CSSProperties = {
  minHeight: "54px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 14px",
  borderBottom: `1px solid ${colors.border}`,
};

const searchBoxStyle: CSSProperties = {
  height: "34px",
  minWidth: "260px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: colors.cream,
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "0 10px",
};

const searchInputStyle: CSSProperties = {
  border: "none",
  outline: "none",
  width: "100%",
  background: "transparent",
  color: colors.navy,
};

const toolbarMenuButtonStyle: CSSProperties = {
  height: "34px",
  border: `1px solid ${colors.border}`,
  background: colors.white,
  color: colors.navy,
  borderRadius: "8px",
  padding: "0 12px",
  fontWeight: 800,
  cursor: "pointer",
};

const activeToolbarMenuButtonStyle: CSSProperties = {
  background: colors.goldPale,
  border: `1px solid ${colors.gold}`,
};

const managerPanelStyle: CSSProperties = {
  background: colors.white,
  borderBottom: `1px solid ${colors.border}`,
  padding: "14px",
  display: "grid",
  gap: "12px",
};

const panelTitleStyle: CSSProperties = {
  fontWeight: 900,
  fontSize: "16px",
};

const panelEyebrowStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "10px",
  letterSpacing: "0.16em",
};

const compactPanelGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr auto",
  gap: "12px",
  alignItems: "end",
};

const panelLabelStyle: CSSProperties = {
  display: "grid",
  gap: "6px",
  fontWeight: 800,
  color: colors.navy,
};

const panelInputStyle: CSSProperties = {
  height: "42px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "0 10px",
  color: colors.navy,
  background: colors.white,
};

const fieldListStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
};

const availableFieldButtonStyle: CSSProperties = {
  background: colors.cream,
  border: `1px solid ${colors.border}`,
  color: colors.navy,
  padding: "12px",
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  textAlign: "left",
  cursor: "pointer",
};

const selectedSortButtonStyle: CSSProperties = {
  background: colors.goldPale,
  border: `1px solid ${colors.gold}`,
};

const viewFieldsHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
};

const viewFieldsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
};

const viewFieldsColumnStyle: CSSProperties = {
  background: colors.cream,
  border: `1px solid ${colors.border}`,
  padding: "12px",
  display: "grid",
  gap: "10px",
};

const selectedFieldItemStyle: CSSProperties = {
  background: colors.goldPale,
  border: `1px solid ${colors.gold}`,
  padding: "12px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const fieldMetaStyle: CSSProperties = {
  display: "block",
  marginTop: "3px",
  color: colors.slate,
  fontSize: "12px",
  fontWeight: 500,
};

const addFieldCircleStyle: CSSProperties = {
  width: "24px",
  height: "24px",
  borderRadius: "999px",
  background: colors.goldPale,
  color: colors.navy,
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
};

const tinyRemoveButtonStyle: CSSProperties = {
  border: "none",
  background: colors.white,
  color: colors.navy,
  borderRadius: "8px",
  padding: "8px 10px",
  fontWeight: 800,
  cursor: "pointer",
};

const emptyFieldBoxStyle: CSSProperties = {
  background: colors.white,
  border: `1px dashed ${colors.border}`,
  color: colors.slate,
  padding: "14px",
};

const refreshButtonStyle: CSSProperties = {
  height: "34px",
  border: "none",
  background: colors.navy,
  color: colors.white,
  borderRadius: "8px",
  padding: "0 14px",
  fontWeight: 800,
  cursor: "pointer",
  marginLeft: "auto",
};

const bulkToolbarStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  padding: "12px 14px",
  background: colors.goldPale,
  borderBottom: `1px solid ${colors.border}`,
};

const bulkTopRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
};

const bulkTextStyle: CSSProperties = {
  color: colors.navy,
  fontWeight: 800,
};

const bulkUpdateGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr auto",
  gap: "12px",
  alignItems: "start",
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "12px",
};

const bulkLabelStyle: CSSProperties = {
  display: "grid",
  gap: "6px",
  fontWeight: 800,
  color: colors.navy,
};

const bulkInputStyle: CSSProperties = {
  height: "42px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "0 10px",
  color: colors.navy,
};

const bulkHelpStyle: CSSProperties = {
  color: colors.slate,
  fontSize: "12px",
  fontWeight: 500,
};

const loadingStyle: CSSProperties = {
  padding: "30px",
  color: colors.slate,
};

const tableWrapStyle: CSSProperties = {
  overflowX: "auto",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
};

const checkboxHeaderStyle: CSSProperties = {
  width: "42px",
  padding: "14px",
  background: colors.cream,
  borderBottom: `1px solid ${colors.border}`,
  textAlign: "center",
};

const checkboxCellStyle: CSSProperties = {
  width: "42px",
  padding: "16px",
  borderBottom: `1px solid ${colors.border}`,
  textAlign: "center",
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  background: colors.cream,
  color: colors.navy,
  borderBottom: `1px solid ${colors.border}`,
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontFamily: "var(--font-dm-mono), monospace",
};

const actionsThStyle: CSSProperties = {
  ...thStyle,
  width: "90px",
};

const trStyle: CSSProperties = {
  background: colors.white,
};

const tdStyle: CSSProperties = {
  padding: "16px",
  borderBottom: `1px solid ${colors.border}`,
  verticalAlign: "top",
  color: colors.navy,
};

const editableCellButtonStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: colors.navy,
  padding: 0,
  cursor: "pointer",
  fontWeight: 800,
  textAlign: "left",
  textDecoration: "underline",
  textDecorationColor: colors.gold,
  textUnderlineOffset: "4px",
};

const inlineEditWrapStyle: CSSProperties = {
  display: "flex",
  gap: "6px",
  alignItems: "center",
  minWidth: "260px",
};

const inlineInputStyle: CSSProperties = {
  height: "34px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "0 8px",
  color: colors.navy,
  background: colors.white,
};

const inlineTextareaStyle: CSSProperties = {
  minHeight: "64px",
  minWidth: "260px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "8px",
  color: colors.navy,
  background: colors.white,
};

const miniSaveButtonStyle: CSSProperties = {
  height: "34px",
  border: "none",
  background: colors.gold,
  color: colors.navy,
  borderRadius: "8px",
  padding: "0 9px",
  fontWeight: 900,
  cursor: "pointer",
};

const miniCancelButtonStyle: CSSProperties = {
  height: "34px",
  border: "none",
  background: colors.goldPale,
  color: colors.navy,
  borderRadius: "8px",
  padding: "0 9px",
  fontWeight: 900,
  cursor: "pointer",
};

const emptyStateStyle: CSSProperties = {
  padding: "34px",
  textAlign: "center",
  color: colors.slate,
};

const actionMenuWrapStyle: CSSProperties = {
  position: "relative",
  display: "inline-block",
};

const actionMenuButtonStyle: CSSProperties = {
  width: "34px",
  height: "34px",
  borderRadius: "999px",
  border: `1px solid ${colors.border}`,
  background: colors.white,
  color: colors.navy,
  cursor: "pointer",
  fontWeight: 900,
  fontSize: "18px",
  lineHeight: 1,
};

const actionDropdownStyle: CSSProperties = {
  position: "absolute",
  top: "38px",
  right: 0,
  zIndex: 30,
  minWidth: "170px",
  background: colors.white,
  border: `1px solid ${colors.border}`,
  boxShadow: "0 12px 30px rgba(28,35,51,0.14)",
  padding: "6px",
};

const actionDropdownButtonStyle: CSSProperties = {
  display: "block",
  width: "100%",
  border: "none",
  background: colors.white,
  color: colors.navy,
  textAlign: "left",
  padding: "9px 10px",
  cursor: "pointer",
  fontWeight: 700,
};

const actionDropdownDangerButtonStyle: CSSProperties = {
  ...actionDropdownButtonStyle,
  color: colors.red,
};

const modalBackdropStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 100,
  background: "rgba(28,35,51,0.54)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "28px",
};

const largeModalStyle: CSSProperties = {
  width: "min(960px, 100%)",
  maxHeight: "92vh",
  overflowY: "auto",
  background: colors.cream,
  border: `1px solid ${colors.border}`,
  boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
  padding: "24px",
};

const modalHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "18px",
  marginBottom: "18px",
};

const modalTitleStyle: CSSProperties = {
  margin: "6px 0 0",
  fontFamily: "var(--font-playfair), serif",
  fontSize: "34px",
};

const modalIntroStyle: CSSProperties = {
  color: colors.slate,
  margin: "8px 0 0",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
};

const formLabelStyle: CSSProperties = {
  display: "grid",
  gap: "6px",
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "14px",
  fontWeight: 900,
};

const formLabelWideStyle: CSSProperties = {
  ...formLabelStyle,
  gridColumn: "1 / -1",
};

const formInputStyle: CSSProperties = {
  height: "42px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "0 10px",
  color: colors.navy,
};

const formTextareaStyle: CSSProperties = {
  minHeight: "110px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "10px",
  color: colors.navy,
};

const formHelpStyle: CSSProperties = {
  color: colors.slate,
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: 1.4,
};

const formActionsStyle: CSSProperties = {
  gridColumn: "1 / -1",
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
};

const calculatedBoxStyle: CSSProperties = {
  background: colors.goldPale,
  border: `1px solid ${colors.gold}`,
  padding: "14px",
  display: "grid",
  gap: "6px",
};

const openGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "14px",
};

const openFieldStyle: CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "16px",
};