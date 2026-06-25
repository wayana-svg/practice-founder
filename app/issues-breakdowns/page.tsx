"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "../../lib/supabase/client";

type Employee = {
  id: number;
  name: string | null;
};

type TaskRecord = {
  id: number;
  task_title: string | null;
  status: string | null;
};

type DailyHuddleRecord = {
  id: number;
  log_date: string | null;
  overall_status: string | null;
};

type FormState = {
  issue_name: string;
  date_identified: string;
  impact_level: string;
  status: string;
  priority: string;
  submitted_by: string;
  linked_task: string;
  link_to_daily_huddle: string;
  description: string;
  resolution_description: string;
  resolve_close_date: string;
  ending_notes: string;
};

const initialForm: FormState = {
  issue_name: "",
  date_identified: "",
  impact_level: "Medium",
  status: "Open",
  priority: "Important",
  submitted_by: "",
  linked_task: "",
  link_to_daily_huddle: "",
  description: "",
  resolution_description: "",
  resolve_close_date: "",
  ending_notes: "",
};

const impactOptions = [
  {
    value: "Critical",
    label: "Critical",
    description:
      "The issue is severely affecting operations, revenue, patient care, or leadership priorities and needs immediate attention.",
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
      "The issue matters, but the practice can continue operating while it is being resolved.",
  },
  {
    value: "Low",
    label: "Low",
    description:
      "The issue is minor, low-risk, or can be addressed after more important issues.",
  },
];

const statusOptions = [
  {
    value: "Open",
    label: "Open",
    description: "The issue has been logged and still needs action.",
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
      "Work has started to investigate or resolve the issue.",
  },
  {
    value: "Waiting on Info",
    label: "Waiting on Info",
    description:
      "The issue is paused because more information, approval, files, or feedback is needed.",
  },
  {
    value: "Resolved",
    label: "Resolved",
    description:
      "The issue has been fixed, but may still need final confirmation or notes.",
  },
  {
    value: "Closed",
    label: "Closed",
    description:
      "The issue is fully finished and no further action is needed.",
  },
];

const priorityOptions = [
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
      "This matters and should be handled, but may not be urgent today.",
  },
  {
    value: "Not Urgent",
    label: "Not Urgent",
    description:
      "This should be handled later, but does not need immediate attention.",
  },
  {
    value: "Low Priority",
    label: "Low Priority",
    description:
      "This can wait until more important issues are handled.",
  },
];

