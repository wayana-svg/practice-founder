"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "../../lib/supabase/client";

type RowData = Record<string, string | number | boolean | null>;

type Employee = {
  id: number;
  name: string | null;
};

type TaskRecord = {
  id: number;
  task_title: string | null;
  status: string | null;
  priority: string | null;
  assigned_to: number | null;
  due_date: string | null;
  description: string | null;
  notes: string | null;
};

type DailyHuddleRecord = RowData;

type OptionDefinition = {
  value: string;
  label: string;
  description: string;
};

type EditableCellField = {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "employee" | "task" | "daily_huddle";
  description: string;
  options?: OptionDefinition[];
};

type BulkUpdateField = {
  key: string;
  label: string;
  type: "select" | "date" | "employee" | "task" | "daily_huddle";
  description: string;
  options?: OptionDefinition[];
};

type ActiveCell = {
  rowId: string;
  fieldKey: string;
} | null;

type ModalMode = "add" | "open" | "edit";

const impactOptions: OptionDefinition[] = [
  {
    value: "Critical",
    label: "Critical",
    description:
      "The issue is severely affecting operations, revenue, patient care, safety, or leadership priorities and needs immediate attention.",
  },
  {
    value: "High",
    label: "High",
    description:
      "The issue is causing a major delay, risk, or operational problem and should be handled quickly.",
  },
  {
    value: "Medium",
    label: "Medium",
    description:
      "The issue matters, but the practice can keep operating while it is being resolved.",
  },
  {
    value: "Low",
    label: "Low",
    description:
      "The issue is minor, low-risk, or can wait until higher-priority issues are handled.",
  },
];

const statusOptions: OptionDefinition[] = [
  {
    value: "Open",
    label: "Open",
    description:
      "The issue has been logged and still needs action, ownership, or follow-up.",
  },
  {
    value: "Assigned",
    label: "Assigned",
    description:
      "Someone has been made responsible for following up on the issue.",
  },
  {
    value: "In Progress",
    label: "In Progress",
    description:
      "Work has started to investigate, fix, or move the issue forward.",
  },
  {
    value: "Waiting on Info",
    label: "Waiting on Info",
    description:
      "The issue is paused because information, approval, files, or feedback is still needed.",
  },
  {
    value: "Resolved",
    label: "Resolved",
    description:
      "The issue has been fixed or addressed, but may still need final confirmation or closing notes.",
  },
  {
    value: "Closed",
    label: "Closed",
    description:
      "The issue is fully finished, documented, and no further action is needed.",
  },
];

const priorityOptions: OptionDefinition[] = [
  {
    value: "Urgent and Important",
    label: "Urgent and Important",
    description:
      "This should be handled first because it is both time-sensitive and important.",
  },
  {
    value: "Important",
    label: "Important",
    description:
      "This matters and should be handled, but it may not require immediate action today.",
  },
  {
    value: "Not Urgent",
    label: "Not Urgent",
    description:
      "This should be handled later, but it does not need immediate attention.",
  },
  {
    value: "Low Priority",
    label: "Low Priority",
    description:
      "This can wait until more important or time-sensitive issues are handled.",
  },
];

const editableCellFields: EditableCellField[] = [
  {
    key: "issue_name",
    label: "Issue Name",
    type: "text",
    description:
      "The short name of the issue or breakdown. This should be clear enough for someone to understand the issue quickly.",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    description:
      "Where the issue currently sits in the resolution process.",
    options: statusOptions,
  },
  {
    key: "priority",
    label: "Priority",
    type: "select",
    description:
      "How soon the issue needs attention compared with other work.",
    options: priorityOptions,
  },
  {
    key: "impact_level",
    label: "Impact Level",
    type: "select",
    description:
      "How much the issue affects operations, patients, money, deadlines, team flow, or leadership priorities.",
    options: impactOptions,
  },
  {
    key: "submitted_by",
    label: "Submitted By",
    type: "employee",
    description:
      "The team member who logged or submitted the issue.",
  },
  {
    key: "linked_task",
    label: "Linked Task",
    type: "task",
    description:
      "The task connected to this issue. Use this when a task owns the follow-up work.",
  },
  {
    key: "link_to_daily_huddle",
    label: "Link to Daily Huddle",
    type: "daily_huddle",
    description:
      "The daily huddle record connected to this issue. Use this when the issue came from a huddle discussion.",
  },
  {
    key: "resolve_close_date",
    label: "Resolve / Close Date",
    type: "date",
    description:
      "The date the issue was resolved or fully closed.",
  },
];

const bulkUpdateFields: BulkUpdateField[] = [
  {
    key: "status",
    label: "Status",
    type: "select",
    description:
      "Update the workflow status for all selected issues.",
    options: statusOptions,
  },
  {
    key: "priority",
    label: "Priority",
    type: "select",
    description:
      "Update the priority for all selected issues.",
    options: priorityOptions,
  },
  {
    key: "impact_level",
    label: "Impact Level",
    type: "select",
    description:
      "Update how serious the issue is for all selected issues.",
    options: impactOptions,
  },
  {
    key: "submitted_by",
    label: "Submitted By",
    type: "employee",
    description:
      "Set the submitter for all selected issues.",
  },
  {
    key: "resolve_close_date",
    label: "Resolve / Close Date",
    type: "date",
    description:
      "Set the resolution or close date for all selected issues.",
  },
  {
    key: "linked_task",
    label: "Linked Task",
    type: "task",
    description:
      "Link all selected issues to the same task record.",
  },
  {
    key: "link_to_daily_huddle",
    label: "Link to Daily Huddle",
    type: "daily_huddle",
    description:
      "Link all selected issues to the same daily huddle record.",
  },
];

type IssueTableField = {
  key: string;
  label: string;
  type?: string;
  description?: string;
  options?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
};

