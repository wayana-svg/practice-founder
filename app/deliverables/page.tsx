"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "../../lib/supabase/client";

type Employee = {
  id: number;
  name: string | null;
};

type Task = {
  id: number;
  task_title: string | null;
  status: string | null;
};

type FormState = {
  deliverable_name: string;
  submitted_by: string;
  date_submitted: string;
  status: string;
  linked_task: string;
  deliverable: string;
  description: string;
};

const today = new Date().toISOString().slice(0, 10);

const emptyForm: FormState = {
  deliverable_name: "",
  submitted_by: "",
  date_submitted: today,
  status: "In Progress",
  linked_task: "",
  deliverable: "",
  description: "",
};

const statusOptions = [
  {
    value: "In Progress",
    label: "In Progress",
    description:
      "The deliverable is still being worked on and is not ready for final review yet.",
  },
  {
    value: "In Review",
    label: "In Review",
    description:
      "The deliverable has been submitted and is waiting for review or approval.",
  },
  {
    value: "Complete",
    label: "Complete",
    description:
      "The deliverable has been reviewed and accepted as finished.",
  },
];

export default function DeliverablesPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedStatusDescription = useMemo(() => {
    return (
      statusOptions.find((option) => option.value === form.status)
        ?.description || ""
    );
  }, [form.status]);

  useEffect(() => {
    loadEmployees();
    loadTasks();
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
      .limit(250);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setTasks((data as Task[]) || []);
  }

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submitForm() {
    setMessage("");
    setErrorMessage("");

    if (!form.deliverable_name.trim()) {
      setErrorMessage("Deliverable Name is required.");
      return;
    }

    if (!form.submitted_by) {
      setErrorMessage("Submitted By is required.");
      return;
    }

    if (!form.date_submitted) {
      setErrorMessage("Date Submitted is required.");
      return;
    }

    if (!form.deliverable.trim()) {
      setErrorMessage("Deliverable is required.");
      return;
    }

    setSaving(true);

    const payload = {
      deliverable_name: form.deliverable_name.trim(),
      submitted_by: Number(form.submitted_by),
      date_submitted: form.date_submitted,
      status: form.status,
      linked_task: form.linked_task ? Number(form.linked_task) : null,
      deliverable: form.deliverable.trim(),
      description: form.description.trim() || null,
    };

    const supabase = createClient();

    const { error } = await supabase.from("deliverables").insert(payload);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage("Deliverable submitted.");
    setForm(emptyForm);
    setSaving(false);
  }

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <a href="/?table=deliverables" style={backLinkStyle}>
            ← Back to Deliverables
          </a>

          <div style={eyebrowStyle}>PRACTICE FOUNDER · DELIVERABLES</div>
          <h1 style={titleStyle}>Add Deliverable</h1>
          <p style={descriptionStyle}>
            Submit the finished output produced from a task. This can be a
            document, link, file reference, video, image, report, SOP, or written
            explanation.
          </p>
        </div>

        <a href="/" style={managerButtonStyle}>
          Open Manager
        </a>
      </header>

      {message ? <div style={successBoxStyle}>{message}</div> : null}
      {errorMessage ? <div style={errorBoxStyle}>{errorMessage}</div> : null}

      <section style={summaryGridStyle}>
        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Status</div>
          <div style={summaryValueStyle}>{form.status}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Linked Task</div>
          <div style={summaryValueStyle}>
            {form.linked_task ? `Task #${form.linked_task}` : "None"}
          </div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Date Submitted</div>
          <div style={summaryValueStyle}>{form.date_submitted || "Not set"}</div>
        </div>
      </section>

      <section style={formCardStyle}>
        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>GENERAL</div>
            <h2 style={sectionTitleStyle}>Deliverable Details</h2>
            <p style={sectionTextStyle}>
              Name the deliverable, choose who submitted it, and confirm the
              submission date.
            </p>
          </div>

          <div style={twoColumnGridStyle}>
            <label
              style={formLabelStyle}
              title="Enter a clear title for the completed output."
            >
              <span style={labelRowStyle}>
                Deliverable Name *
                <span
                  title="Enter a clear title for the completed output."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <input
                value={form.deliverable_name}
                onChange={(event) =>
                  updateField("deliverable_name", event.target.value)
                }
                style={inputStyle}
                placeholder="Example: Updated Front Desk SOP"
              />
            </label>

            <label
              style={formLabelStyle}
              title="Choose the employee who submitted or completed this deliverable."
            >
              <span style={labelRowStyle}>
                Submitted By *
                <span
                  title="Choose the employee who submitted or completed this deliverable."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <select
                value={form.submitted_by}
                onChange={(event) =>
                  updateField("submitted_by", event.target.value)
                }
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

            <label
              style={formLabelStyle}
              title="Choose the date this deliverable was submitted."
            >
              <span style={labelRowStyle}>
                Date Submitted *
                <span
                  title="Choose the date this deliverable was submitted."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <input
                type="date"
                value={form.date_submitted}
                onChange={(event) =>
                  updateField("date_submitted", event.target.value)
                }
                style={inputStyle}
              />
            </label>

            <label
              style={formLabelStyle}
              title="Choose the current review status of this deliverable."
            >
              <span style={labelRowStyle}>
                Status
                <span
                  title="Choose the current review status of this deliverable."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
                style={inputStyle}
              >
                {statusOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    title={option.description}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              {selectedStatusDescription ? (
                <small style={helpTextStyle}>{selectedStatusDescription}</small>
              ) : null}
            </label>
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>TASK LINK</div>
            <h2 style={sectionTitleStyle}>Connected Task</h2>
            <p style={sectionTextStyle}>
              Link this deliverable to the task that produced it. This keeps the
              task and deliverable connected.
            </p>
          </div>

          <label
            style={formLabelStyle}
            title="Choose the task that produced this deliverable."
          >
            <span style={labelRowStyle}>
              Linked Task
              <span
                title="Choose the task that produced this deliverable."
                style={infoIconStyle}
              >
                i
              </span>
            </span>

            <select
              value={form.linked_task}
              onChange={(event) => updateField("linked_task", event.target.value)}
              style={inputStyle}
            >
              <option value="">No linked task</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  #{task.id} · {task.task_title || "Untitled task"}
                  {task.status ? ` · ${task.status}` : ""}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>OUTPUT</div>
            <h2 style={sectionTitleStyle}>Deliverable Output</h2>
            <p style={sectionTextStyle}>
              Paste the actual deliverable or explain where the deliverable can
              be found.
            </p>
          </div>

          <label
            style={formLabelStyle}
            title="Paste the actual deliverable here. This can be a URL, Google Drive link, Loom link, document link, image link, file reference, or plain text."
          >
            <span style={labelRowStyle}>
              Deliverable *
              <span
                title="Paste the actual deliverable here. This can be a URL, Google Drive link, Loom link, document link, image link, file reference, or plain text."
                style={infoIconStyle}
              >
                i
              </span>
            </span>

            <textarea
              value={form.deliverable}
              onChange={(event) => updateField("deliverable", event.target.value)}
              style={textareaStyle}
              placeholder="Paste the link, file reference, or written deliverable here."
            />
          </label>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>CONTEXT</div>
            <h2 style={sectionTitleStyle}>Description</h2>
            <p style={sectionTextStyle}>
              Add context so the reviewer understands what was created and why.
            </p>
          </div>

          <label
            style={formLabelStyle}
            title="Add a short explanation of what this deliverable contains, why it was created, and anything the reviewer should know."
          >
            <span style={labelRowStyle}>
              Description
              <span
                title="Add a short explanation of what this deliverable contains, why it was created, and anything the reviewer should know."
                style={infoIconStyle}
              >
                i
              </span>
            </span>

            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              style={textareaStyle}
              placeholder="Explain what this deliverable contains and what the reviewer should know."
            />
          </label>
        </section>

        <div style={confirmationBoxStyle}>
          Before submitting, confirm the deliverable is clear enough for someone
          else to open, review, or use later.
        </div>

        <div style={buttonRowStyle}>
          <button
            type="button"
            onClick={submitForm}
            disabled={saving}
            style={submitButtonStyle}
          >
            {saving ? "Submitting..." : "Submit Deliverable"}
          </button>

          <a href="/" style={secondaryButtonStyle}>
            Open Manager
          </a>

          <a href="/?table=deliverables" style={secondaryButtonStyle}>
            Back to Deliverables
          </a>
        </div>
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
  green: "#166534",
  red: "#9F1239",
};

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: colors.cream,
  color: colors.navy,
  padding: "34px",
  fontFamily: "var(--font-dm-sans), Arial, sans-serif",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "24px",
};