export default function IssuesBreakdownsPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [dailyHuddles, setDailyHuddles] = useState<DailyHuddleRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadEmployees();
    loadTasks();
    loadDailyHuddles();
  }, []);

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
      .select("id, task_title, status")
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
      .select("id, log_date, overall_status")
      .order("id", { ascending: false })
      .limit(500);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setDailyHuddles((data as DailyHuddleRecord[]) || []);
  }

  function updateField(key: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toNumberOrNull(value: string) {
    if (!value) return null;
    return Number(value);
  }

  function buildPayload() {
    return {
      issue_name: form.issue_name || null,
      date_identified: form.date_identified || null,
      impact_level: form.impact_level || null,
      status: form.status || null,
      priority: form.priority || null,
      submitted_by: toNumberOrNull(form.submitted_by),
      linked_task: toNumberOrNull(form.linked_task),
      link_to_daily_huddle: toNumberOrNull(form.link_to_daily_huddle),
      description: form.description || null,
      resolution_description: form.resolution_description || null,
      resolve_close_date: form.resolve_close_date || null,
      ending_notes: form.ending_notes || null,
    };
  }

  async function saveIssue() {
    setMessage("");
    setErrorMessage("");

    if (!form.issue_name.trim()) {
      setErrorMessage("Issue Name is required.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("issues_breakdowns")
      .insert(buildPayload());

    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Issue saved.");
    setForm(initialForm);
  }

  function getSelectedOptionDescription(
    options: { value: string; label: string; description: string }[],
    value: string
  ) {
    return options.find((option) => option.value === value)?.description || "";
  }

  return (
    <main style={pageStyle}>
      <section style={headerStyle}>
        <div>
          <a href="/?table=issues_breakdowns" style={backLinkStyle}>
            ← Back to Issues / Breakdowns
          </a>

          <div style={eyebrowStyle}>PRACTICE FOUNDER · ISSUES</div>
          <h1 style={titleStyle}>Add Issue / Breakdown</h1>
          <p style={descriptionStyle}>
            Log a problem, blocker, breakdown, risk, or follow-up item. Use the
            sections below so the team knows what happened, who owns it, and how
            it will be resolved.
          </p>
        </div>

        <a href="/" style={managerLinkStyle}>
          Open Manager
        </a>
      </section>

      {message ? <div style={successStyle}>{message}</div> : null}
      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      <section style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <div style={sectionEyebrowStyle}>SECTION 1</div>
            <h2 style={sectionTitleStyle}>Issue Details</h2>
          </div>

          <p style={sectionHelpStyle}>
            Fill this out first. This section explains what the issue is, when it
            was identified, how serious it is, and who logged it.
          </p>
        </div>

        <div style={fieldGridStyle}>
          <label style={fieldStyle}>
            <span style={labelRowStyle}>
              Issue Name <strong style={requiredStyle}>*</strong>
              <span title="The short name of the issue or breakdown." style={infoIconStyle}>
                i
              </span>
            </span>
            <small style={helpTextStyle}>
              The short name of the issue or breakdown. Write it clearly so the
              team can understand the problem quickly.
            </small>
            <input
              value={form.issue_name}
              onChange={(event) => updateField("issue_name", event.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={fieldStyle}>
            <span style={labelRowStyle}>
              Date Identified
              <span title="The date the issue was first noticed." style={infoIconStyle}>
                i
              </span>
            </span>
            <small style={helpTextStyle}>
              The date the issue was first noticed, reported, or confirmed.
            </small>
            <input
              type="date"
              value={form.date_identified}
              onChange={(event) =>
                updateField("date_identified", event.target.value)
              }
              style={inputStyle}
            />
          </label>

          <label style={fieldStyle}>
            <span style={labelRowStyle}>
              Impact Level
              <span title="How much the issue affects the practice." style={infoIconStyle}>
                i
              </span>
            </span>
            <small style={helpTextStyle}>
              How much the issue affects the practice, team, patients, money,
              operations, or deadlines.
            </small>
            <select
              value={form.impact_level}
              onChange={(event) => updateField("impact_level", event.target.value)}
              style={inputStyle}
            >
              <option value="">Select impact level</option>
              {impactOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small style={optionHelpStyle}>
              {getSelectedOptionDescription(impactOptions, form.impact_level)}
            </small>
          </label>

          <label style={fieldStyle}>
            <span style={labelRowStyle}>
              Status
              <span title="Where the issue is in the resolution process." style={infoIconStyle}>
                i
              </span>
            </span>
            <small style={helpTextStyle}>
              Shows where the issue is in the resolution process.
            </small>
            <select
              value={form.status}
              onChange={(event) => updateField("status", event.target.value)}
              style={inputStyle}
            >
              <option value="">Select status</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small style={optionHelpStyle}>
              {getSelectedOptionDescription(statusOptions, form.status)}
            </small>
          </label>

          <label style={fieldStyle}>
            <span style={labelRowStyle}>
              Priority
              <span title="How soon the issue needs attention." style={infoIconStyle}>
                i
              </span>
            </span>
            <small style={helpTextStyle}>
              Shows how soon the issue needs attention compared with other work.
            </small>
            <select
              value={form.priority}
              onChange={(event) => updateField("priority", event.target.value)}
              style={inputStyle}
            >
              <option value="">Select priority</option>
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small style={optionHelpStyle}>
              {getSelectedOptionDescription(priorityOptions, form.priority)}
            </small>
          </label>

          <label style={fieldStyle}>
            <span style={labelRowStyle}>
              Submitted By
              <span title="The team member who logged this issue." style={infoIconStyle}>
                i
              </span>
            </span>
            <small style={helpTextStyle}>
              The team member who logged or submitted the issue.
            </small>
            <select
              value={form.submitted_by}
              onChange={(event) => updateField("submitted_by", event.target.value)}
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
          <span style={labelRowStyle}>
            Description
            <span title="Explain what happened and why it matters." style={infoIconStyle}>
              i
            </span>
          </span>
          <small style={helpTextStyle}>
            Explain what happened, what is broken, who or what is affected, and
            why this issue matters.
          </small>
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            style={textareaStyle}
          />
        </label>
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <div style={sectionEyebrowStyle}>SECTION 2</div>
            <h2 style={sectionTitleStyle}>Linked Follow-Up</h2>
          </div>

          <p style={sectionHelpStyle}>
            Use this section when the issue came from a huddle or when a task
            owns the follow-up work. This keeps issues from getting lost.
          </p>
        </div>

        <div style={fieldGridStyle}>
          <label style={fieldStyle}>
            <span style={labelRowStyle}>
              Linked Task
              <span title="The task connected to this issue." style={infoIconStyle}>
                i
              </span>
            </span>
            <small style={helpTextStyle}>
              The task connected to this issue. Choose the task that owns the
              follow-up work.
            </small>
            <select
              value={form.linked_task}
              onChange={(event) => updateField("linked_task", event.target.value)}
              style={inputStyle}
            >
              <option value="">No linked task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.task_title || `Task #${task.id}`}
                  {task.status ? ` · ${task.status}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label style={fieldStyle}>
            <span style={labelRowStyle}>
              Link to Daily Huddle
              <span title="The Daily Huddle record connected to this issue." style={infoIconStyle}>
                i
              </span>
            </span>
            <small style={helpTextStyle}>
              The Daily Huddle record connected to this issue. Use this when the
              issue came from a huddle discussion.
            </small>
            <select
              value={form.link_to_daily_huddle}
              onChange={(event) =>
                updateField("link_to_daily_huddle", event.target.value)
              }
              style={inputStyle}
            >
              <option value="">No linked huddle</option>
              {dailyHuddles.map((huddle) => (
                <option key={huddle.id} value={huddle.id}>
                  Daily Huddle #{huddle.id}
                  {huddle.log_date ? ` · ${huddle.log_date}` : ""}
                  {huddle.overall_status ? ` · ${huddle.overall_status}` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <div style={sectionEyebrowStyle}>SECTION 3</div>
            <h2 style={sectionTitleStyle}>Resolution and Closeout</h2>
          </div>

          <p style={sectionHelpStyle}>
            This section can be completed later. Use it once work has been done,
            the issue has been resolved, or the item is ready to close.
          </p>
        </div>

        <div style={fieldGridStyle}>
          <label style={fieldStyle}>
            <span style={labelRowStyle}>
              Resolve / Close Date
              <span title="The date the issue was resolved or closed." style={infoIconStyle}>
                i
              </span>
            </span>
            <small style={helpTextStyle}>
              The date the issue was resolved or closed.
            </small>
            <input
              type="date"
              value={form.resolve_close_date}
              onChange={(event) =>
                updateField("resolve_close_date", event.target.value)
              }
              style={inputStyle}
            />
          </label>
        </div>

        <label style={fieldStyle}>
          <span style={labelRowStyle}>
            Resolution Description
            <span title="Explain what was done to fix the issue." style={infoIconStyle}>
              i
            </span>
          </span>
          <small style={helpTextStyle}>
            Explain what was done to fix or address the issue.
          </small>
          <textarea
            value={form.resolution_description}
            onChange={(event) =>
              updateField("resolution_description", event.target.value)
            }
            style={textareaStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelRowStyle}>
            Ending Notes
            <span title="Final notes and lessons learned." style={infoIconStyle}>
              i
            </span>
          </span>
          <small style={helpTextStyle}>
            Final notes, lessons learned, remaining follow-up, or anything the
            team should remember.
          </small>
          <textarea
            value={form.ending_notes}
            onChange={(event) => updateField("ending_notes", event.target.value)}
            style={textareaStyle}
          />
        </label>
      </section>

      <section style={submitBarStyle}>
        <button
          type="button"
          onClick={saveIssue}
          disabled={saving}
          style={saveButtonStyle}
        >
          {saving ? "Saving..." : "Save Issue"}
        </button>

        <a href="/?table=issues_breakdowns" style={secondaryLinkStyle}>
          Cancel
        </a>
      </section>
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

const managerLinkStyle: CSSProperties = {
  background: colors.gold,
  color: colors.navy,
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: 900,
  height: "fit-content",
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

const sectionCardStyle: CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "22px",
  marginBottom: "20px",
  boxShadow: "0 18px 42px rgba(28,35,51,0.06)",
};

const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  borderBottom: `1px solid ${colors.border}`,
  paddingBottom: "14px",
  marginBottom: "18px",
};

const sectionEyebrowStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "10px",
  letterSpacing: "0.16em",
};

const sectionTitleStyle: CSSProperties = {
  margin: "6px 0 0",
  fontFamily: "var(--font-playfair), serif",
  fontSize: "30px",
  fontWeight: 600,
};

const sectionHelpStyle: CSSProperties = {
  color: colors.slate,
  maxWidth: "460px",
  lineHeight: 1.5,
  margin: 0,
};

const fieldGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "16px",
  marginBottom: "18px",
};

const fieldStyle: CSSProperties = {
  display: "grid",
  gap: "6px",
  fontWeight: 800,
  marginBottom: "16px",
};

const labelRowStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
};

const requiredStyle: CSSProperties = {
  color: colors.red,
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

const infoIconStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "16px",
  height: "16px",
  borderRadius: "999px",
  background: colors.goldPale,
  color: colors.navy,
  fontSize: "11px",
  fontWeight: 900,
  cursor: "help",
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

const submitBarStyle: CSSProperties = {
  display: "flex",
  gap: "10px",
  justifyContent: "flex-end",
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "16px",
  position: "sticky",
  bottom: "20px",
};

const saveButtonStyle: CSSProperties = {
  background: colors.gold,
  color: colors.navy,
  border: "none",
  borderRadius: "8px",
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

const secondaryLinkStyle: CSSProperties = {
  background: colors.goldPale,
  color: colors.navy,
  borderRadius: "8px",
  padding: "10px 14px",
  fontWeight: 900,
  textDecoration: "none",
};