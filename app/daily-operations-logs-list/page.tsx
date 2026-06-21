"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import DailyOperationsLogForm, {
  dailyOperationsLogFieldKeys,
  type DailyOperationsLogData,
} from "../../components/DailyOperationsLogForm";
import { createClient } from "../../lib/supabase/client";

type RowData = DailyOperationsLogData & Record<string, any>;

type ActiveCell = {
  rowId: string;
  fieldKey: string;
} | null;

type TableField = {
  key: string;
  label: string;
  description: string;
  type: "text" | "date" | "time" | "datetime" | "select" | "boolean";
};

const statusOptions = ["In Progress", "Completed", "Needs Follow-Up", "Incomplete"];
const yesNoOptions = ["Yes", "No"];

const defaultVisibleFieldKeys = [
  "log_date",
  "overall_status",
  "opening_time_submitted",
  "huddle_completed",
  "closeout_completed",
  "final_verified_at",
];

const editableFieldKeys = [
  "log_date",
  "overall_status",
  "opening_time_submitted",
  "huddle_completed",
  "closeout_completed",
  "final_verified_at",
];

const booleanFields = new Set([
  "opening_voicemails_checked",
  "opening_portal_messages_reviewed",
  "opening_emails_reviewed",
  "opening_urgent_patient_callbacks_identified",
  "opening_escalations_logged",
  "opening_overnight_cancellations_reviewed",
  "opening_todays_schedule_reviewed",
  "opening_incomplete_patients_identified",
  "opening_insurance_verification_gaps_identified",
  "opening_missing_intake_forms_identified",
  "opening_blocked_provider_time_confirmed",
  "opening_waitlist_move_up_opportunities_reviewed",
  "opening_double_bookings_identified",
  "opening_high_complexity_patients_flagged",
  "opening_rooms_prepared",
  "opening_equipment_functioning",
  "opening_labs_prepared",
  "opening_supplies_checked",
  "opening_staff_coverage_confirmed",
  "opening_referral_backlog_reviewed",
  "opening_billing_backlog_reviewed",
  "opening_open_clinical_loops_reviewed",

  "huddle_completed",
  "huddle_present_donna",
  "huddle_present_raven",
  "huddle_present_carla",
  "huddle_present_mykeal",
  "huddle_present_dr_akita",
  "huddle_all_issues_have_owners",
  "huddle_yesterday_all_charts_closed_same_day",
  "huddle_yesterday_all_claims_submitted_24_hrs",
  "huddle_yesterday_all_referrals_updated",
  "huddle_yesterday_all_follow_ups_scheduled",
  "huddle_yesterday_all_balances_collected",

  "closeout_completed",
  "closeout_provider_all_charts_closed",
  "closeout_provider_documentation_complete",
  "closeout_provider_coding_clarified",
  "closeout_provider_orders_finalized",
  "closeout_front_desk_payments_posted",
  "closeout_front_desk_follow_ups_scheduled",
  "closeout_front_desk_tomorrows_schedule_reviewed",
  "closeout_front_desk_intake_gaps_identified",
  "closeout_front_desk_outstanding_balances_flagged",
  "closeout_front_desk_daily_count_submitted",
  "closeout_clinical_referrals_updated",
  "closeout_clinical_labs_tracked",
  "closeout_clinical_patient_callbacks_completed",
  "closeout_clinical_open_clinical_loops_identified",
  "closeout_tomorrow_schedule_reviewed",
  "closeout_tomorrow_staffing_coverage_confirmed",
  "closeout_tomorrow_high_risk_patients_identified",
  "closeout_tomorrow_outstanding_blockers_identified",
]);

