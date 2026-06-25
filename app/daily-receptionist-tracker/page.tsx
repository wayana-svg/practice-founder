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

  annual_wellness_visits: string;
  comprehensive_physical_exam: string;
  new_cpe: string;
  well_woman_check: string;
  well_woman_exam: string;
  immigration_physical: string;
  new_patient_evaluation: string;
  follow_up_visits: string;
  six_visits: string;
  nurse_visits: string;
  chronic_care_management: string;
  telehealth_telemedicine: string;
  wellness_evaluation: string;
  wellness_follow_up: string;
  wellness_shots: string;
  iv_therapy: string;
  pellet_insertion: string;
  joint_injection: string;
  home_mobile_visits: string;
  same_day_add_ons: string;

  no_shows: string;
  reschedules: string;
  non_billable_phone_calls: string;
  referrals: string;

  cash_collected: string;
  credit_card_collected: string;
  check_collected: string;

  notes: string;
};

const today = new Date().toISOString().slice(0, 10);

const emptyForm: FormState = {
  tracker_date: today,
  submitted_by: "",

  annual_wellness_visits: "0",
  comprehensive_physical_exam: "0",
  new_cpe: "0",
  well_woman_check: "0",
  well_woman_exam: "0",
  immigration_physical: "0",
  new_patient_evaluation: "0",
  follow_up_visits: "0",
  six_visits: "0",
  nurse_visits: "0",
  chronic_care_management: "0",
  telehealth_telemedicine: "0",
  wellness_evaluation: "0",
  wellness_follow_up: "0",
  wellness_shots: "0",
  iv_therapy: "0",
  pellet_insertion: "0",
  joint_injection: "0",
  home_mobile_visits: "0",
  same_day_add_ons: "0",

  no_shows: "0",
  reschedules: "0",
  non_billable_phone_calls: "0",
  referrals: "0",

  cash_collected: "0",
  credit_card_collected: "0",
  check_collected: "0",

  notes: "",
};

const preventiveFields: Array<{
  key: keyof FormState;
  label: string;
  help: string;
}> = [
  {
    key: "annual_wellness_visits",
    label: "Annual Wellness Visits (AWV)",
    help: "A Medicare-covered preventive visit for eligible patients. Count completed visits only.",
  },
  {
    key: "comprehensive_physical_exam",
    label: "Comprehensive Physical Exam (CPE)",
    help: "A full preventive physical exam. Count completed visits only.",
  },
  {
    key: "new_cpe",
    label: "New CPE",
    help: "Comprehensive physical exams completed for new patients.",
  },
  {
    key: "well_woman_check",
    label: "Well Woman Check (WWC)",
    help: "Completed well woman check visits for the day.",
  },
  {
    key: "well_woman_exam",
    label: "Well Woman Exam (WWE)",
    help: "Completed well woman exam visits for the day.",
  },
  {
    key: "immigration_physical",
    label: "Immigration Physical (IP)",
    help: "Completed immigration physical appointments for the day.",
  },
];

const serviceFields: Array<{
  key: keyof FormState;
  label: string;
  help: string;
}> = [
  {
    key: "new_patient_evaluation",
    label: "New Patient Evaluation (NPE)",
    help: "New patients seen today for an initial evaluation.",
  },
  {
    key: "follow_up_visits",
    label: "Follow-Up Visits",
    help: "Completed visits for existing patients returning for follow-up care.",
  },
  {
    key: "six_visits",
    label: "Sick Visits",
    help: "Completed visits for patients being seen because they are sick or have an acute concern.",
  },
  {
    key: "nurse_visits",
    label: "Nurse Visits",
    help: "Completed nurse-only visits or nurse-supported appointments.",
  },
  {
    key: "chronic_care_management",
    label: "Chronic Care Management (CCM)",
    help: "Care management services for patients with chronic conditions.",
  },
  {
    key: "telehealth_telemedicine",
    label: "Telehealth / Telemedicine",
    help: "Completed virtual care visits done by phone or video.",
  },
  {
    key: "wellness_evaluation",
    label: "Wellness Evaluation (WE)",
    help: "Completed wellness evaluation visits.",
  },
  {
    key: "wellness_follow_up",
    label: "Wellness Follow-Up",
    help: "Completed follow-up visits connected to a wellness care plan.",
  },
  {
    key: "wellness_shots",
    label: "Wellness Shots",
    help: "Completed wellness injection or shot appointments.",
  },
  {
    key: "iv_therapy",
    label: "IV Therapy",
    help: "Intravenous therapy. This means fluids, vitamins, nutrients, or medication given directly into a vein through an IV line.",
  },
  {
    key: "pellet_insertion",
    label: "Pellet Insertion (PI)",
    help: "Completed hormone pellet insertion procedures.",
  },
  {
    key: "joint_injection",
    label: "Joint Injection (JI)",
    help: "Completed joint injection procedures.",
  },
  {
    key: "home_mobile_visits",
    label: "Home / Mobile Visits",
    help: "Completed visits performed at the patient’s home or through mobile care.",
  },
  {
    key: "same_day_add_ons",
    label: "Same-Day Add-Ons",
    help: "Patients added to the schedule and seen on the same day.",
  },
];