const backLinkStyle: CSSProperties = {
  color: colors.navy,
  textDecoration: "none",
  fontWeight: 800,
  display: "inline-block",
  marginBottom: "16px",
};

const eyebrowStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "11px",
  letterSpacing: "0.16em",
  marginBottom: "10px",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-playfair), serif",
  fontSize: "42px",
  fontWeight: 600,
  letterSpacing: "-0.03em",
};

const descriptionStyle: CSSProperties = {
  margin: "8px 0 0",
  maxWidth: "780px",
  color: colors.slate,
};

const managerButtonStyle: CSSProperties = {
  background: colors.white,
  color: colors.navy,
  border: `1px solid ${colors.border}`,
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: 800,
};

const successBoxStyle: CSSProperties = {
  background: "#ecfdf5",
  color: colors.green,
  border: "1px solid #bbf7d0",
  padding: "14px",
  marginBottom: "16px",
};

const errorBoxStyle: CSSProperties = {
  background: "#fff1f2",
  color: colors.red,
  border: "1px solid #fecdd3",
  padding: "14px",
  marginBottom: "16px",
};

const summaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "18px",
};

const summaryCardStyle: CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "18px",
};

const summaryLabelStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "10px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
};

const summaryValueStyle: CSSProperties = {
  marginTop: "8px",
  fontSize: "20px",
  fontWeight: 800,
};

