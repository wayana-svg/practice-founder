"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "../../lib/supabase/client";

type Employee = {
  id: number | string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

type FormState = {
  submitted_by: string;
  billing_date: string;
  billing_completed_by: string;
  charge_entry_completed: boolean;
  claims_submitted: boolean;
  claims_not_submitted_count: string;
  payments_posted: boolean;
  denials_reviewed: boolean;
  ar_follow_up_completed: boolean;
  billing_issue_found: boolean;
  billing_issue_summary: string;
  linked_issue: string;
  billing_notes: string;
  daily_billing_complete: boolean;
};

const initialForm: FormState = {
  submitted_by: "",
  billing_date: new Date().toISOString().slice(0, 10),
  billing_completed_by: "",
  charge_entry_completed: false,
  claims_submitted: false,
  claims_not_submitted_count: "0",
  payments_posted: false,
  denials_reviewed: false,
  ar_follow_up_completed: false,
  billing_issue_found: false,
  billing_issue_summary: "",
  linked_issue: "",
  billing_notes: "",
  daily_billing_complete: false,
};

export default function DailyBillingClaimsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    const supabase = createClient();

    const { data } = await supabase
      .from("employees")
      .select("id,name,email,role")
      .order("name", { ascending: true });

    setEmployees((data as Employee[]) || []);
  }

  function updateField<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function employeeLabel(employee: Employee) {
    const name = employee.name || employee.email || `Employee #${employee.id}`;
    const role = employee.role ? ` · ${employee.role}` : "";

    return `${name}${role}`;
  }

  async function submitRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (!form.submitted_by) {
      setErrorMessage("Choose who submitted this billing record.");
      return;
    }

    if (!form.billing_date) {
      setErrorMessage("Choose the billing date.");
      return;
    }

    setSaving(true);

    const payload = {
      submitted_by: Number(form.submitted_by),
      billing_date: form.billing_date,
      billing_completed_by: form.billing_completed_by
        ? Number(form.billing_completed_by)
        : null,
      charge_entry_completed: form.charge_entry_completed,
      claims_submitted: form.claims_submitted,
      claims_not_submitted_count: Number(form.claims_not_submitted_count || 0),
      payments_posted: form.payments_posted,
      denials_reviewed: form.denials_reviewed,
      ar_follow_up_completed: form.ar_follow_up_completed,
      billing_issue_found: form.billing_issue_found,
      billing_issue_summary: form.billing_issue_summary.trim() || null,
      linked_issue: form.linked_issue.trim() || null,
      billing_notes: form.billing_notes.trim() || null,
      daily_billing_complete: form.daily_billing_complete,
    };

    const supabase = createClient();

    const { error } = await supabase.from("daily_billing_claims").insert(payload);

    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Daily billing record added.");
    setForm(initialForm);
  }

  return (
    <main style={pageStyle}>
      <section style={headerStyle}>
        <a href="/" style={backLinkStyle}>
          ← Back to Daily Billing Manager
        </a>

        <div style={eyebrowStyle}>PRACTICE FOUNDER · BILLING ACTIVITIES</div>
        <h1 style={titleStyle}>Add Daily Billing Record</h1>
        <p style={descriptionStyle}>
          Add daily billing work, claim submission status, payment posting,
          denials, AR follow-up, and billing issues that need action.
        </p>
      </section>

      {message ? <div style={successStyle}>{message}</div> : null}
      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      <form onSubmit={submitRecord} style={formStyle}>
        <section style={sectionStyle}>
          <div>
            <div style={sectionEyebrowStyle}>REQUIRED DETAILS</div>
            <h2 style={sectionTitleStyle}>Record Ownership</h2>
            <p style={sectionDescriptionStyle}>
              Choose who is submitting the record and what workday this billing
              update belongs to.
            </p>
          </div>

          <div style={gridStyle}>
            <label style={labelStyle}>
              Submitted By
              <span style={helpTextStyle}>
                The employee entering this daily billing record.
              </span>
              <select
                value={form.submitted_by}
                onChange={(event) =>
                  updateField("submitted_by", event.target.value)
                }
                style={inputStyle}
                required
              >
                <option value="">Choose employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employeeLabel(employee)}
                  </option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              Billing Date
              <span style={helpTextStyle}>
                The workday this billing activity belongs to.
              </span>
              <input
                type="date"
                value={form.billing_date}
                onChange={(event) =>
                  updateField("billing_date", event.target.value)
                }
                style={inputStyle}
                required
              />
            </label>

            <label style={labelStyle}>
              Billing Completed By
              <span style={helpTextStyle}>
                The employee who completed the billing work.
              </span>
              <select
                value={form.billing_completed_by}
                onChange={(event) =>
                  updateField("billing_completed_by", event.target.value)
                }
                style={inputStyle}
              >
                <option value="">Choose employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employeeLabel(employee)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section style={sectionStyle}>
          <div>
            <div style={sectionEyebrowStyle}>BILLING CHECKLIST</div>
            <h2 style={sectionTitleStyle}>Daily Billing Work</h2>
            <p style={sectionDescriptionStyle}>
              Mark which billing tasks were completed today.
            </p>
          </div>

          <div style={checkboxGridStyle}>
            <CheckboxRow
              label="Charge Entry Completed?"
              description="All charges that should be entered for the day have been entered."
              checked={form.charge_entry_completed}
              onChange={(value) => updateField("charge_entry_completed", value)}
            />

            <CheckboxRow
              label="Claims Submitted?"
              description="All ready claims have been submitted."
              checked={form.claims_submitted}
              onChange={(value) => updateField("claims_submitted", value)}
            />

            <CheckboxRow
              label="Payments Posted?"
              description="Payments received have been posted in the system."
              checked={form.payments_posted}
              onChange={(value) => updateField("payments_posted", value)}
            />

            <CheckboxRow
              label="Denials Reviewed?"
              description="Denials were checked and reviewed."
              checked={form.denials_reviewed}
              onChange={(value) => updateField("denials_reviewed", value)}
            />

            <CheckboxRow
              label="AR Follow-Up Completed?"
              description="Accounts receivable follow-up was completed."
              checked={form.ar_follow_up_completed}
              onChange={(value) => updateField("ar_follow_up_completed", value)}
            />

            <CheckboxRow
              label="Daily Billing Complete?"
              description="No more billing updates need to be added for this day."
              checked={form.daily_billing_complete}
              onChange={(value) => updateField("daily_billing_complete", value)}
            />
          </div>

          <label style={labelStyle}>
            Claims Not Submitted Count
            <span style={helpTextStyle}>
              Enter 0 if all claims were submitted.
            </span>
            <input
              type="number"
              min="0"
              value={form.claims_not_submitted_count}
              onChange={(event) =>
                updateField("claims_not_submitted_count", event.target.value)
              }
              style={inputStyle}
            />
          </label>
        </section>

        <section style={sectionStyle}>
          <div>
            <div style={sectionEyebrowStyle}>ISSUES & NOTES</div>
            <h2 style={sectionTitleStyle}>Billing Issue Details</h2>
            <p style={sectionDescriptionStyle}>
              Capture blockers, missing information, payer issues, denial
              patterns, or next steps.
            </p>
          </div>

          <CheckboxRow
            label="Billing Issue Found?"
            description="Turn this on if there was a billing issue, claim blocker, denial pattern, or payer problem."
            checked={form.billing_issue_found}
            onChange={(value) => updateField("billing_issue_found", value)}
          />

          <label style={labelStyle}>
            Billing Issue Summary
            <span style={helpTextStyle}>
              Describe what happened, what is blocked, who owns the next step,
              and what needs follow-up.
            </span>
            <textarea
              value={form.billing_issue_summary}
              onChange={(event) =>
                updateField("billing_issue_summary", event.target.value)
              }
              style={textareaStyle}
              rows={5}
            />
          </label>

          <label style={labelStyle}>
            Linked Issue
            <span style={helpTextStyle}>
              Enter the related issue name or issue ID if this was also added to
              Issues & Breakdowns.
            </span>
            <input
              type="text"
              value={form.linked_issue}
              onChange={(event) => updateField("linked_issue", event.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Billing Notes
            <span style={helpTextStyle}>
              Add any extra notes about claims, payments, denials, AR, missing
              information, payer follow-up, or billing work completed today.
            </span>
            <textarea
              value={form.billing_notes}
              onChange={(event) =>
                updateField("billing_notes", event.target.value)
              }
              style={textareaStyle}
              rows={6}
            />
          </label>
        </section>

        <div style={footerStyle}>
          <a href="/" style={secondaryLinkStyle}>
            Cancel
          </a>

          <button type="submit" disabled={saving} style={primaryButtonStyle}>
            {saving ? "Saving..." : "Add Daily Billing Record"}
          </button>
        </div>
      </form>
    </main>
  );
}

function CheckboxRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label style={checkboxRowStyle}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        style={checkboxStyle}
      />

      <span>
        <strong>{label}</strong>
        <small style={checkboxDescriptionStyle}>{description}</small>
      </span>
    </label>
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
  maxWidth: "850px",
  lineHeight: 1.6,
};

const formStyle: CSSProperties = {
  display: "grid",
  gap: "18px",
  maxWidth: "1120px",
};

const sectionStyle: CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "22px",
  display: "grid",
  gap: "18px",
  boxShadow: "0 16px 38px rgba(28,35,51,0.06)",
};

const sectionEyebrowStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "10px",
  letterSpacing: "0.16em",
};

const sectionTitleStyle: CSSProperties = {
  margin: "4px 0 0",
  fontFamily: "var(--font-playfair), serif",
  fontSize: "28px",
  fontWeight: 600,
};

const sectionDescriptionStyle: CSSProperties = {
  color: colors.slate,
  lineHeight: 1.5,
  margin: "6px 0 0",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "14px",
};

const checkboxGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: "7px",
  fontWeight: 800,
};

const helpTextStyle: CSSProperties = {
  color: colors.slate,
  fontWeight: 500,
  fontSize: "12px",
  lineHeight: 1.4,
};

const inputStyle: CSSProperties = {
  minHeight: "44px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "0 12px",
  color: colors.navy,
  background: colors.white,
};

const textareaStyle: CSSProperties = {
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "12px",
  color: colors.navy,
  background: colors.white,
  resize: "vertical",
  fontFamily: "inherit",
};

const checkboxRowStyle: CSSProperties = {
  display: "flex",
  gap: "12px",
  alignItems: "flex-start",
  background: colors.cream,
  border: `1px solid ${colors.border}`,
  padding: "14px",
  cursor: "pointer",
};

const checkboxStyle: CSSProperties = {
  marginTop: "3px",
};

const checkboxDescriptionStyle: CSSProperties = {
  display: "block",
  marginTop: "4px",
  color: colors.slate,
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: 1.4,
};

const footerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "4px",
};

const primaryButtonStyle: CSSProperties = {
  background: colors.gold,
  color: colors.navy,
  border: "none",
  borderRadius: "10px",
  padding: "12px 18px",
  fontWeight: 900,
  cursor: "pointer",
};

const secondaryLinkStyle: CSSProperties = {
  background: colors.goldPale,
  color: colors.navy,
  borderRadius: "10px",
  padding: "12px 18px",
  fontWeight: 900,
  textDecoration: "none",
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