const operationsFields: Array<{
  key: keyof FormState;
  label: string;
  help: string;
}> = [
  {
    key: "no_shows",
    label: "No-Shows",
    help: "Patients who had a scheduled appointment but did not arrive.",
  },
  {
    key: "reschedules",
    label: "Reschedules",
    help: "Appointments moved from the original date to another date.",
  },
  {
    key: "non_billable_phone_calls",
    label: "Non-Billable Phone Calls",
    help: "Inbound or outbound patient calls handled by the team that were not billable visits.",
  },
  {
    key: "referrals",
    label: "Referrals",
    help: "Formal referrals created or issued during the day.",
  },
];

function toNumber(value: string) {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return 0;

  return numberValue;
}

export default function DailyReceptionistTrackerPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const totalCollections = useMemo(() => {
    return (
      toNumber(form.cash_collected) +
      toNumber(form.credit_card_collected) +
      toNumber(form.check_collected)
    );
  }, [form.cash_collected, form.credit_card_collected, form.check_collected]);

  const totalCompletedVisits = useMemo(() => {
    const fields = [...preventiveFields, ...serviceFields];

    return fields.reduce((total, field) => {
      return total + toNumber(String(form[field.key]));
    }, 0);
  }, [form]);

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

  function numberInput(field: keyof FormState, label: string, help: string) {
    return (
      <label style={formLabelStyle} title={help}>
        <span style={labelRowStyle}>
          {label}
          <span title={help} style={infoIconStyle}>
            i
          </span>
        </span>

        <input
          type="number"
          min="0"
          value={form[field]}
          onChange={(event) => updateField(field, event.target.value)}
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

      annual_wellness_visits: toNumber(form.annual_wellness_visits),
      comprehensive_physical_exam: toNumber(form.comprehensive_physical_exam),
      new_cpe: toNumber(form.new_cpe),
      well_woman_check: toNumber(form.well_woman_check),
      well_woman_exam: toNumber(form.well_woman_exam),
      immigration_physical: toNumber(form.immigration_physical),
      new_patient_evaluation: toNumber(form.new_patient_evaluation),
      follow_up_visits: toNumber(form.follow_up_visits),
      six_visits: toNumber(form.six_visits),
      nurse_visits: toNumber(form.nurse_visits),
      chronic_care_management: toNumber(form.chronic_care_management),
      telehealth_telemedicine: toNumber(form.telehealth_telemedicine),
      wellness_evaluation: toNumber(form.wellness_evaluation),
      wellness_follow_up: toNumber(form.wellness_follow_up),
      wellness_shots: toNumber(form.wellness_shots),
      iv_therapy: toNumber(form.iv_therapy),
      pellet_insertion: toNumber(form.pellet_insertion),
      joint_injection: toNumber(form.joint_injection),
      home_mobile_visits: toNumber(form.home_mobile_visits),
      same_day_add_ons: toNumber(form.same_day_add_ons),

      no_shows: toNumber(form.no_shows),
      reschedules: toNumber(form.reschedules),
      non_billable_phone_calls: toNumber(form.non_billable_phone_calls),
      referrals: toNumber(form.referrals),

      cash_collected: toNumber(form.cash_collected),
      credit_card_collected: toNumber(form.credit_card_collected),
      check_collected: toNumber(form.check_collected),
      total_collections: totalCollections,

      notes: form.notes || null,
    };

    const supabase = createClient();

    const { error } = await supabase
      .from("daily_receptionist_tracker")
      .insert(payload);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage("Daily Receptionist Tracker submitted.");
    setForm(emptyForm);
    setSaving(false);
  }

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <a href="/?table=daily_receptionist_tracker" style={backLinkStyle}>
            ← Back to Daily Receptionist Tracker
          </a>

          <div style={eyebrowStyle}>PRACTICE FOUNDER · TRACKERS</div>
          <h1 style={titleStyle}>Daily Receptionist Tracker</h1>
          <p style={descriptionStyle}>
            Submit this form at the end of each day. Count only completed visits,
            collections received, referrals issued, and daily operational activity.
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
          <div style={summaryLabelStyle}>Completed Visits</div>
          <div style={summaryValueStyle}>{totalCompletedVisits}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Total Collections</div>
          <div style={summaryValueStyle}>${totalCollections.toFixed(2)}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Referrals</div>
          <div style={summaryValueStyle}>{toNumber(form.referrals)}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>No-Shows</div>
          <div style={summaryValueStyle}>{toNumber(form.no_shows)}</div>
        </div>
      </section>

      <section style={formCardStyle}>
        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>GENERAL</div>
            <h2 style={sectionTitleStyle}>Submission Details</h2>
            <p style={sectionTextStyle}>
              Confirm who is submitting this tracker and the date these counts are for.
            </p>
          </div>

          <div style={twoColumnGridStyle}>
            <label
              style={formLabelStyle}
              title="The employee who is submitting the Daily Receptionist Tracker."
            >
              <span style={labelRowStyle}>
                Submitted By *
                <span
                  title="The employee who is submitting the Daily Receptionist Tracker."
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
              title="The business date these receptionist tracker numbers belong to."
            >
              <span style={labelRowStyle}>
                Date *
                <span
                  title="The business date these receptionist tracker numbers belong to."
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
            <div style={sectionTagStyle}>PREVENTIVE CARE</div>
            <h2 style={sectionTitleStyle}>Preventive Care Visits</h2>
            <p style={sectionTextStyle}>
              Enter completed preventive care visits only. Enter 0 if none were completed.
            </p>
          </div>

          <div style={formGridStyle}>
            {preventiveFields.map((field) =>
              numberInput(field.key, field.label, field.help)
            )}
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>SERVICE ACTIVITY</div>
            <h2 style={sectionTitleStyle}>Service-Specific Visits</h2>
            <p style={sectionTextStyle}>
              These counts show what types of visits were completed by the practice today.
            </p>
          </div>

          <div style={formGridStyle}>
            {serviceFields.map((field) =>
              numberInput(field.key, field.label, field.help)
            )}
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>OPERATIONS</div>
            <h2 style={sectionTitleStyle}>Daily Operational Activity</h2>
            <p style={sectionTextStyle}>
              Track the activity that affects daily flow, schedule quality, and follow-up.
            </p>
          </div>

          <div style={formGridStyle}>
            {operationsFields.map((field) =>
              numberInput(field.key, field.label, field.help)
            )}
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>COLLECTIONS</div>
            <h2 style={sectionTitleStyle}>Collections by Payment Type</h2>
            <p style={sectionTextStyle}>
              Enter collections by payment type. Total Collections calculates automatically.
            </p>
          </div>

          <div style={formGridStyle}>
            <label
              style={formLabelStyle}
              title="Cash payments collected by the front desk or receptionist."
            >
              <span style={labelRowStyle}>
                Cash Collected
                <span
                  title="Cash payments collected by the front desk or receptionist."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.cash_collected}
                onChange={(event) =>
                  updateField("cash_collected", event.target.value)
                }
                style={inputStyle}
              />
            </label>

            <label
              style={formLabelStyle}
              title="Credit card payments collected by the front desk or receptionist."
            >
              <span style={labelRowStyle}>
                Credit Card Collected
                <span
                  title="Credit card payments collected by the front desk or receptionist."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.credit_card_collected}
                onChange={(event) =>
                  updateField("credit_card_collected", event.target.value)
                }
                style={inputStyle}
              />
            </label>

            <label
              style={formLabelStyle}
              title="Check payments collected by the front desk or receptionist."
            >
              <span style={labelRowStyle}>
                Check Collected
                <span
                  title="Check payments collected by the front desk or receptionist."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.check_collected}
                onChange={(event) =>
                  updateField("check_collected", event.target.value)
                }
                style={inputStyle}
              />
            </label>
          </div>

          <div
            style={calculatedBoxStyle}
            title="Total cash, credit card, and check collections entered on this tracker."
          >
            <div style={summaryLabelStyle}>Total Collections</div>
            <strong>${totalCollections.toFixed(2)}</strong>
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>NOTES</div>
            <h2 style={sectionTitleStyle}>Notes</h2>
            <p style={sectionTextStyle}>
              Add anything unusual about the day that Practice Founder should review.
            </p>
          </div>

          <label
            style={formLabelStyle}
            title="Extra context, unusual issues, operational notes, or follow-up items from the day."
          >
            <span style={labelRowStyle}>
              Notes
              <span
                title="Extra context, unusual issues, operational notes, or follow-up items from the day."
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
          Before submitting, confirm all required fields are complete. Count only completed
          visits, not scheduled, rescheduled, or no-show appointments.
        </div>

        <div style={buttonRowStyle}>
          <button
            type="button"
            onClick={submitForm}
            disabled={saving}
            style={submitButtonStyle}
          >
            {saving ? "Submitting..." : "Submit Daily Tracker"}
          </button>

          <a href="/" style={secondaryButtonStyle}>
            Open Manager
          </a>

          <a
            href="/?table=daily_receptionist_tracker"
            style={secondaryButtonStyle}
          >
            Back to Daily Receptionist Tracker
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

const calculatedBoxStyle: CSSProperties = {
  marginTop: "16px",
  background: colors.cream,
  border: `1px solid ${colors.border}`,
  padding: "14px",
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