const issueTableFields: IssueTableField[] = [
  {
    key: "issue_name",
    label: "Issue",
    type: "text",
    description: "The short name of the issue or breakdown.",
  },
  {
    key: "date_identified",
    label: "Date Identified",
    type: "date",
    description: "The date the issue was first noticed, reported, or confirmed.",
  },
  {
    key: "impact_level",
    label: "Impact",
    type: "select",
    description: "How much the issue affects operations, patients, money, deadlines, team flow, or leadership priorities.",
    options: impactOptions,
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    description: "Where the issue currently sits in the resolution process.",
    options: statusOptions,
  },
  {
    key: "priority",
    label: "Priority",
    type: "select",
    description: "How soon the issue needs attention compared with other work.",
    options: priorityOptions,
  },
  {
    key: "submitted_by",
    label: "Submitted By",
    type: "employee",
    description: "The team member who logged or submitted the issue.",
  },
  {
    key: "linked_task",
    label: "Linked Task",
    type: "task",
    description: "The task connected to this issue.",
  },
  {
    key: "link_to_daily_huddle",
    label: "Daily Huddle",
    type: "daily_huddle",
    description: "The daily huddle record connected to this issue.",
  },
  {
    key: "resolve_close_date",
    label: "Resolve / Close",
    type: "date",
    description: "The date the issue was resolved or fully closed.",
  },
  {
    key: "description",
    label: "Description",
    type: "text",
    description: "What happened, what is broken, who or what is affected, and why this issue matters.",
  },
  {
    key: "resolution_description",
    label: "Resolution",
    type: "text",
    description: "What was done to fix or address the issue.",
  },
  {
    key: "ending_notes",
    label: "Ending Notes",
    type: "text",
    description: "Final notes, remaining follow-up, lessons learned, or anything the team should remember.",
  },
];

const defaultIssueFieldKeys = [
  "issue_name",
  "date_identified",
  "impact_level",
  "status",
  "priority",
  "submitted_by",
  "linked_task",
  "link_to_daily_huddle",
  "resolve_close_date",
];

const initialDraft: RowData = {
  issue_name: "",
  date_identified: "",
  impact_level: "Medium",
  status: "Open",
  priority: "Important",
  submitted_by: null,
  description: "",
  linked_task: null,
  link_to_daily_huddle: null,
  resolution_description: "",
  resolve_close_date: "",
  ending_notes: "",
};

