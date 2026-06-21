"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "../../lib/supabase/client";

type Employee = {
  id: number;
  name: string | null;
};

type FormState = {
  role_name: string;
  staff_member: string;
  role_status: string;
  what_this_role_does: string;
  what_this_role_is_accountable_for: string;
  resolve_handles_independently: string;
  judgment_decides_and_logs: string;
  escalate_brings_to_doctor: string;
  check_steps_before_escalating: string;
  time_limit: string;
  must_log: string;
  notes: string;
};

type OptionDefinition = {
  value: string;
  label: string;
  description: string;
};

const emptyForm: FormState = {
  role_name: "",
  staff_member: "",
  role_status: "Vacant — Not Yet Hired",
  what_this_role_does: "",
  what_this_role_is_accountable_for: "",
  resolve_handles_independently: "",
  judgment_decides_and_logs: "",
  escalate_brings_to_doctor: "",
  check_steps_before_escalating: "",
  time_limit: "",
  must_log: "Judgment + Escalation",
  notes: "",
};

const roleStatusOptions: OptionDefinition[] = [
  {
    value: "Properly Staffed",
    label: "Properly Staffed",
    description:
      "The role has a clear owner and is being handled by the right person.",
  },
  {
    value: "Owner Covering This Role",
    label: "Owner Covering This Role",
    description:
      "The physician or practice owner is still personally covering this role.",
  },
  {
    value: "Shared Across Team",
    label: "Shared Across Team",
    description:
      "More than one person is sharing the role and there is not one clean owner yet.",
  },
  {
    value: "Temporarily Covered",
    label: "Temporarily Covered",
    description:
      "Someone is covering the role for a short period but is not the permanent owner.",
  },
  {
    value: "Vacant — Not Yet Hired",
    label: "Vacant — Not Yet Hired",
    description:
      "The role exists, but no one has been hired or assigned to own it yet.",
  },
  {
    value: "Outsourced",
    label: "Outsourced",
    description:
      "The role is handled by an outside contractor, vendor, billing company, or external support team.",
  },
];

const coreFunctionOptions: OptionDefinition[] = [
  {
    value: "Clinical Care",
    label: "Clinical Care",
    description:
      "Roles that support patient care, clinical flow, charting, referrals, or provider execution.",
  },
  {
    value: "Revenue Cycle & Finance",
    label: "Revenue Cycle & Finance",
    description:
      "Billing, claims, collections, payment posting, AR, payroll, or financial tracking roles.",
  },
  {
    value: "Patient Access & Front Desk",
    label: "Patient Access & Front Desk",
    description:
      "Scheduling, calls, check-in, patient communication, intake, and front desk roles.",
  },
  {
    value: "Operations",
    label: "Operations",
    description:
      "Daily management, follow-up, workflow control, and making sure the practice runs smoothly.",
  },
  {
    value: "Human Resources & Staffing",
    label: "Human Resources & Staffing",
    description:
      "Hiring, onboarding, staff coverage, training, and employee accountability.",
  },
  {
    value: "Compliance",
    label: "Compliance",
    description:
      "Policies, documentation standards, payer requirements, HIPAA, or compliance-related duties.",
  },
  {
    value: "Leadership & Strategic Growth",
    label: "Leadership & Strategic Growth",
    description:
      "Owner-level decisions, management, strategic planning, growth priorities, and leadership routines.",
  },
  {
    value: "Quality Improvement",
    label: "Quality Improvement",
    description:
      "Fixing breakdowns, improving processes, measuring performance, and making work more reliable.",
  },
];

const mustLogOptions: OptionDefinition[] = [
  {
    value: "Escalation Only",
    label: "Escalation Only",
    description:
      "The role only logs the situation when it is escalated.",
  },
  {
    value: "Judgment + Escalation",
    label: "Judgment + Escalation",
    description:
      "The role logs judgment calls and escalations, but not every routine action.",
  },
  {
    value: "Always",
    label: "Always",
    description:
      "The role logs every important action, decision, and issue handled.",
  },
];

function getOptionDescription(options: OptionDefinition[], value: string) {
  return options.find((option) => option.value === value)?.description || "";
}

export default function RolesPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const roleStatusDescription = useMemo(
    () => getOptionDescription(roleStatusOptions, form.role_status),
    [form.role_status]
  );