function humanizeFieldKey(key: string) {
  return key
    .replace(/^opening_/, "Opening ")
    .replace(/^huddle_/, "Huddle ")
    .replace(/^closeout_/, "Closeout ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getFieldDescription(key: string) {
  if (key === "log_date") return "The date this daily huddle / operations log belongs to.";
  if (key === "overall_status") return "The overall status of the daily operations log.";
  if (key === "opening_time_submitted") return "The time the opening checklist was submitted.";
  if (key === "huddle_completed") return "Whether the daily huddle section was completed.";
  if (key === "closeout_completed") return "Whether the end-of-day closeout was completed.";
  if (key === "final_verified_at") return "The date and time the record was finally verified.";
  if (key.includes("notes")) return "Notes recorded for this daily operations log.";
  if (key.includes("issue")) return "Issue, blocker, or concern captured during the huddle.";
  if (key.includes("action")) return "Action item or follow-up captured during the huddle.";
  if (key.includes("present")) return "Whether this person was present.";
  if (key.includes("completed")) return "Whether this item was completed.";
  if (key.includes("reviewed")) return "Whether this item was reviewed.";
  if (key.includes("identified")) return "Whether this item was identified.";
  if (key.includes("confirmed")) return "Whether this item was confirmed.";
  return "Daily huddle / daily operations field.";
}

function getFieldType(key: string): TableField["type"] {
  if (booleanFields.has(key)) return "boolean";
  if (key === "overall_status") return "select";
  if (key.includes("_time_") || key.endsWith("_time")) return "time";
  if (key.includes("_at")) return "datetime";
  if (key.includes("date")) return "date";
  return "text";
}

function valueIsTrue(value: any) {
  return value === true || value === "true" || value === "Yes" || value === 1;
}

function yesNoToBoolean(value: string) {
  return value === "Yes" || value === "true";
}

function formatDate(value: any) {
  if (!value) return "—";
  const text = String(value);
  return text.includes("T") ? text.split("T")[0] : text;
}

function formatDateTimeForInput(value: any) {
  if (!value) return "";
  const text = String(value);
  return text.includes("T") ? text.slice(0, 16) : text;
}

function formatTime(value: any) {
  if (!value) return "—";
  return String(value).slice(0, 5);
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

export default function DailyOperationsLogsListPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [rows, setRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [searchText, setSearchText] = useState("");
  const [activeMenu, setActiveMenu] = useState<"" | "filter" | "sort" | "viewFields">("");
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [visibleFieldKeys, setVisibleFieldKeys] = useState<string[]>(defaultVisibleFieldKeys);

  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [openRecord, setOpenRecord] = useState<RowData | null>(null);
  const [rowActionMenuId, setRowActionMenuId] = useState<string | null>(null);

  const [activeCell, setActiveCell] = useState<ActiveCell>(null);
  const [cellValue, setCellValue] = useState("");

  const [bulkUpdateFieldKey, setBulkUpdateFieldKey] = useState("overall_status");
  const [bulkUpdateValue, setBulkUpdateValue] = useState("Completed");

  useEffect(() => {
    loadRows();
  }, []);

  const tableFields = useMemo<TableField[]>(() => {
    return dailyOperationsLogFieldKeys
      .filter((key) => key !== "id" && key !== "created_at")
      .map((key) => ({
        key,
        label: humanizeFieldKey(key),
        description: getFieldDescription(key),
        type: getFieldType(key),
      }));
  }, []);

  const visibleTableFields = tableFields.filter((field) =>
    visibleFieldKeys.includes(field.key)
  );

  const availableTableFields = tableFields.filter(
    (field) => !visibleFieldKeys.includes(field.key)
  );

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

  const filteredRows = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let nextRows = [...rows];

    if (search) {
      nextRows = nextRows.filter((row) =>
        dailyOperationsLogFieldKeys
          .map((key) => String(row[key] || "").toLowerCase())
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

        if (
          sortField?.type === "date" ||
          sortField?.type === "time" ||
          sortField?.type === "datetime"
        ) {
          return String(secondValue || "").localeCompare(String(firstValue || ""));
        }

        return String(firstValue || "").localeCompare(String(secondValue || ""));
      });
    }

    return nextRows;
  }, [rows, searchText, filterField, filterValue, sortBy, tableFields]);

  const selectedRows = rows.filter((row) => selectedRowIds.includes(String(row.id)));

  const allVisibleSelected =
    filteredRows.length > 0 &&
    filteredRows.every((row) => selectedRowIds.includes(String(row.id)));

  const metrics = [
    {
      label: "Records Loaded",
      value: rows.length,
      description: "Total daily operations logs loaded.",
    },
    {
      label: "Opening Submitted",
      value: rows.filter((row) => Boolean(row.opening_time_submitted)).length,
      description: "Logs with the opening checklist submitted.",
    },
    {
      label: "Huddles Completed",
      value: rows.filter((row) => valueIsTrue(row.huddle_completed)).length,
      description: "Logs where the daily huddle was completed.",
    },
    {
      label: "Closeouts Completed",
      value: rows.filter((row) => valueIsTrue(row.closeout_completed)).length,
      description: "Logs where the end-of-day closeout was completed.",
    },
  ];

  async function loadRows() {
    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("daily_operations_logs")
      .select("*")
      .order("id", { ascending: false })
      .limit(500);

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      setRows([]);
      return;
    }

    setRows((data as RowData[]) || []);
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

  function getEditInputType(field: TableField) {
    if (field.key === "overall_status") return "select";
    if (field.type === "boolean") return "boolean";
    if (field.type === "date") return "date";
    if (field.type === "time") return "time";
    if (field.type === "datetime") return "datetime";
    return "text";
  }

  function startInlineEdit(row: RowData, field: TableField) {
    if (!editableFieldKeys.includes(field.key)) return;

    setMessage("");
    setErrorMessage("");
    setRowActionMenuId(null);

    const rowId = getRowId(row);
    const value = row[field.key];

    setActiveCell({ rowId, fieldKey: field.key });

    if (field.type === "boolean") {
      setCellValue(valueIsTrue(value) ? "Yes" : "No");
      return;
    }

    if (field.type === "datetime") {
      setCellValue(formatDateTimeForInput(value));
      return;
    }

    setCellValue(value === null || value === undefined ? "" : String(value));
  }

  async function saveInlineCell() {
    if (!activeCell) return;

    const field = tableFields.find((item) => item.key === activeCell.fieldKey);

    if (!field) return;

    let valueToSave: string | boolean | null = cellValue || null;

    if (field.type === "boolean") {
      valueToSave = yesNoToBoolean(cellValue);
    }

    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("daily_operations_logs")
      .update({ [field.key]: valueToSave })
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
    const payload: Record<string, any> = {};

    dailyOperationsLogFieldKeys.forEach((key) => {
      if (key === "id" || key === "created_at") return;

      const value = row[key];

      if (value !== undefined) {
        payload[key] = value;
      }
    });

    return payload;
  }

  async function duplicateRecord(row: RowData) {
    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("daily_operations_logs")
      .insert(buildDuplicatePayload(row));

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Daily operations log duplicated.");
    setRowActionMenuId(null);
    await loadRows();
  }

  async function bulkDuplicateRecords() {
    if (selectedRows.length === 0) return;

    const confirmed = window.confirm(
      `Duplicate ${selectedRows.length} selected daily operations log(s)?`
    );

    if (!confirmed) return;

    setMessage("");
    setErrorMessage("");

    const supabase = createClient();
    const payloads = selectedRows.map(buildDuplicatePayload);

    const { error } = await supabase.from("daily_operations_logs").insert(payloads);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`${selectedRows.length} daily operations log(s) duplicated.`);
    setSelectedRowIds([]);
    await loadRows();
  }

  async function deleteRecord(row: RowData) {
    if (!row.id) return;

    const confirmed = window.confirm(
      "Delete this daily operations log? This cannot be undone."
    );

    if (!confirmed) return;

    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("daily_operations_logs")
      .delete()
      .eq("id", row.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Daily operations log deleted.");
    setRowActionMenuId(null);
    setSelectedRowIds((current) => current.filter((id) => id !== String(row.id)));
    await loadRows();
  }

  async function bulkDeleteRecords() {
    if (selectedRows.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedRows.length} selected daily operations log(s)? This cannot be undone.`
    );

    if (!confirmed) return;

    const ids = selectedRows.map((row) => row.id).filter(Boolean);

    if (ids.length === 0) return;

    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("daily_operations_logs")
      .delete()
      .in("id", ids);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`${selectedRows.length} daily operations log(s) deleted.`);
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
      `Update ${selectedRows.length} selected daily operations log(s)?`
    );

    if (!confirmed) return;

    const ids = selectedRows.map((row) => row.id).filter(Boolean);

    if (ids.length === 0) return;

    const field = tableFields.find((item) => item.key === bulkUpdateFieldKey);

    let valueToSave: string | boolean | null = bulkUpdateValue;

    if (field?.type === "boolean") {
      valueToSave = yesNoToBoolean(bulkUpdateValue);
    }

    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("daily_operations_logs")
      .update({ [bulkUpdateFieldKey]: valueToSave })
      .in("id", ids);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`${selectedRows.length} daily operations log(s) updated.`);
    setSelectedRowIds([]);
    await loadRows();
  }

  function exportCsv() {
    const fields = dailyOperationsLogFieldKeys.filter(
      (key) => key !== "id" && key !== "created_at"
    );

    const csvRows = rows.map((row) =>
      fields.map((field) => escapeCsvValue(row[field])).join(",")
    );

    const csv = [fields.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "daily-operations-logs-export.csv";
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

    const fields = dailyOperationsLogFieldKeys.filter(
      (key) => key !== "id" && key !== "created_at"
    );

    const payloads = parsed.rows.map((csvRow) => {
      const payload: Record<string, any> = {};

      fields.forEach((field) => {
        const matchingHeader =
          parsed.headers.find(
            (header) => header.toLowerCase() === field.toLowerCase()
          ) || "";

        const value = matchingHeader ? csvRow[matchingHeader] || "" : "";

        if (!value) {
          payload[field] = null;
          return;
        }

        if (booleanFields.has(field)) {
          payload[field] =
            value.toLowerCase() === "true" ||
            value.toLowerCase() === "yes" ||
            value === "1";
          return;
        }

        payload[field] = value;
      });

      return payload;
    });

    const supabase = createClient();

    const { error } = await supabase.from("daily_operations_logs").insert(payloads);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`${payloads.length} daily operations log(s) imported.`);
    await loadRows();
  }

  function renderTableCell(row: RowData, field: TableField) {
    const value = row[field.key];
    const rowId = getRowId(row);
    const isEditing =
      activeCell?.rowId === rowId && activeCell?.fieldKey === field.key;
    const canEdit = editableFieldKeys.includes(field.key);
    const editType = getEditInputType(field);

    if (isEditing) {
      return (
        <div style={inlineEditWrapStyle}>
          {editType === "select" ? (
            <select
              value={cellValue}
              onChange={(event) => setCellValue(event.target.value)}
              style={inlineInputStyle}
              autoFocus
            >
              <option value="">Select</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : null}

          {editType === "boolean" ? (
            <select
              value={cellValue}
              onChange={(event) => setCellValue(event.target.value)}
              style={inlineInputStyle}
              autoFocus
            >
              {yesNoOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : null}

          {editType === "date" ? (
            <input
              type="date"
              value={cellValue}
              onChange={(event) => setCellValue(event.target.value)}
              style={inlineInputStyle}
              autoFocus
            />
          ) : null}

          {editType === "time" ? (
            <input
              type="time"
              value={cellValue}
              onChange={(event) => setCellValue(event.target.value)}
              style={inlineInputStyle}
              autoFocus
            />
          ) : null}

          {editType === "datetime" ? (
            <input
              type="datetime-local"
              value={cellValue}
              onChange={(event) => setCellValue(event.target.value)}
              style={inlineInputStyle}
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

    let displayValue = "—";

    if (field.type === "boolean") {
      displayValue = valueIsTrue(value) ? "Yes" : "No";
    } else if (field.type === "date") {
      displayValue = formatDate(value);
    } else if (field.type === "time") {
      displayValue = formatTime(value);
    } else if (field.type === "datetime") {
      displayValue = value ? String(value).replace("T", " ").slice(0, 16) : "—";
    } else if (value !== null && value !== undefined && value !== "") {
      displayValue = String(value);
    }

    if (!canEdit) {
      return displayValue;
    }

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

  function resetBulkValueForField(fieldKey: string) {
    const field = tableFields.find((item) => item.key === fieldKey);

    setBulkUpdateFieldKey(fieldKey);

    if (!field) {
      setBulkUpdateValue("");
      return;
    }

    if (field.type === "boolean") {
      setBulkUpdateValue("Yes");
      return;
    }

    if (field.key === "overall_status") {
      setBulkUpdateValue("Completed");
      return;
    }

    setBulkUpdateValue("");
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
          <a href="/?table=daily_operations_logs" style={backLinkStyle}>
            ← Back
          </a>

          <div style={eyebrowStyle}>PRACTICE FOUNDER · DAILY OPERATIONS</div>
          <h1 style={titleStyle}>Daily Operations Logs Manager</h1>
          <p style={descriptionStyle}>
            Manage full daily opening, huddle, and end-of-day closeout packets.
          </p>
        </div>

        <div style={headerActionsStyle}>
          <a href="/daily-operations-logs" style={primaryButtonStyle}>
            + Add Daily Operations Log
          </a>

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
              placeholder="Find daily operations logs"
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
            <div style={panelTitleStyle}>Filter Daily Huddle Logs</div>

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
            <div style={panelTitleStyle}>Sort Daily Huddle Logs</div>

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
                  onClick={() =>
                    setVisibleFieldKeys(tableFields.map((field) => field.key))
                  }
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
                    <div
                      key={field.key}
                      title={field.description}
                      style={selectedFieldItemStyle}
                    >
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
          <div
            style={bulkToolbarStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={bulkTopRowStyle}>
              <div style={bulkTextStyle}>
                <strong>{selectedRowIds.length}</strong> selected
              </div>

              <div style={buttonRowStyle}>
                <button
                  type="button"
                  onClick={bulkDuplicateRecords}
                  style={secondaryButtonStyle}
                >
                  Bulk Duplicate
                </button>

                <button
                  type="button"
                  onClick={bulkDeleteRecords}
                  style={deleteButtonStyle}
                >
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
                  onChange={(event) => resetBulkValueForField(event.target.value)}
                  style={bulkInputStyle}
                >
                  {tableFields
                    .filter((field) => editableFieldKeys.includes(field.key))
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
                {bulkUpdateFieldKey === "overall_status" ? (
                  <select
                    value={bulkUpdateValue}
                    onChange={(event) => setBulkUpdateValue(event.target.value)}
                    style={bulkInputStyle}
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : null}

                {booleanFields.has(bulkUpdateFieldKey) ? (
                  <select
                    value={bulkUpdateValue}
                    onChange={(event) => setBulkUpdateValue(event.target.value)}
                    style={bulkInputStyle}
                  >
                    {yesNoOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : null}

                {getFieldType(bulkUpdateFieldKey) === "time" ? (
                  <input
                    type="time"
                    value={bulkUpdateValue}
                    onChange={(event) => setBulkUpdateValue(event.target.value)}
                    style={bulkInputStyle}
                  />
                ) : null}

                {getFieldType(bulkUpdateFieldKey) === "datetime" ? (
                  <input
                    type="datetime-local"
                    value={bulkUpdateValue}
                    onChange={(event) => setBulkUpdateValue(event.target.value)}
                    style={bulkInputStyle}
                  />
                ) : null}

                {getFieldType(bulkUpdateFieldKey) === "date" ? (
                  <input
                    type="date"
                    value={bulkUpdateValue}
                    onChange={(event) => setBulkUpdateValue(event.target.value)}
                    style={bulkInputStyle}
                  />
                ) : null}
              </label>

              <button
                type="button"
                onClick={bulkUpdateRecords}
                style={primarySmallButtonStyle}
              >
                Apply Bulk Update
              </button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div style={loadingStyle}>Loading daily operations logs...</div>
        ) : null}

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
                        <td
                          key={field.key}
                          style={tdStyle}
                          title={field.description}
                        >
                          {renderTableCell(row, field)}
                        </td>
                      ))}

                      <td style={tdStyle}>
                        <div
                          style={actionMenuWrapStyle}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setRowActionMenuId(
                                rowActionMenuId === rowId ? null : rowId
                              )
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
                                  setOpenRecord(row);
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
              <div style={emptyStateStyle}>
                No daily operations logs match this view.
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {openRecord ? (
        <div style={modalBackdropStyle} onClick={() => setOpenRecord(null)}>
          <section
            style={largeModalStyle}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <div>
                <div style={eyebrowStyle}>OPEN / EDIT RECORD</div>
                <h2 style={modalTitleStyle}>Daily Operations Log #{openRecord.id}</h2>
                <p style={modalIntroStyle}>
                  Edit this daily operations log using the same sectioned packet layout.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpenRecord(null)}
                style={secondaryButtonStyle}
              >
                Close
              </button>
            </div>

            <DailyOperationsLogForm
              mode="edit"
              initialData={openRecord}
              submitLabel="Save Daily Operations Log"
              cancelLabel="Close"
              onCancel={() => setOpenRecord(null)}
              onSaved={async () => {
                setOpenRecord(null);
                await loadRows();
              }}
            />
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
  width: "min(1220px, 100%)",
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