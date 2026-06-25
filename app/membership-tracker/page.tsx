"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "../../lib/supabase/client";

type Employee = {
  id: number;
  name: string | null;
};

type FormState = {
  tracker_date: string;
  submitted_by: string;

  active_members_start: string;
  new_memberships: string;
  cancelled_memberships: string;
  paused_memberships: string;
  reactivated_memberships: string;
  active_members_end: string;

  membership_revenue_collected: string;
  membership_payments_failed: string;
  failed_payment_amount: string;

  outreach_calls_made: string;
  membership_follow_ups_due: string;
  membership_follow_ups_completed: string;

  cancellation_reason: string;
  notes: string;
};

const today = new Date().toISOString().slice(0, 10);

const emptyForm: FormState = {
  tracker_date: today,
  submitted_by: "",

  active_members_start: "0",
  new_memberships: "0",
  cancelled_memberships: "0",
  paused_memberships: "0",
  reactivated_memberships: "0",
  active_members_end: "0",

  membership_revenue_collected: "0",
  membership_payments_failed: "0",
  failed_payment_amount: "0",

  outreach_calls_made: "0",
  membership_follow_ups_due: "0",
  membership_follow_ups_completed: "0",

  cancellation_reason: "",
  notes: "",
};

type NumberField = {
  key: keyof FormState;
  label: string;
  help: string;
};

const membershipCountFields: NumberField[] = [
  {
    key: "active_members_start",
    label: "Active Members at Start",
    help: "The number of active members at the start of the tracking day or period.",
  },
  {
    key: "new_memberships",
    label: "New Memberships",
    help: "The number of new memberships started during this tracking day or period.",
  },
  {
    key: "cancelled_memberships",
    label: "Cancelled Memberships",
    help: "The number of memberships cancelled during this tracking day or period.",
  },
  {
    key: "paused_memberships",
    label: "Paused Memberships",
    help: "The number of memberships temporarily paused during this tracking day or period.",
  },
  {
    key: "reactivated_memberships",
    label: "Reactivated Memberships",
    help: "The number of paused, cancelled, or inactive memberships that became active again.",
  },
  {
    key: "active_members_end",
    label: "Active Members at End",
    help: "The number of active members at the end of the tracking day or period.",
  },
];

const paymentFields: NumberField[] = [
  {
    key: "membership_payments_failed",
    label: "Membership Payments Failed",
    help: "The number of membership payments that failed or did not process successfully.",
  },
];

const outreachFields: NumberField[] = [
  {
    key: "outreach_calls_made",
    label: "Outreach Calls Made",
    help: "The number of calls made to members or prospective members.",
  },
  {
    key: "membership_follow_ups_due",
    label: "Membership Follow-Ups Due",
    help: "The number of membership follow-ups that were due during this tracking day or period.",
  },
  {
    key: "membership_follow_ups_completed",
    label: "Membership Follow-Ups Completed",
    help: "The number of due membership follow-ups that were completed.",
  },
];

function toNumber(value: string) {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return 0;

  return numberValue;
}