function escapeCsvValue(value: string | number | boolean | null | undefined) {
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

function countWhere(rows: RowData[], check: (row: RowData) => boolean) {
  return rows.filter(check).length;
}

function formatDate(value: string | number | boolean | null | undefined) {
  if (!value) return "—";

  const text = String(value);

  if (text.includes("T")) return text.split("T")[0];

  return text;
}

function valueToNumberOrNull(value: string | number | boolean | null | undefined) {
  if (value === "" || value === null || value === undefined) return null;

  return Number(value);
}

function getOptionDescription(options: OptionDefinition[], value: string | number | boolean | null | undefined) {
  if (!value) return "";

  return options.find((option) => option.value === String(value))?.description || "";
}

export default function IssuesListPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [rows, setRows] = useState<RowData[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [dailyHuddles, setDailyHuddles] = useState<DailyHuddleRecord[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [searchText, setSearchText] = useState("");
  const [activeMenu, setActiveMenu] = useState<
    "" | "filter" | "sort" | "viewFields"
  >("");
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [visibleFieldKeys, setVisibleFieldKeys] =
    useState<string[]>(defaultIssueFieldKeys);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  const [rowActionMenuId, setRowActionMenuId] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<ActiveCell>(null);
  const [cellValue, setCellValue] = useState("");

  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [activeRecord, setActiveRecord] = useState<RowData | null>(null);
  const [draft, setDraft] = useState<RowData>({ ...initialDraft });

  const [linkedTaskModal, setLinkedTaskModal] = useState<TaskRecord | null>(null);
  const [linkedHuddleModal, setLinkedHuddleModal] =
    useState<DailyHuddleRecord | null>(null);

  const [bulkUpdateFieldKey, setBulkUpdateFieldKey] = useState("status");
  const [bulkUpdateValue, setBulkUpdateValue] = useState("Resolved");

  useEffect(() => {
    loadEverything();
  }, []);

  const filteredRows = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let nextRows = [...rows];

    if (search) {
      nextRows = nextRows.filter((row) =>
        [
          row.id,
          row.issue_name,
          row.status,
          row.priority,
          row.impact_level,
          row.description,
          row.resolution_description,
          row.ending_notes,
          row.submitted_by,
          row.linked_task,
          row.link_to_daily_huddle,
        ]
          .map((value) => String(value || "").toLowerCase())
          .some((value) => value.includes(search))
      );
    }

    if (filterField && filterValue) {
      nextRows = nextRows.filter(
        (row) => String(row[filterField] || "") === filterValue
      );
    }

    if (sortBy) {
      const sortField = issueTableFields.find((field) => field.key === sortBy);

      nextRows.sort((firstRow, secondRow) => {
        const firstValue = firstRow[sortBy];
        const secondValue = secondRow[sortBy];

        if (sortBy === "id") {
          return Number(secondValue || 0) - Number(firstValue || 0);
        }

        if (sortField?.type === "date") {
          return String(secondValue || "").localeCompare(String(firstValue || ""));
        }

        return String(firstValue || "").localeCompare(String(secondValue || ""));
      });
    }

    return nextRows;
  }, [rows, searchText, filterField, filterValue, sortBy]);

  const allVisibleSelected =
    filteredRows.length > 0 &&
    filteredRows.every((row) => selectedRowIds.includes(String(row.id)));

  const selectedRows = rows.filter((row) => selectedRowIds.includes(String(row.id)));

  const selectedBulkField =
    bulkUpdateFields.find((field) => field.key === bulkUpdateFieldKey) ||
    bulkUpdateFields[0];

  const visibleTableFields = issueTableFields.filter((field) =>
    visibleFieldKeys.includes(field.key)
  );

  const availableTableFields = issueTableFields.filter(
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

  const metrics = [
    {
      label: "Open Issues",
      value: countWhere(rows, (row) =>
        ["Open", "Assigned", "In Progress", "Waiting on Info"].includes(
          String(row.status || "")
        )
      ),
      description: "Issues that still need action or follow-up.",
    },
    {
      label: "Resolved / Closed",
      value: countWhere(rows, (row) =>
        ["Resolved", "Closed"].includes(String(row.status || ""))
      ),
      description: "Issues that have been resolved or closed.",
    },
    {
      label: "Critical / High",
      value: countWhere(rows, (row) =>
        ["Critical", "High"].includes(String(row.impact_level || ""))
      ),
      description: "Issues with the highest operational impact.",
    },
    {
      label: "Linked Follow-Ups",
      value: countWhere(
        rows,
        (row) => Boolean(row.linked_task) || Boolean(row.link_to_daily_huddle)
      ),
      description: "Issues connected to tasks or daily huddle records.",
    },
  ];

  async function loadEverything() {
    await Promise.all([loadRows(), loadEmployees(), loadTasks(), loadDailyHuddles()]);
  }

  async function loadRows() {
    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("issues_breakdowns")
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

  async function loadEmployees() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("employees")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setEmployees((data as Employee[]) || []);
  }

  async function loadTasks() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("tasks")
      .select("id, task_title, status, priority, assigned_to, due_date, description, notes")
      .order("id", { ascending: false })
      .limit(500);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setTasks((data as TaskRecord[]) || []);
  }

  async function loadDailyHuddles() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("daily_operations_logs")
      .select("*")
      .order("id", { ascending: false })
      .limit(500);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setDailyHuddles((data as DailyHuddleRecord[]) || []);
  }

  function getRowId(row: RowData) {
    return String(row.id || "");
  }

  function getEditableField(fieldKey: string) {
    return editableCellFields.find((field) => field.key === fieldKey);
  }

  function getEmployeeName(value: string | number | boolean | null | undefined) {
    if (!value) return "—";

    const employee = employees.find((item) => item.id === Number(value));

    return employee?.name || `Employee #${value}`;
  }

  function getTaskLabel(value: string | number | boolean | null | undefined) {
    if (!value) return "—";

    const task = tasks.find((item) => item.id === Number(value));

    return task?.task_title || `Task #${value}`;
  }

  function getDailyHuddleLabel(value: string | number | boolean | null | undefined) {
    if (!value) return "—";

    const huddle = dailyHuddles.find((item) => Number(item.id) === Number(value));

    if (!huddle) return `Daily Huddle #${value}`;

    return `Daily Huddle #${huddle.id}${huddle.log_date ? ` · ${formatDate(huddle.log_date)}` : ""}`;
  }

  function getLinkedTask(value: string | number | boolean | null | undefined) {
    if (!value) return null;

    return tasks.find((task) => task.id === Number(value)) || null;
  }

  function getLinkedHuddle(value: string | number | boolean | null | undefined) {
    if (!value) return null;

    return dailyHuddles.find((huddle) => Number(huddle.id) === Number(value)) || null;
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

  function startInlineEdit(row: RowData, fieldKey: string) {
    const rowId = getRowId(row);
    const field = getEditableField(fieldKey);

    if (!rowId || !field) return;

    setMessage("");
    setErrorMessage("");
    setRowActionMenuId(null);
    setActiveCell({ rowId, fieldKey });

    const value = row[fieldKey];

    setCellValue(value === null || value === undefined ? "" : String(value));
  }

  async function saveInlineCell() {
    if (!activeCell) return;

    const field = getEditableField(activeCell.fieldKey);

    if (!field) return;

    setMessage("");
    setErrorMessage("");

    let valueToSave: string | number | null = cellValue || null;

    if (["employee", "task", "daily_huddle"].includes(field.type)) {
      valueToSave = valueToNumberOrNull(cellValue);
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("issues_breakdowns")
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

  function openAddModal() {
    setDraft({ ...initialDraft });
    setActiveRecord(null);
    setModalMode("add");
    setMessage("");
    setErrorMessage("");
  }

  function openRecordModal(row: RowData, mode: ModalMode) {
    setActiveRecord(row);
    setDraft({
      issue_name: row.issue_name || "",
      date_identified: row.date_identified || "",
      impact_level: row.impact_level || "",
      status: row.status || "",
      priority: row.priority || "",
      submitted_by: row.submitted_by || null,
      description: row.description || "",
      linked_task: row.linked_task || null,
      link_to_daily_huddle: row.link_to_daily_huddle || null,
      resolution_description: row.resolution_description || "",
      resolve_close_date: row.resolve_close_date || "",
      ending_notes: row.ending_notes || "",
    });
    setModalMode(mode);
    setRowActionMenuId(null);
    setMessage("");
    setErrorMessage("");
  }

  function closeMainModal() {
    setModalMode(null);
    setActiveRecord(null);
    setDraft({ ...initialDraft });
  }

  function updateDraft(key: string, value: string) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function buildPayload(source: RowData) {
    return {
      issue_name: source.issue_name || null,
      date_identified: source.date_identified || null,
      impact_level: source.impact_level || null,
      status: source.status || null,
      priority: source.priority || null,
      submitted_by: valueToNumberOrNull(source.submitted_by),
      description: source.description || null,
      linked_task: valueToNumberOrNull(source.linked_task),
      link_to_daily_huddle: valueToNumberOrNull(source.link_to_daily_huddle),
      resolution_description: source.resolution_description || null,
      resolve_close_date: source.resolve_close_date || null,
      ending_notes: source.ending_notes || null,
    };
  }

  async function saveDraft() {
    setMessage("");
    setErrorMessage("");

    if (!draft.issue_name) {
      setErrorMessage("Issue Name is required.");
      return;
    }

    const supabase = createClient();

    const response =
      modalMode === "add"
        ? await supabase.from("issues_breakdowns").insert(buildPayload(draft))
        : await supabase
            .from("issues_breakdowns")
            .update(buildPayload(draft))
            .eq("id", activeRecord?.id as string | number);

    if (response.error) {
      setErrorMessage(response.error.message);
      return;
    }

    setMessage(modalMode === "add" ? "Issue added." : "Issue updated.");
    closeMainModal();
    await loadRows();
  }

  function buildDuplicatePayload(row: RowData) {
    return {
      issue_name: row.issue_name || null,
      date_identified: row.date_identified || null,
      impact_level: row.impact_level || null,
      status: row.status || null,
      priority: row.priority || null,
      submitted_by: row.submitted_by || null,
      description: row.description || null,
      linked_task: row.linked_task || null,
      link_to_daily_huddle: row.link_to_daily_huddle || null,
      resolution_description: row.resolution_description || null,
      resolve_close_date: row.resolve_close_date || null,
      ending_notes: row.ending_notes || null,
    };
  }

  async function duplicateRecord(row: RowData) {
    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("issues_breakdowns")
      .insert(buildDuplicatePayload(row));

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Issue duplicated.");
    setRowActionMenuId(null);
    await loadRows();
  }

  async function deleteRecord(row: RowData) {
    const rowId = row.id;

    if (!rowId) return;

    const confirmed = window.confirm("Delete this issue? This cannot be undone.");

    if (!confirmed) return;

    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("issues_breakdowns")
      .delete()
      .eq("id", rowId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Issue deleted.");
    setRowActionMenuId(null);
    setSelectedRowIds((current) => current.filter((id) => id !== String(rowId)));
    await loadRows();
  }

  async function bulkDuplicateRecords() {
    if (selectedRows.length === 0) return;

    const confirmed = window.confirm(`Duplicate ${selectedRows.length} selected issue(s)?`);

    if (!confirmed) return;

    setMessage("");
    setErrorMessage("");

    const payloads = selectedRows.map(buildDuplicatePayload);

    const supabase = createClient();

    const { error } = await supabase.from("issues_breakdowns").insert(payloads);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`${selectedRows.length} issue(s) duplicated.`);
    setSelectedRowIds([]);
    await loadRows();
  }

  async function bulkDeleteRecords() {
    if (selectedRows.length === 0) return;

    const confirmed = window.confirm(
      `Delete ${selectedRows.length} selected issue(s)? This cannot be undone.`
    );

    if (!confirmed) return;

    const ids = selectedRows
      .map((row) => row.id)
      .filter((id): id is string | number => typeof id === "string" || typeof id === "number");

    if (ids.length === 0) return;

    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("issues_breakdowns")
      .delete()
      .in("id", ids);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`${selectedRows.length} issue(s) deleted.`);
    setSelectedRowIds([]);
    await loadRows();
  }

  async function bulkUpdateRecords() {
    if (selectedRows.length === 0) return;

    if (!bulkUpdateFieldKey || !bulkUpdateValue) {
      setErrorMessage("Choose a field and value before applying a bulk update.");
      return;
    }

    const confirmed = window.confirm(`Update ${selectedRows.length} selected issue(s)?`);

    if (!confirmed) return;

    const ids = selectedRows
      .map((row) => row.id)
      .filter((id): id is string | number => typeof id === "string" || typeof id === "number");

    if (ids.length === 0) return;

    const field = bulkUpdateFields.find((item) => item.key === bulkUpdateFieldKey);

    if (!field) return;

    let valueToSave: string | number | null = bulkUpdateValue;

    if (["employee", "task", "daily_huddle"].includes(field.type)) {
      valueToSave = valueToNumberOrNull(bulkUpdateValue);
    }

    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("issues_breakdowns")
      .update({ [field.key]: valueToSave })
      .in("id", ids);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`${selectedRows.length} issue(s) updated.`);
    setSelectedRowIds([]);
    await loadRows();
  }

  function exportCsv() {
    const fields = [
      "issue_name",
      "date_identified",
      "impact_level",
      "status",
      "priority",
      "submitted_by",
      "description",
      "linked_task",
      "link_to_daily_huddle",
      "resolution_description",
      "resolve_close_date",
      "ending_notes",
    ];

    const csvRows = rows.map((row) =>
      fields.map((field) => escapeCsvValue(row[field])).join(",")
    );

    const csv = [fields.join(","), ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "issues-breakdowns-export.csv";
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

    const fields = [
      "issue_name",
      "date_identified",
      "impact_level",
      "status",
      "priority",
      "submitted_by",
      "description",
      "linked_task",
      "link_to_daily_huddle",
      "resolution_description",
      "resolve_close_date",
      "ending_notes",
    ];

    const payloads = parsed.rows.map((csvRow) => {
      const payload: RowData = {};

      fields.forEach((field) => {
        const matchingHeader =
          parsed.headers.find((header) => header.toLowerCase() === field.toLowerCase()) ||
          "";

        const value = matchingHeader ? csvRow[matchingHeader] || "" : "";

        if (["submitted_by", "linked_task", "link_to_daily_huddle"].includes(field)) {
          payload[field] = value ? Number(value) : null;
          return;
        }

        payload[field] = value || null;
      });

      return payload;
    });

    const supabase = createClient();

    const { error } = await supabase.from("issues_breakdowns").insert(payloads);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`${payloads.length} issue(s) imported.`);
    await loadRows();
  }

  function resetBulkValueForField(fieldKey: string) {
    const field = bulkUpdateFields.find((item) => item.key === fieldKey);

    setBulkUpdateFieldKey(fieldKey);

    if (!field) {
      setBulkUpdateValue("");
      return;
    }

    if (field.type === "select") {
      setBulkUpdateValue(field.options?.[0]?.value || "");
      return;
    }

    setBulkUpdateValue("");
  }

  function renderOptionsForField(field: EditableCellField | BulkUpdateField) {
    if (field.type === "select") {
      return (field.options || []).map((option) => (
        <option key={option.value} value={option.value} title={option.description}>
          {option.label}
        </option>
      ));
    }

    if (field.type === "employee") {
      return employees.map((employee) => (
        <option key={employee.id} value={employee.id}>
          {employee.name || `Employee #${employee.id}`}
        </option>
      ));
    }

    if (field.type === "task") {
      return tasks.map((task) => (
        <option key={task.id} value={task.id}>
          {task.task_title || `Task #${task.id}`}
        </option>
      ));
    }

    if (field.type === "daily_huddle") {
      return dailyHuddles.map((huddle) => (
        <option key={String(huddle.id)} value={String(huddle.id)}>
          {getDailyHuddleLabel(huddle.id)}
        </option>
      ));
    }

    return null;
  }

  function renderIssueTableCell(row: RowData, field: IssueTableField) {
    if (field.key === "issue_name") {
      return renderEditableCell(
        row,
        "issue_name",
        String(row.issue_name || "Untitled issue")
      );
    }

    if (field.key === "date_identified") {
      return formatDate(row.date_identified);
    }

    if (field.key === "impact_level") {
      return (
        <>
          {renderEditableCell(row, "impact_level", String(row.impact_level || "—"))}
          <small style={tableHelpStyle}>
            {getOptionDescription(impactOptions, row.impact_level)}
          </small>
        </>
      );
    }

    if (field.key === "status") {
      return (
        <>
          {renderEditableCell(row, "status", String(row.status || "Open"))}
          <small style={tableHelpStyle}>
            {getOptionDescription(statusOptions, row.status)}
          </small>
        </>
      );
    }

    if (field.key === "priority") {
      return (
        <>
          {renderEditableCell(row, "priority", String(row.priority || "Important"))}
          <small style={tableHelpStyle}>
            {getOptionDescription(priorityOptions, row.priority)}
          </small>
        </>
      );
    }

    if (field.key === "submitted_by") {
      return renderEditableCell(row, "submitted_by", getEmployeeName(row.submitted_by));
    }

    if (field.key === "linked_task") {
      const linkedTask = getLinkedTask(row.linked_task);

      return (
        <div style={linkedCellStackStyle}>
          {renderEditableCell(row, "linked_task", getTaskLabel(row.linked_task))}

          {linkedTask ? (
            <button
              type="button"
              onClick={() => setLinkedTaskModal(linkedTask)}
              style={linkedOpenButtonStyle}
            >
              Open task
            </button>
          ) : null}
        </div>
      );
    }

    if (field.key === "link_to_daily_huddle") {
      const linkedHuddle = getLinkedHuddle(row.link_to_daily_huddle);

      return (
        <div style={linkedCellStackStyle}>
          {renderEditableCell(
            row,
            "link_to_daily_huddle",
            getDailyHuddleLabel(row.link_to_daily_huddle)
          )}

          {linkedHuddle ? (
            <button
              type="button"
              onClick={() => setLinkedHuddleModal(linkedHuddle)}
              style={linkedOpenButtonStyle}
            >
              Open huddle
            </button>
          ) : null}
        </div>
      );
    }

    if (field.key === "resolve_close_date") {
      return renderEditableCell(
        row,
        "resolve_close_date",
        formatDate(row.resolve_close_date)
      );
    }

    const value = row[field.key];

    if (value === null || value === undefined || value === "") {
      return "—";
    }

    return String(value);
  }

  function renderEditableCell(row: RowData, fieldKey: string, displayValue: string) {
    const rowId = getRowId(row);
    const field = getEditableField(fieldKey);
    const isEditing =
      activeCell?.rowId === rowId && activeCell?.fieldKey === fieldKey;

    if (!field) {
      return displayValue;
    }

    if (isEditing) {
      return (
        <div style={inlineEditWrapStyle}>
          {field.type === "select" ||
          field.type === "employee" ||
          field.type === "task" ||
          field.type === "daily_huddle" ? (
            <select
              value={cellValue}
              onChange={(event) => setCellValue(event.target.value)}
              onBlur={saveInlineCell}
              autoFocus
              style={inlineInputStyle}
            >
              <option value="">Select</option>
              {renderOptionsForField(field)}
            </select>
          ) : null}

          {field.type === "date" ? (
            <input
              type="date"
              value={cellValue}
              onChange={(event) => setCellValue(event.target.value)}
              onBlur={saveInlineCell}
              autoFocus
              style={inlineInputStyle}
            />
          ) : null}

          {field.type === "text" ? (
            <input
              type="text"
              value={cellValue}
              onChange={(event) => setCellValue(event.target.value)}
              onBlur={saveInlineCell}
              autoFocus
              style={inlineInputStyle}
            />
          ) : null}

          <button type="button" onMouseDown={saveInlineCell} style={miniSaveButtonStyle}>
            Save
          </button>

          <button type="button" onMouseDown={cancelInlineEdit} style={miniCancelButtonStyle}>
            Cancel
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => startInlineEdit(row, fieldKey)}
        style={editableCellButtonStyle}
        title={`${field.description}${field.options ? "\n\n" + field.options.map((option) => `${option.label}: ${option.description}`).join("\n") : ""}`}
      >
        {displayValue}
      </button>
    );
  }

  function renderOptionHelp(options: OptionDefinition[], value: string | number | boolean | null | undefined) {
    const description = getOptionDescription(options, value);

    if (!description) return null;

    return <small style={optionHelpStyle}>{description}</small>;
  }

  function renderDraftForm() {
    return (
      <div style={modalFormStyle}>
        <section style={formSectionStyle}>
          <div style={formSectionHeaderStyle}>
            <div>
              <div style={sectionEyebrowStyle}>SECTION 1</div>
              <h3 style={formSectionTitleStyle}>Issue Details</h3>
            </div>
            <p style={sectionHelpStyle}>
              Start with the issue name, date, impact, status, and priority.
            </p>
          </div>

          <div style={formGridStyle}>
            <label style={fieldStyle}>
              Issue Name
              <small style={helpTextStyle}>
                Short name of the issue or breakdown. Make it clear and easy to recognize.
              </small>
              <input
                value={String(draft.issue_name || "")}
                onChange={(event) => updateDraft("issue_name", event.target.value)}
                style={inputStyle}
              />
            </label>

            <label style={fieldStyle}>
              Date Identified
              <small style={helpTextStyle}>
                The date the issue was first noticed, reported, or confirmed.
              </small>
              <input
                type="date"
                value={String(draft.date_identified || "")}
                onChange={(event) => updateDraft("date_identified", event.target.value)}
                style={inputStyle}
              />
            </label>

            <label style={fieldStyle}>
              Impact Level
              <small style={helpTextStyle}>
                How much the issue affects operations, patients, money, deadlines, team flow, or leadership priorities.
              </small>
              <select
                value={String(draft.impact_level || "")}
                onChange={(event) => updateDraft("impact_level", event.target.value)}
                style={inputStyle}
              >
                <option value="">Select impact</option>
                {impactOptions.map((option) => (
                  <option key={option.value} value={option.value} title={option.description}>
                    {option.label}
                  </option>
                ))}
              </select>
              {renderOptionHelp(impactOptions, draft.impact_level)}
            </label>

            <label style={fieldStyle}>
              Status
              <small style={helpTextStyle}>
                Where the issue currently sits in the resolution process.
              </small>
              <select
                value={String(draft.status || "")}
                onChange={(event) => updateDraft("status", event.target.value)}
                style={inputStyle}
              >
                <option value="">Select status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value} title={option.description}>
                    {option.label}
                  </option>
                ))}
              </select>
              {renderOptionHelp(statusOptions, draft.status)}
            </label>

            <label style={fieldStyle}>
              Priority
              <small style={helpTextStyle}>
                How soon this needs attention compared with other work.
              </small>
              <select
                value={String(draft.priority || "")}
                onChange={(event) => updateDraft("priority", event.target.value)}
                style={inputStyle}
              >
                <option value="">Select priority</option>
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value} title={option.description}>
                    {option.label}
                  </option>
                ))}
              </select>
              {renderOptionHelp(priorityOptions, draft.priority)}
            </label>

            <label style={fieldStyle}>
              Submitted By
              <small style={helpTextStyle}>
                The team member who logged or submitted this issue.
              </small>
              <select
                value={String(draft.submitted_by || "")}
                onChange={(event) => updateDraft("submitted_by", event.target.value)}
                style={inputStyle}
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name || `Employee #${employee.id}`}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label style={fieldStyle}>
            Description
            <small style={helpTextStyle}>
              Explain what happened, what is broken, who or what is affected, and why this issue matters.
            </small>
            <textarea
              value={String(draft.description || "")}
              onChange={(event) => updateDraft("description", event.target.value)}
              style={textareaStyle}
            />
          </label>
        </section>

        <section style={formSectionStyle}>
          <div style={formSectionHeaderStyle}>
            <div>
              <div style={sectionEyebrowStyle}>SECTION 2</div>
              <h3 style={formSectionTitleStyle}>Linked Follow-Up</h3>
            </div>
            <p style={sectionHelpStyle}>
              Connect this issue to a task or daily huddle so the follow-up is easy to find.
            </p>
          </div>

          <div style={formGridStyle}>
            <label style={fieldStyle}>
              Linked Task
              <small style={helpTextStyle}>
                The task connected to this issue. Use this when a task owns the follow-up work.
              </small>
              <select
                value={String(draft.linked_task || "")}
                onChange={(event) => updateDraft("linked_task", event.target.value)}
                style={inputStyle}
              >
                <option value="">No linked task</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.task_title || `Task #${task.id}`}
                  </option>
                ))}
              </select>
            </label>

            <label style={fieldStyle}>
              Link to Daily Huddle
              <small style={helpTextStyle}>
                The daily huddle record connected to this issue. Use this when the issue came from a huddle discussion.
              </small>
              <select
                value={String(draft.link_to_daily_huddle || "")}
                onChange={(event) => updateDraft("link_to_daily_huddle", event.target.value)}
                style={inputStyle}
              >
                <option value="">No linked huddle</option>
                {dailyHuddles.map((huddle) => (
                  <option key={String(huddle.id)} value={String(huddle.id)}>
                    {getDailyHuddleLabel(huddle.id)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section style={formSectionStyle}>
          <div style={formSectionHeaderStyle}>
            <div>
              <div style={sectionEyebrowStyle}>SECTION 3</div>
              <h3 style={formSectionTitleStyle}>Resolution and Closeout</h3>
            </div>
            <p style={sectionHelpStyle}>
              Fill this in once action has been taken or the issue is ready to close.
            </p>
          </div>

          <div style={formGridStyle}>
            <label style={fieldStyle}>
              Resolve / Close Date
              <small style={helpTextStyle}>
                The date the issue was resolved or fully closed.
              </small>
              <input
                type="date"
                value={String(draft.resolve_close_date || "")}
                onChange={(event) => updateDraft("resolve_close_date", event.target.value)}
                style={inputStyle}
              />
            </label>
          </div>

          <label style={fieldStyle}>
            Resolution Description
            <small style={helpTextStyle}>
              Explain what was done to fix or address the issue.
            </small>
            <textarea
              value={String(draft.resolution_description || "")}
              onChange={(event) => updateDraft("resolution_description", event.target.value)}
              style={textareaStyle}
            />
          </label>

          <label style={fieldStyle}>
            Ending Notes
            <small style={helpTextStyle}>
              Final notes, remaining follow-up, lessons learned, or anything the team should remember.
            </small>
            <textarea
              value={String(draft.ending_notes || "")}
              onChange={(event) => updateDraft("ending_notes", event.target.value)}
              style={textareaStyle}
            />
          </label>
        </section>
      </div>
    );
  }

  function renderReadOnlyRecord() {
    if (!activeRecord) return null;

    return (
      <div style={modalFormStyle}>
        <section style={formSectionStyle}>
          <div style={formSectionHeaderStyle}>
            <div>
              <div style={sectionEyebrowStyle}>SECTION 1</div>
              <h3 style={formSectionTitleStyle}>Issue Details</h3>
            </div>
            <p style={sectionHelpStyle}>
              Read-only summary of the issue. Use Edit if you need to change it.
            </p>
          </div>

          <div style={linkedGridStyle}>
            <InfoBox label="Issue Name" value={activeRecord.issue_name} helper="The short name of the issue or breakdown." />
            <InfoBox label="Date Identified" value={formatDate(activeRecord.date_identified)} helper="The date the issue was first noticed, reported, or confirmed." />
            <InfoBox label="Impact Level" value={activeRecord.impact_level} helper={getOptionDescription(impactOptions, activeRecord.impact_level)} />
            <InfoBox label="Status" value={activeRecord.status} helper={getOptionDescription(statusOptions, activeRecord.status)} />
            <InfoBox label="Priority" value={activeRecord.priority} helper={getOptionDescription(priorityOptions, activeRecord.priority)} />
            <InfoBox label="Submitted By" value={getEmployeeName(activeRecord.submitted_by)} helper="The team member who logged or submitted the issue." />
            <InfoBox label="Description" value={activeRecord.description} helper="What happened, what is broken, who or what is affected, and why this issue matters." large />
          </div>
        </section>

        <section style={formSectionStyle}>
          <div style={formSectionHeaderStyle}>
            <div>
              <div style={sectionEyebrowStyle}>SECTION 2</div>
              <h3 style={formSectionTitleStyle}>Linked Follow-Up</h3>
            </div>
            <p style={sectionHelpStyle}>
              Linked records connected to this issue.
            </p>
          </div>

          <div style={linkedGridStyle}>
            <InfoBox label="Linked Task" value={getTaskLabel(activeRecord.linked_task)} helper="The task connected to this issue." />
            <InfoBox label="Link to Daily Huddle" value={getDailyHuddleLabel(activeRecord.link_to_daily_huddle)} helper="The daily huddle record connected to this issue." />
          </div>

          <div style={buttonRowStyle}>
            {getLinkedTask(activeRecord.linked_task) ? (
              <button
                type="button"
                onClick={() => setLinkedTaskModal(getLinkedTask(activeRecord.linked_task))}
                style={secondaryButtonStyle}
              >
                Open Linked Task
              </button>
            ) : null}

            {getLinkedHuddle(activeRecord.link_to_daily_huddle) ? (
              <button
                type="button"
                onClick={() => setLinkedHuddleModal(getLinkedHuddle(activeRecord.link_to_daily_huddle))}
                style={secondaryButtonStyle}
              >
                Open Linked Huddle
              </button>
            ) : null}
          </div>
        </section>

        <section style={formSectionStyle}>
          <div style={formSectionHeaderStyle}>
            <div>
              <div style={sectionEyebrowStyle}>SECTION 3</div>
              <h3 style={formSectionTitleStyle}>Resolution and Closeout</h3>
            </div>
            <p style={sectionHelpStyle}>
              Review what was done and whether the issue has been closed.
            </p>
          </div>

          <div style={linkedGridStyle}>
            <InfoBox label="Resolve / Close Date" value={formatDate(activeRecord.resolve_close_date)} helper="The date the issue was resolved or fully closed." />
            <InfoBox label="Resolution Description" value={activeRecord.resolution_description} helper="What was done to fix or address the issue." large />
            <InfoBox label="Ending Notes" value={activeRecord.ending_notes} helper="Final notes, remaining follow-up, lessons learned, or anything the team should remember." large />
          </div>
        </section>
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
          <a href="/?table=issues_breakdowns" style={backLinkStyle}>
            ← Back
          </a>

          <div style={eyebrowStyle}>PRACTICE FOUNDER · DAILY ON-CALL AND ISSUES LOG</div>
          <h1 style={titleStyle}>Issues / Breakdowns Manager</h1>
          <p style={descriptionStyle}>
            Track problems, blockers, breakdowns, ownership, linked follow-up, and resolution notes.
          </p>
        </div>

        <div style={headerActionsStyle}>
          <button type="button" onClick={openAddModal} style={primaryButtonStyle}>
            + Add Issue
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
              placeholder="Find issues"
              style={searchInputStyle}
            />
          </div>

          <button type="button" onClick={loadEverything} style={refreshButtonStyle}>
            Refresh
          </button>
        </div>

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

                <button type="button" onClick={() => setSelectedRowIds([])} style={secondaryButtonStyle}>
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
                  {bulkUpdateFields.map((field) => (
                    <option key={field.key} value={field.key}>
                      {field.label}
                    </option>
                  ))}
                </select>
                <small style={bulkHelpStyle}>{selectedBulkField.description}</small>
              </label>

              <label style={bulkLabelStyle}>
                New value
                {selectedBulkField.type === "select" ||
                selectedBulkField.type === "employee" ||
                selectedBulkField.type === "task" ||
                selectedBulkField.type === "daily_huddle" ? (
                  <select
                    value={bulkUpdateValue}
                    onChange={(event) => setBulkUpdateValue(event.target.value)}
                    style={bulkInputStyle}
                  >
                    <option value="">Select</option>
                    {renderOptionsForField(selectedBulkField)}
                  </select>
                ) : null}

                {selectedBulkField.type === "select" && selectedBulkField.options ? (
                  <small style={bulkHelpStyle}>
                    {getOptionDescription(selectedBulkField.options, bulkUpdateValue)}
                  </small>
                ) : null}

                {selectedBulkField.type === "date" ? (
                  <input
                    type="date"
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

        {loading ? <div style={loadingStyle}>Loading issues...</div> : null}

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
                  const linkedTask = getLinkedTask(row.linked_task);
                  const linkedHuddle = getLinkedHuddle(row.link_to_daily_huddle);

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

                      <td style={tdStyle}>
                        {renderEditableCell(row, "issue_name", String(row.issue_name || "Untitled issue"))}
                      </td>

                      <td style={tdStyle}>{formatDate(row.date_identified)}</td>

                      <td style={tdStyle}>
                        {renderEditableCell(row, "impact_level", String(row.impact_level || "—"))}
                        <small style={tableHelpStyle}>{getOptionDescription(impactOptions, row.impact_level)}</small>
                      </td>

                      <td style={tdStyle}>
                        {renderEditableCell(row, "status", String(row.status || "Open"))}
                        <small style={tableHelpStyle}>{getOptionDescription(statusOptions, row.status)}</small>
                      </td>

                      <td style={tdStyle}>
                        {renderEditableCell(row, "priority", String(row.priority || "Important"))}
                        <small style={tableHelpStyle}>{getOptionDescription(priorityOptions, row.priority)}</small>
                      </td>

                      <td style={tdStyle}>
                        {renderEditableCell(row, "submitted_by", getEmployeeName(row.submitted_by))}
                      </td>

                      <td style={tdStyle}>
                        <div style={linkedCellStackStyle}>
                          {renderEditableCell(row, "linked_task", getTaskLabel(row.linked_task))}

                          {linkedTask ? (
                            <button
                              type="button"
                              onClick={() => setLinkedTaskModal(linkedTask)}
                              style={linkedOpenButtonStyle}
                            >
                              Open task
                            </button>
                          ) : null}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div style={linkedCellStackStyle}>
                          {renderEditableCell(row, "link_to_daily_huddle", getDailyHuddleLabel(row.link_to_daily_huddle))}

                          {linkedHuddle ? (
                            <button
                              type="button"
                              onClick={() => setLinkedHuddleModal(linkedHuddle)}
                              style={linkedOpenButtonStyle}
                            >
                              Open huddle
                            </button>
                          ) : null}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        {renderEditableCell(row, "resolve_close_date", formatDate(row.resolve_close_date))}
                      </td>

                      <td style={tdStyle}>
                        <div style={actionMenuWrapStyle} onClick={(event) => event.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setRowActionMenuId(rowActionMenuId === rowId ? null : rowId)}
                            style={actionMenuButtonStyle}
                            aria-label="Open row actions"
                          >
                            ⋯
                          </button>

                          {rowActionMenuId === rowId ? (
                            <div style={actionDropdownStyle}>
                              <button
                                type="button"
                                onClick={() => openRecordModal(row, "open")}
                                style={actionDropdownButtonStyle}
                              >
                                Open
                              </button>

                              <button
                                type="button"
                                onClick={() => openRecordModal(row, "edit")}
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
              <div style={emptyStateStyle}>No issues match this view.</div>
            ) : null}
          </div>
        ) : null}
      </section>

      {modalMode ? (
        <div style={modalBackdropStyle} onClick={closeMainModal}>
          <section style={largeModalStyle} onClick={(event) => event.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <div style={eyebrowStyle}>
                  {modalMode === "add"
                    ? "ADD RECORD"
                    : modalMode === "edit"
                      ? "EDIT RECORD"
                      : "OPEN RECORD"}
                </div>
                <h2 style={modalTitleStyle}>
                  {modalMode === "add"
                    ? "Add Issue"
                    : `Issue #${activeRecord?.id || ""}`}
                </h2>
                <p style={modalIntroStyle}>
                  {modalMode === "open"
                    ? "This is a read-only review view. Use Edit if you need to change the record."
                    : "Use the sections below to capture the issue, link follow-up, and document the resolution."}
                </p>
              </div>

              <button type="button" onClick={closeMainModal} style={secondaryButtonStyle}>
                Close
              </button>
            </div>

            {modalMode === "open" ? renderReadOnlyRecord() : renderDraftForm()}

            <div style={modalFooterStyle}>
              {modalMode === "open" ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeRecord) openRecordModal(activeRecord, "edit");
                  }}
                  style={primaryButtonStyle}
                >
                  Edit This Issue
                </button>
              ) : (
                <button type="button" onClick={saveDraft} style={primaryButtonStyle}>
                  {modalMode === "add" ? "Create Issue" : "Save Issue"}
                </button>
              )}

              <button type="button" onClick={closeMainModal} style={secondaryButtonStyle}>
                Close
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {linkedTaskModal ? (
        <div style={modalBackdropStyle} onClick={() => setLinkedTaskModal(null)}>
          <section style={linkedModalStyle} onClick={(event) => event.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <div style={eyebrowStyle}>LINKED TASK</div>
                <h2 style={modalTitleStyle}>
                  {linkedTaskModal.task_title || `Task #${linkedTaskModal.id}`}
                </h2>
              </div>

              <button type="button" onClick={() => setLinkedTaskModal(null)} style={secondaryButtonStyle}>
                Close
              </button>
            </div>

            <div style={linkedGridStyle}>
              <InfoBox label="Task ID" value={linkedTaskModal.id} helper="The unique ID for this task." />
              <InfoBox label="Status" value={linkedTaskModal.status} helper="Where the task currently sits in its workflow." />
              <InfoBox label="Priority" value={linkedTaskModal.priority} helper="How soon the task needs attention." />
              <InfoBox label="Assigned To" value={getEmployeeName(linkedTaskModal.assigned_to)} helper="The team member responsible for the task." />
              <InfoBox label="Due Date" value={formatDate(linkedTaskModal.due_date)} helper="The date the task should be completed." />
              <InfoBox label="Description" value={linkedTaskModal.description} helper="The details or instructions for the task." large />
              <InfoBox label="Notes" value={linkedTaskModal.notes} helper="Additional task notes." large />
            </div>
          </section>
        </div>
      ) : null}

      {linkedHuddleModal ? (
        <div style={modalBackdropStyle} onClick={() => setLinkedHuddleModal(null)}>
          <section style={linkedModalStyle} onClick={(event) => event.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <div style={eyebrowStyle}>LINKED DAILY HUDDLE</div>
                <h2 style={modalTitleStyle}>
                  Daily Huddle #{linkedHuddleModal.id}
                </h2>
              </div>

              <button type="button" onClick={() => setLinkedHuddleModal(null)} style={secondaryButtonStyle}>
                Close
              </button>
            </div>

            <div style={linkedGridStyle}>
              <InfoBox label="Log Date" value={formatDate(linkedHuddleModal.log_date)} helper="The date of the daily operations log." />
              <InfoBox label="Overall Status" value={linkedHuddleModal.overall_status} helper="The overall status of the daily operations log." />
              <InfoBox label="Huddle Completed" value={String(linkedHuddleModal.huddle_completed || "No")} helper="Whether the daily huddle was completed." />
              <InfoBox label="Huddle Lead" value={getEmployeeName(linkedHuddleModal.huddle_lead)} helper="The person who led the daily huddle." />
              <InfoBox label="Open Issues Review" value={linkedHuddleModal.huddle_open_issues_review} helper="Issues discussed during the huddle." large />
              <InfoBox label="Action Today" value={linkedHuddleModal.huddle_action_today} helper="Actions assigned for the day." large />
              <InfoBox label="Escalated Items" value={linkedHuddleModal.huddle_escalated_items} helper="Items escalated from the huddle." large />
              <InfoBox label="Huddle Notes" value={linkedHuddleModal.huddle_notes} helper="Additional huddle notes." large />
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

function InfoBox({
  label,
  value,
  helper,
  large,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
  helper: string;
  large?: boolean;
}) {
  return (
    <div style={large ? { ...infoBoxStyle, gridColumn: "1 / -1" } : infoBoxStyle}>
      <div style={infoLabelStyle}>{label}</div>
      <div style={infoValueStyle}>
        {value === null || value === undefined || value === "" ? "—" : String(value)}
      </div>
      <small style={infoHelperStyle}>{helper}</small>
    </div>
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
  lineHeight: 1.4,
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

const tableHelpStyle: CSSProperties = {
  display: "block",
  marginTop: "5px",
  color: colors.slate,
  fontSize: "11px",
  lineHeight: 1.35,
  maxWidth: "240px",
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

const linkedCellStackStyle: CSSProperties = {
  display: "grid",
  gap: "6px",
};

const linkedOpenButtonStyle: CSSProperties = {
  border: "none",
  background: colors.goldPale,
  color: colors.navy,
  borderRadius: "8px",
  padding: "6px 8px",
  fontWeight: 800,
  cursor: "pointer",
  width: "fit-content",
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
  width: "min(1100px, 100%)",
  maxHeight: "92vh",
  overflowY: "auto",
  background: colors.cream,
  border: `1px solid ${colors.border}`,
  boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
  padding: "24px",
};

const linkedModalStyle: CSSProperties = {
  width: "min(860px, 100%)",
  maxHeight: "90vh",
  overflowY: "auto",
  background: colors.white,
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

const modalFooterStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "16px",
  position: "sticky",
  bottom: "0",
};

const modalFormStyle: CSSProperties = {
  display: "grid",
  gap: "18px",
};

const formSectionStyle: CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "20px",
};

const formSectionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  borderBottom: `1px solid ${colors.border}`,
  paddingBottom: "12px",
  marginBottom: "16px",
};

const sectionEyebrowStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "10px",
  letterSpacing: "0.16em",
};

const formSectionTitleStyle: CSSProperties = {
  margin: "5px 0 0",
  fontFamily: "var(--font-playfair), serif",
  fontSize: "26px",
};

const sectionHelpStyle: CSSProperties = {
  color: colors.slate,
  maxWidth: "430px",
  lineHeight: 1.5,
  margin: 0,
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "14px",
};

const fieldStyle: CSSProperties = {
  display: "grid",
  gap: "6px",
  fontWeight: 800,
};

const helpTextStyle: CSSProperties = {
  color: colors.slate,
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: 1.4,
};

const optionHelpStyle: CSSProperties = {
  color: colors.slate,
  fontSize: "12px",
  fontWeight: 700,
  lineHeight: 1.4,
};

const inputStyle: CSSProperties = {
  height: "42px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "0 10px",
  color: colors.navy,
  background: colors.white,
};

const textareaStyle: CSSProperties = {
  minHeight: "120px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "10px",
  color: colors.navy,
  background: colors.white,
  fontFamily: "var(--font-dm-sans), Arial, sans-serif",
};

const linkedGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
};

const infoBoxStyle: CSSProperties = {
  background: colors.cream,
  border: `1px solid ${colors.border}`,
  padding: "12px",
};

const infoLabelStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "10px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  marginBottom: "6px",
};

const infoValueStyle: CSSProperties = {
  color: colors.navy,
  fontWeight: 700,
  whiteSpace: "pre-wrap",
};

const infoHelperStyle: CSSProperties = {
  display: "block",
  marginTop: "8px",
  color: colors.slate,
  fontSize: "12px",
  lineHeight: 1.4,
};