const mustLogDescription = useMemo(
    () => getOptionDescription(mustLogOptions, form.must_log),
    [form.must_log]
  );

  useEffect(() => {
    loadEmployees();
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

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submitForm() {
    setMessage("");
    setErrorMessage("");

    if (!form.role_name.trim()) {
      setErrorMessage("Role Name is required.");
      return;
    }

    setSaving(true);

    const payload = {
      role_name: form.role_name.trim(),
      staff_member: form.staff_member ? Number(form.staff_member) : null,
      role_status: form.role_status || null,
      what_this_role_does: form.what_this_role_does.trim() || null,
      what_this_role_is_accountable_for:
        form.what_this_role_is_accountable_for.trim() || null,
      resolve_handles_independently:
        form.resolve_handles_independently.trim() || null,
      judgment_decides_and_logs: form.judgment_decides_and_logs.trim() || null,
      escalate_brings_to_doctor: form.escalate_brings_to_doctor.trim() || null,
      check_steps_before_escalating:
        form.check_steps_before_escalating.trim() || null,
      time_limit: form.time_limit.trim() || null,
      must_log: form.must_log || null,
      notes: form.notes.trim() || null,
    };

    const supabase = createClient();

    const { error } = await supabase.from("roles").insert(payload);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage("Role added.");
    setForm(emptyForm);
    setSaving(false);
  }

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <a href="/?table=roles" style={backLinkStyle}>
            ← Back to Roles
          </a>

          <div style={eyebrowStyle}>PRACTICE FOUNDER · BUSINESS HQ</div>
          <h1 style={titleStyle}>Add Role</h1>
          <p style={descriptionStyle}>
            Create a role record that explains who owns the role, what they are
            responsible for, what they can resolve, when they should use
            judgment, and when they must escalate.
          </p>
        </div>

        <a href="/roles-list" style={managerButtonStyle}>
          Open Manager
        </a>
      </header>

      {message ? <div style={successBoxStyle}>{message}</div> : null}
      {errorMessage ? <div style={errorBoxStyle}>{errorMessage}</div> : null}

      <section style={summaryGridStyle}>
        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Role Status</div>
          <div style={summaryValueStyle}>{form.role_status}</div>
        </div>


        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Logging Rule</div>
          <div style={summaryValueStyle}>{form.must_log}</div>
        </div>
      </section>

      <section style={formCardStyle}>
        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>GENERAL</div>
            <h2 style={sectionTitleStyle}>Role Setup</h2>
            <p style={sectionTextStyle}>
              Name the role, assign the staff member if one exists, and choose
              the staffing condition.
            </p>
          </div>

          <div style={twoColumnGridStyle}>
            <label
              style={formLabelStyle}
              title="Enter the name of the role in the practice."
            >
              <span style={labelRowStyle}>
                Role Name *
                <span
                  title="Enter the name of the role in the practice."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <input
                value={form.role_name}
                onChange={(event) => updateField("role_name", event.target.value)}
                style={inputStyle}
                placeholder="Example: Front Desk"
              />
            </label>

            <label
              style={formLabelStyle}
              title="Choose the employee who currently owns this role."
            >
              <span style={labelRowStyle}>
                Staff Member
                <span
                  title="Choose the employee who currently owns this role."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <select
                value={form.staff_member}
                onChange={(event) =>
                  updateField("staff_member", event.target.value)
                }
                style={inputStyle}
              >
                <option value="">No staff member assigned</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name || `Employee #${employee.id}`}
                  </option>
                ))}
              </select>
            </label>

            <label
              style={formLabelStyle}
              title="Choose the current staffing condition for this role."
            >
              <span style={labelRowStyle}>
                Role Status
                <span
                  title="Choose the current staffing condition for this role."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <select
                value={form.role_status}
                onChange={(event) =>
                  updateField("role_status", event.target.value)
                }
                style={inputStyle}
              >
                {roleStatusOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    title={option.description}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              {roleStatusDescription ? (
                <small style={helpTextStyle}>{roleStatusDescription}</small>
              ) : null}
            </label>

          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>OWNERSHIP</div>
            <h2 style={sectionTitleStyle}>Role Responsibilities</h2>
            <p style={sectionTextStyle}>
              Explain what the role does and what outcomes the role owns.
            </p>
          </div>

          <div style={twoColumnGridStyle}>
            <label
              style={formLabelStyle}
              title="Describe the day-to-day work this role owns."
            >
              <span style={labelRowStyle}>
                What This Role Does
                <span
                  title="Describe the day-to-day work this role owns."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <textarea
                value={form.what_this_role_does}
                onChange={(event) =>
                  updateField("what_this_role_does", event.target.value)
                }
                style={textareaStyle}
              />
            </label>

            <label
              style={formLabelStyle}
              title="Describe the non-negotiable outcomes this role must deliver."
            >
              <span style={labelRowStyle}>
                What This Role Is Accountable For
                <span
                  title="Describe the non-negotiable outcomes this role must deliver."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <textarea
                value={form.what_this_role_is_accountable_for}
                onChange={(event) =>
                  updateField(
                    "what_this_role_is_accountable_for",
                    event.target.value
                  )
                }
                style={textareaStyle}
              />
            </label>
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>DECISION RULES</div>
            <h2 style={sectionTitleStyle}>Resolve, Judge, and Escalate</h2>
            <p style={sectionTextStyle}>
              Define what this role handles alone, what it decides and logs, and
              what must go to the doctor or owner.
            </p>
          </div>

          <div style={twoColumnGridStyle}>
            <label
              style={formLabelStyle}
              title="List the situations this role should handle without asking the doctor, owner, or manager first."
            >
              <span style={labelRowStyle}>
                Resolve — Handles Independently
                <span
                  title="List the situations this role should handle without asking first."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <textarea
                value={form.resolve_handles_independently}
                onChange={(event) =>
                  updateField(
                    "resolve_handles_independently",
                    event.target.value
                  )
                }
                style={textareaStyle}
              />
            </label>

            <label
              style={formLabelStyle}
              title="List the situations where this role should use judgment, make a decision, and log what they decided."
            >
              <span style={labelRowStyle}>
                Judgment — Decides and Logs
                <span
                  title="List situations where this role should use judgment and log the decision."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <textarea
                value={form.judgment_decides_and_logs}
                onChange={(event) =>
                  updateField("judgment_decides_and_logs", event.target.value)
                }
                style={textareaStyle}
              />
            </label>

            <label
              style={formLabelStyle}
              title="List the specific situations that must be escalated to the doctor or owner."
            >
              <span style={labelRowStyle}>
                Escalate — Brings to Doctor
                <span
                  title="List the specific situations that must be escalated."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <textarea
                value={form.escalate_brings_to_doctor}
                onChange={(event) =>
                  updateField("escalate_brings_to_doctor", event.target.value)
                }
                style={textareaStyle}
              />
            </label>

            <label
              style={formLabelStyle}
              title="Write the numbered steps this role must complete before escalating."
            >
              <span style={labelRowStyle}>
                Check Steps Before Escalating
                <span
                  title="Write the numbered steps this role must complete before escalating."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <textarea
                value={form.check_steps_before_escalating}
                onChange={(event) =>
                  updateField(
                    "check_steps_before_escalating",
                    event.target.value
                  )
                }
                style={textareaStyle}
              />
            </label>
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>ESCALATION CONTROL</div>
            <h2 style={sectionTitleStyle}>Time Limit and Logging</h2>
            <p style={sectionTextStyle}>
              Set how long this role should work through the check steps and
              when it must log what happened.
            </p>
          </div>

          <div style={twoColumnGridStyle}>
            <label
              style={formLabelStyle}
              title="Enter how long this role should work through the check steps before escalating."
            >
              <span style={labelRowStyle}>
                Time Limit
                <span
                  title="Enter how long this role should work through the check steps before escalating."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <input
                value={form.time_limit}
                onChange={(event) =>
                  updateField("time_limit", event.target.value)
                }
                style={inputStyle}
                placeholder="Example: Same day"
              />
            </label>

            <label
              style={formLabelStyle}
              title="Choose when this role must document what happened."
            >
              <span style={labelRowStyle}>
                Must Log?
                <span
                  title="Choose when this role must document what happened."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <select
                value={form.must_log}
                onChange={(event) => updateField("must_log", event.target.value)}
                style={inputStyle}
              >
                {mustLogOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    title={option.description}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              {mustLogDescription ? (
                <small style={helpTextStyle}>{mustLogDescription}</small>
              ) : null}
            </label>
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>NOTES</div>
            <h2 style={sectionTitleStyle}>Notes</h2>
            <p style={sectionTextStyle}>
              Add internal notes about coverage, future changes, or role setup.
            </p>
          </div>

          <label
            style={formLabelStyle}
            title="Use this for extra internal notes about the role."
          >
            <span style={labelRowStyle}>
              Notes
              <span
                title="Use this for extra internal notes about the role."
                style={infoIconStyle}
              >
                i
              </span>
            </span>

            <textarea
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              style={textareaStyle}
            />
          </label>
        </section>

        <div style={confirmationBoxStyle}>
          Before submitting, confirm the role name is clear and the escalation
          rules are specific enough for staff to follow.
        </div>

        <div style={buttonRowStyle}>
          <button
            type="button"
            onClick={submitForm}
            disabled={saving}
            style={submitButtonStyle}
          >
            {saving ? "Submitting..." : "Submit Role"}
          </button>

          <a href="/roles-list" style={secondaryButtonStyle}>
            Open Manager
          </a>

          <a href="/?table=roles" style={secondaryButtonStyle}>
            Back to Roles
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
  maxWidth: "820px",
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
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
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