const formCardStyle: CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "24px",
  boxShadow: "0 20px 50px rgba(28,35,51,0.08)",
};

const sectionStyle: CSSProperties = {
  borderBottom: `1px solid ${colors.border}`,
  paddingBottom: "24px",
  marginBottom: "24px",
};

const sectionIntroStyle: CSSProperties = {
  background: colors.goldPale,
  borderLeft: `5px solid ${colors.gold}`,
  padding: "14px",
  marginBottom: "18px",
};

const sectionTagStyle: CSSProperties = {
  fontFamily: "var(--font-dm-mono), monospace",
  color: colors.gold,
  fontSize: "10px",
  letterSpacing: "0.16em",
};

const sectionTitleStyle: CSSProperties = {
  margin: "6px 0",
  fontFamily: "var(--font-playfair), serif",
  fontSize: "26px",
};

const sectionTextStyle: CSSProperties = {
  margin: 0,
  color: colors.slate,
};

const twoColumnGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "16px",
};

const formLabelStyle: CSSProperties = {
  display: "grid",
  gap: "6px",
  fontWeight: 800,
};

const labelRowStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
};

const infoIconStyle: CSSProperties = {
  width: "16px",
  height: "16px",
  borderRadius: "999px",
  background: colors.goldPale,
  color: colors.navy,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "11px",
  cursor: "help",
};

const helpTextStyle: CSSProperties = {
  color: colors.slate,
  fontSize: "12px",
  lineHeight: 1.4,
  fontWeight: 500,
};

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: "42px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "0 10px",
  background: colors.white,
  color: colors.navy,
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: "120px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "10px",
  background: colors.white,
  color: colors.navy,
  fontFamily: "var(--font-dm-sans), Arial, sans-serif",
};

const confirmationBoxStyle: CSSProperties = {
  background: colors.cream,
  border: `1px solid ${colors.border}`,
  padding: "14px",
  color: colors.slate,
  marginBottom: "18px",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const submitButtonStyle: CSSProperties = {
  background: colors.gold,
  color: colors.navy,
  border: "none",
  borderRadius: "10px",
  padding: "12px 16px",
  fontWeight: 900,
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  background: colors.goldPale,
  color: colors.navy,
  borderRadius: "10px",
  padding: "12px 16px",
  fontWeight: 900,
  textDecoration: "none",
};