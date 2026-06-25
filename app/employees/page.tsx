"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "../../lib/supabase/client";

type FormState = {
  name: string;
  email: string;
  phone: string;
  role: string;
  active: string;
};

type OptionDefinition = {
  value: string;
  label: string;
  description: string;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  role: "",
  active: "true",
};

const roleOptions: OptionDefinition[] = [
  {
    value: "Physician",
    label: "Physician",
    description:
      "Provider or physician responsible for patient care, clinical decisions, charting, and clinical leadership.",
  },
  {
    value: "Receptionist",
    label: "Receptionist",
    description:
      "Front desk, reception, scheduling, patient communication, check-in, or patient access role.",
  },
  {
    value: "Biller",
    label: "Biller",
    description:
      "Billing, claims, collections, payment posting, AR, or revenue cycle role.",
  },
  {
    value: "Operations Manager",
    label: "Operations Manager",
    description:
      "Manager responsible for operations, accountability, daily flow, follow-up, and team execution.",
  },
  {
    value: "Clinical Support",
    label: "Clinical Support",
    description:
      "Medical assistant, nurse, rooming, referrals, vitals, prep, or clinical support role.",
  },
  {
    value: "Client Staff",
    label: "Client Staff",
    description:
      "General staff member working inside the client practice.",
  },
  {
    value: "PF Team",
    label: "PF Team",
    description:
      "Practice Founder team member supporting the client, system, implementation, or operations work.",
  },
];

const activeOptions: OptionDefinition[] = [
  {
    value: "true",
    label: "Yes — Active",
    description:
      "This employee currently works with the practice and can be assigned tasks, roles, trackers, and other records.",
  },
  {
    value: "false",
    label: "No — Inactive",
    description:
      "This employee should stay in history, but should not be used for new work or assignments.",
  },
];

function getOptionDescription(options: OptionDefinition[], value: string) {
  return options.find((option) => option.value === value)?.description || "";
}

export default function EmployeesPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const roleDescription = useMemo(() => {
    return getOptionDescription(roleOptions, form.role);
  }, [form.role]);

  const activeDescription = useMemo(() => {
    return getOptionDescription(activeOptions, form.active);
  }, [form.active]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submitForm() {
    setMessage("");
    setErrorMessage("");

    if (!form.name.trim()) {
      setErrorMessage("Employee Name is required.");
      return;
    }

    if (!form.email.trim()) {
      setErrorMessage("Work Email is required.");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      role: form.role || null,
      active: form.active === "true",
    };

    const supabase = createClient();

    const { error } = await supabase.from("employees").insert(payload);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage("Employee added.");
    setForm(emptyForm);
    setSaving(false);
  }

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <a href="/?table=employees" style={backLinkStyle}>
            ← Back to Employees
          </a>

          <div style={eyebrowStyle}>PRACTICE FOUNDER · BUSINESS HQ</div>
          <h1 style={titleStyle}>Add Employee</h1>
          <p style={descriptionStyle}>
            Add staff members here before assigning them to tasks, roles, daily
            trackers, huddles, billing records, or accountability workflows.
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
          <div style={summaryLabelStyle}>Employee</div>
          <div style={summaryValueStyle}>{form.name || "Not named yet"}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Role</div>
          <div style={summaryValueStyle}>{form.role || "Not selected"}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Active</div>
          <div style={summaryValueStyle}>
            {form.active === "true" ? "Yes" : "No"}
          </div>
        </div>
      </section>

      <section style={formCardStyle}>
        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>GENERAL</div>
            <h2 style={sectionTitleStyle}>Employee Details</h2>
            <p style={sectionTextStyle}>
              Enter the employee’s basic contact information and role.
            </p>
          </div>

          <div style={twoColumnGridStyle}>
            <label
              style={formLabelStyle}
              title="The full name of the employee."
            >
              <span style={labelRowStyle}>
                Employee Name *
                <span
                  title="The full name of the employee."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                style={inputStyle}
                placeholder="Example: Jane Smith"
              />
            </label>

            <label
              style={formLabelStyle}
              title="The employee's work email address."
            >
              <span style={labelRowStyle}>
                Work Email *
                <span
                  title="The employee's work email address."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                style={inputStyle}
                placeholder="name@example.com"
              />
            </label>

            <label
              style={formLabelStyle}
              title="The employee's phone number. Optional."
            >
              <span style={labelRowStyle}>
                Phone Number
                <span
                  title="The employee's phone number. Optional."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                style={inputStyle}
                placeholder="Optional"
              />
            </label>

            <label
              style={formLabelStyle}
              title="The employee's role in the practice."
            >
              <span style={labelRowStyle}>
                Employee Role
                <span
                  title="The employee's role in the practice."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <select
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
                style={inputStyle}
              >
                <option value="">Select role</option>
                {roleOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    title={option.description}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              {roleDescription ? (
                <small style={helpTextStyle}>{roleDescription}</small>
              ) : null}
            </label>
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>STATUS</div>
            <h2 style={sectionTitleStyle}>Employee Status</h2>
            <p style={sectionTextStyle}>
              Choose whether this employee should be available for new
              assignments.
            </p>
          </div>

          <label
            style={formLabelStyle}
            title="Yes means this employee can be assigned work. No keeps them in history only."
          >
            <span style={labelRowStyle}>
              Active Employee
              <span
                title="Yes means this employee can be assigned work. No keeps them in history only."
                style={infoIconStyle}
              >
                i
              </span>
            </span>

            <select
              value={form.active}
              onChange={(event) => updateField("active", event.target.value)}
              style={inputStyle}
            >
              {activeOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  title={option.description}
                >
                  {option.label}
                </option>
              ))}
            </select>

            {activeDescription ? (
              <small style={helpTextStyle}>{activeDescription}</small>
            ) : null}
          </label>
        </section>

        <div style={confirmationBoxStyle}>
          Before submitting, confirm the name and email are correct. This
          employee will become available in dropdowns across the app.
        </div>

        <div style={buttonRowStyle}>
          <button
            type="button"
            onClick={submitForm}
            disabled={saving}
            style={submitButtonStyle}
          >
            {saving ? "Submitting..." : "Submit Employee"}
          </button>

          <a href="/" style={secondaryButtonStyle}>
            Open Manager
          </a>

          <a href="/?table=employees" style={secondaryButtonStyle}>
            Back to Employees
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