export default function MembershipTrackerPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const netMembershipChange = useMemo(() => {
    return (
      toNumber(form.new_memberships) +
      toNumber(form.reactivated_memberships) -
      toNumber(form.cancelled_memberships) -
      toNumber(form.paused_memberships)
    );
  }, [
    form.new_memberships,
    form.reactivated_memberships,
    form.cancelled_memberships,
    form.paused_memberships,
  ]);

  const followUpCompletionRate = useMemo(() => {
    const due = toNumber(form.membership_follow_ups_due);
    const completed = toNumber(form.membership_follow_ups_completed);

    if (due === 0) return "N/A";

    return `${((completed / due) * 100).toFixed(1)}%`;
  }, [form.membership_follow_ups_due, form.membership_follow_ups_completed]);

  const totalPaymentRisk = useMemo(() => {
    return toNumber(form.failed_payment_amount);
  }, [form.failed_payment_amount]);

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

  function numberInput(field: NumberField) {
    return (
      <label style={formLabelStyle} title={field.help}>
        <span style={labelRowStyle}>
          {field.label}
          <span title={field.help} style={infoIconStyle}>
            i
          </span>
        </span>

        <input
          type="number"
          min="0"
          value={form[field.key]}
          onChange={(event) => updateField(field.key, event.target.value)}
          style={inputStyle}
        />
      </label>
    );
  }

  async function submitForm() {
    setMessage("");
    setErrorMessage("");

    if (!form.tracker_date) {
      setErrorMessage("Date is required.");
      return;
    }

    if (!form.submitted_by) {
      setErrorMessage("Submitted By is required.");
      return;
    }

    setSaving(true);

    const payload = {
      tracker_date: form.tracker_date,
      submitted_by: Number(form.submitted_by),

      active_members_start: toNumber(form.active_members_start),
      new_memberships: toNumber(form.new_memberships),
      cancelled_memberships: toNumber(form.cancelled_memberships),
      paused_memberships: toNumber(form.paused_memberships),
      reactivated_memberships: toNumber(form.reactivated_memberships),
      active_members_end: toNumber(form.active_members_end),

      membership_revenue_collected: toNumber(
        form.membership_revenue_collected
      ),
      membership_payments_failed: toNumber(form.membership_payments_failed),
      failed_payment_amount: toNumber(form.failed_payment_amount),

      outreach_calls_made: toNumber(form.outreach_calls_made),
      membership_follow_ups_due: toNumber(form.membership_follow_ups_due),
      membership_follow_ups_completed: toNumber(
        form.membership_follow_ups_completed
      ),

      cancellation_reason: form.cancellation_reason || null,
      notes: form.notes || null,
    };

    const supabase = createClient();

    const { error } = await supabase.from("membership_tracker").insert(payload);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage("Membership Tracker submitted.");
    setForm(emptyForm);
    setSaving(false);
  }

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <a href="/?table=membership_tracker" style={backLinkStyle}>
            ← Back to Membership Tracker
          </a>

          <div style={eyebrowStyle}>PRACTICE FOUNDER · TRACKERS</div>
          <h1 style={titleStyle}>Membership Tracker</h1>
          <p style={descriptionStyle}>
            Track membership growth, cancellations, pauses, reactivations,
            membership revenue, failed payments, outreach, follow-ups, and notes.
          </p>
        </div>

        <a href="/" style={managerButtonStyle}>
          Open Manager
        </a>
      </header>

      {message && <div style={successBoxStyle}>{message}</div>}
      {errorMessage && <div style={errorBoxStyle}>{errorMessage}</div>}

      <section style={summaryGridStyle}>
        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Net Membership Change</div>
          <div style={summaryValueStyle}>{netMembershipChange}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Active Members at End</div>
          <div style={summaryValueStyle}>{toNumber(form.active_members_end)}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Follow-Up Completion</div>
          <div style={summaryValueStyle}>{followUpCompletionRate}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Failed Payment Amount</div>
          <div style={summaryValueStyle}>${totalPaymentRisk.toFixed(2)}</div>
        </div>
      </section>

      <section style={formCardStyle}>
        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>GENERAL</div>
            <h2 style={sectionTitleStyle}>Submission Details</h2>
            <p style={sectionTextStyle}>
              Confirm who is submitting this tracker and the date these membership numbers belong to.
            </p>
          </div>

          <div style={twoColumnGridStyle}>
            <label
              style={formLabelStyle}
              title="The employee who is submitting the Membership Tracker."
            >
              <span style={labelRowStyle}>
                Submitted By *
                <span
                  title="The employee who is submitting the Membership Tracker."
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
                    {employee.name}
                  </option>
                ))}
              </select>
            </label>

            <label
              style={formLabelStyle}
              title="The business date these membership tracker numbers belong to."
            >
              <span style={labelRowStyle}>
                Date *
                <span
                  title="The business date these membership tracker numbers belong to."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <input
                type="date"
                value={form.tracker_date}
                onChange={(event) =>
                  updateField("tracker_date", event.target.value)
                }
                style={inputStyle}
              />
            </label>
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>MEMBERSHIP COUNT</div>
            <h2 style={sectionTitleStyle}>Membership Movement</h2>
            <p style={sectionTextStyle}>
              Track the beginning member count, new activity, cancellations, pauses, reactivations, and ending member count.
            </p>
          </div>

          <div style={formGridStyle}>
            {membershipCountFields.map((field) => numberInput(field))}
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>PAYMENTS</div>
            <h2 style={sectionTitleStyle}>Membership Revenue and Failed Payments</h2>
            <p style={sectionTextStyle}>
              Track collected membership revenue and any failed payment issues.
            </p>
          </div>

          <div style={formGridStyle}>
            <label
              style={formLabelStyle}
              title="The total membership revenue collected during this tracking day or period."
            >
              <span style={labelRowStyle}>
                Membership Revenue Collected
                <span
                  title="The total membership revenue collected during this tracking day or period."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.membership_revenue_collected}
                onChange={(event) =>
                  updateField("membership_revenue_collected", event.target.value)
                }
                style={inputStyle}
              />
            </label>

            {paymentFields.map((field) => numberInput(field))}

            <label
              style={formLabelStyle}
              title="The total dollar amount connected to failed membership payments."
            >
              <span style={labelRowStyle}>
                Failed Payment Amount
                <span
                  title="The total dollar amount connected to failed membership payments."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.failed_payment_amount}
                onChange={(event) =>
                  updateField("failed_payment_amount", event.target.value)
                }
                style={inputStyle}
              />
            </label>
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>OUTREACH</div>
            <h2 style={sectionTitleStyle}>Outreach and Follow-Ups</h2>
            <p style={sectionTextStyle}>
              Track calls and membership follow-up completion.
            </p>
          </div>

          <div style={formGridStyle}>
            {outreachFields.map((field) => numberInput(field))}
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>CANCELLATIONS</div>
            <h2 style={sectionTitleStyle}>Cancellation Reason</h2>
            <p style={sectionTextStyle}>
              Add context if memberships were cancelled during this period.
            </p>
          </div>

          <label
            style={formLabelStyle}
            title="The main reason memberships were cancelled, if any cancellations happened."
          >
            <span style={labelRowStyle}>
              Cancellation Reason
              <span
                title="The main reason memberships were cancelled, if any cancellations happened."
                style={infoIconStyle}
              >
                i
              </span>
            </span>

            <textarea
              value={form.cancellation_reason}
              onChange={(event) =>
                updateField("cancellation_reason", event.target.value)
              }
              style={textareaStyle}
            />
          </label>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>NOTES</div>
            <h2 style={sectionTitleStyle}>Notes</h2>
            <p style={sectionTextStyle}>
              Add anything unusual about membership activity that Practice Founder should review.
            </p>
          </div>

          <label
            style={formLabelStyle}
            title="Extra context, unusual membership activity, operational notes, or follow-up items."
          >
            <span style={labelRowStyle}>
              Notes
              <span
                title="Extra context, unusual membership activity, operational notes, or follow-up items."
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
          Before submitting, confirm the membership counts, payment fields, and follow-up numbers are correct.
        </div>

        <div style={buttonRowStyle}>
          <button
            type="button"
            onClick={submitForm}
            disabled={saving}
            style={submitButtonStyle}
          >
            {saving ? "Submitting..." : "Submit Membership Tracker"}
          </button>

          <a href="/" style={secondaryButtonStyle}>
            Open Manager
          </a>

          <a href="/?table=membership_tracker" style={secondaryButtonStyle}>
            Back to Membership Tracker
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
  maxWidth: "760px",
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
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
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
  fontSize: "22px",
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

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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

const inputStyle: CSSProperties = {
  width: "100%",
  height: "42px",
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