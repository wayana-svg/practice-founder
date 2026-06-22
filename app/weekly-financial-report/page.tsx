"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "../../lib/supabase/client";

type Employee = {
  id: number;
  name: string | null;
  email: string | null;
};

type FormState = {
  revenue: string;
submitted_by: string;
  week_start: string;
  week_end: string;
  is_this_completed: boolean;

  bills_expenses_paid: string;
  other_deposits: string;
  cash_card_check_payments: string;
  insurance_payments: string;

  payroll_for_week: string;
  contractor_payments: string;
  owner_pay_for_week: string;
  was_owner_pay_distributed: boolean;

  payroll_starting_balance: string;
  what_blocked_money_this_week: string;
  what_staffing_gaps_were_there: string;
  one_thing_to_fix_next_week: string;

  notes: string;
};

const today = new Date().toISOString().slice(0, 10);

const emptyForm: FormState = {
  revenue: "",
submitted_by: "",
  week_start: today,
  week_end: today,
  is_this_completed: false,

  bills_expenses_paid: "0",
  other_deposits: "0",
  cash_card_check_payments: "0",
  insurance_payments: "0",

  payroll_for_week: "0",
  contractor_payments: "0",
  owner_pay_for_week: "0",
  was_owner_pay_distributed: false,

  payroll_starting_balance: "0",
  what_blocked_money_this_week: "",
  what_staffing_gaps_were_there: "",
  one_thing_to_fix_next_week: "",

  notes: "",
};

type MoneyField = {
  key: keyof FormState;
  label: string;
  help: string;
  required?: boolean;
};

const revenueFields: MoneyField[] = [
  {
    key: "bills_expenses_paid",
    label: "Bills and Expenses Paid",
    help: "Required. Total bills and expenses paid this week.",
    required: true,
  },
  {
    key: "other_deposits",
    label: "Other Deposits",
    help: "Required. Any deposits beyond standard revenue.",
    required: true,
  },
  {
    key: "cash_card_check_payments",
    label: "Cash, Card, or Check Payments",
    help: "Required. Revenue collected through cash, card, or check payments.",
    required: true,
  },
  {
    key: "insurance_payments",
    label: "Insurance Payments",
    help: "Required. Total insurance payments received this week.",
    required: true,
  },
];

const labourFields: MoneyField[] = [
  {
    key: "payroll_for_week",
    label: "Payroll for the Week",
    help: "Required. Total payroll paid to employees this week. Do not include contractors or owner pay here.",
    required: true,
  },
  {
    key: "contractor_payments",
    label: "Contractor Payments",
    help: "Required. Total payments made to contractors this week. Keep this separate from employee payroll.",
    required: true,
  },
  {
    key: "owner_pay_for_week",
    label: "Owner Pay for the Week",
    help: "Required. Dollar amount the practice owner was paid this week. Keep this separate from payroll and contractor payments.",
    required: true,
  },
  {
    key: "payroll_starting_balance",
    label: "Payroll Starting Balance",
    help: "Required. Starting balance of the payroll account at the beginning of the week.",
    required: true,
  },
];

function toNumber(value: string) {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return 0;

  return numberValue;
}

export default function WeeklyFinancialReportPage() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [autoSubmittedByName, setAutoSubmittedByName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const revenueCollected = useMemo(() => {
    return (
      toNumber(form.other_deposits) +
      toNumber(form.cash_card_check_payments) +
      toNumber(form.insurance_payments)
    );
  }, [
    form.other_deposits,
    form.cash_card_check_payments,
    form.insurance_payments,
  ]);

  const totalLabourCosts = useMemo(() => {
    return toNumber(form.payroll_for_week) + toNumber(form.contractor_payments);
  }, [form.payroll_for_week, form.contractor_payments]);

  const endOfWeekBalance = useMemo(() => {
    return (
      toNumber(form.payroll_starting_balance) +
      revenueCollected -
      toNumber(form.bills_expenses_paid) -
      toNumber(form.payroll_for_week) -
      toNumber(form.contractor_payments) -
      toNumber(form.owner_pay_for_week)
    );
  }, [
    form.payroll_starting_balance,
    revenueCollected,
    form.bills_expenses_paid,
    form.payroll_for_week,
    form.contractor_payments,
    form.owner_pay_for_week,
  ]);

  const payrollPercentOfRevenue = useMemo(() => {
    if (revenueCollected === 0) return null;

    return (toNumber(form.payroll_for_week) / revenueCollected) * 100;
  }, [form.payroll_for_week, revenueCollected]);

  useEffect(() => {
    loadEmployeesAndUser();
  }, []);

  async function loadEmployeesAndUser() {
    const supabase = createClient();

    const { data: employeeData, error: employeeError } = await supabase
      .from("employees")
      .select("id, name, email")
      .order("name", { ascending: true });

    if (employeeError) {
      setErrorMessage(employeeError.message);
      return;
    }

    const employeeRows = (employeeData as Employee[]) || [];
    setEmployees(employeeRows);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) return;

    const matchingEmployee = employeeRows.find(
      (employee) =>
        employee.email?.toLowerCase().trim() === user.email?.toLowerCase().trim()
    );

    if (!matchingEmployee) return;

    setForm((current) => ({
      ...current,
      submitted_by: String(matchingEmployee.id),
    }));

    setAutoSubmittedByName(matchingEmployee.name || user.email);
  }

  function updateField(field: keyof FormState, value: string | boolean) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function moneyInput(field: MoneyField) {
    return (
      <label style={formLabelStyle} title={field.help}>
        <span style={labelRowStyle}>
          {field.label}
          {field.required ? <span>*</span> : null}
          <span title={field.help} style={infoIconStyle}>
            i
          </span>
        </span>

        <input
          type="number"
          min="0"
          step="0.01"
          value={String(form[field.key])}
          onChange={(event) => updateField(field.key, event.target.value)}
          style={inputStyle}
        />
      </label>
    );
  }

  async function submitForm() {
    setMessage("");
    setErrorMessage("");

    if (!form.submitted_by) {
      setErrorMessage(
        "Submitted By is required. If login auto-fill is not available yet, choose an employee manually."
      );
      return;
    }

    if (!form.week_start) {
      setErrorMessage("Week Start is required.");
      return;
    }

    if (!form.week_end) {
      setErrorMessage("Week End is required.");
      return;
    }

    if (form.week_end < form.week_start) {
      setErrorMessage("Week End must be after Week Start.");
      return;
    }

    setSaving(true);

    const payload = {
      revenue: form.revenue ? Number(form.revenue) : null,
submitted_by: Number(form.submitted_by),
      week_start: form.week_start,
      week_end: form.week_end,
      is_this_completed: form.is_this_completed,

      bills_expenses_paid: toNumber(form.bills_expenses_paid),
      other_deposits: toNumber(form.other_deposits),
      cash_card_check_payments: toNumber(form.cash_card_check_payments),
      insurance_payments: toNumber(form.insurance_payments),
      revenue_collected: revenueCollected,

      payroll_for_week: toNumber(form.payroll_for_week),
      contractor_payments: toNumber(form.contractor_payments),
      owner_pay_for_week: toNumber(form.owner_pay_for_week),
      was_owner_pay_distributed: form.was_owner_pay_distributed,

      payroll_starting_balance: toNumber(form.payroll_starting_balance),
      what_blocked_money_this_week:
        form.what_blocked_money_this_week || null,
      what_staffing_gaps_were_there:
        form.what_staffing_gaps_were_there || null,
      one_thing_to_fix_next_week: form.one_thing_to_fix_next_week || null,

      end_of_week_balance: endOfWeekBalance,
      total_labour_costs: totalLabourCosts,
      payroll_as_percent_of_collected_revenue: payrollPercentOfRevenue,

      notes: form.notes || null,
    };

    const supabase = createClient();

    const { error } = await supabase
      .from("weekly_financial_reports")
      .insert(payload);

    if (error) {
      setErrorMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage("Weekly Financial Report submitted.");
    setForm({
      ...emptyForm,
      submitted_by: form.submitted_by,
    });
    setSaving(false);
  }

  return (
    <main style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <a href="/?table=weekly_financial_reports" style={backLinkStyle}>
            ← Back to Weekly Financial Reports
          </a>

          <div style={eyebrowStyle}>PRACTICE FOUNDER · TRACKERS</div>
          <h1 style={titleStyle}>Weekly Financial Report</h1>
          <p style={descriptionStyle}>
            Track weekly revenue collected, expenses paid, payroll, contractor
            payments, owner pay, payroll balance, blocked money, staffing gaps,
            and next week’s priority fix.
          </p>
        </div>

        <a href="/weekly-financial-reports-list" style={managerButtonStyle}>
          Open Manager
        </a>
      </header>

      {message && <div style={successBoxStyle}>{message}</div>}
      {errorMessage && <div style={errorBoxStyle}>{errorMessage}</div>}

      <section style={summaryGridStyle}>
        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Revenue Collected</div>
          <div style={summaryValueStyle}>${revenueCollected.toFixed(2)}</div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Payroll % of Revenue</div>
          <div style={summaryValueStyle}>
            {payrollPercentOfRevenue === null
              ? "N/A"
              : `${payrollPercentOfRevenue.toFixed(1)}%`}
          </div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>Owner Pay Distributed</div>
          <div style={summaryValueStyle}>
            {form.was_owner_pay_distributed ? "Yes" : "No"}
          </div>
        </div>

        <div style={summaryCardStyle}>
          <div style={summaryLabelStyle}>End of Week Balance</div>
          <div style={summaryValueStyle}>${endOfWeekBalance.toFixed(2)}</div>
        </div>
      </section>

      <section style={formCardStyle}>
        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>GENERAL</div>
            <h2 style={sectionTitleStyle}>Submission Details</h2>
            <p style={sectionTextStyle}>
              Confirm the report owner, reporting week, and whether this report
              is complete.
            </p>
          </div>

          <div style={formGridStyle}>
            <label
              style={formLabelStyle}
              title="Required. Auto-populated from login when the logged-in user's email matches an employee record. If login is not active yet, choose the employee manually."
            >
              <span style={labelRowStyle}>
                Submitted By *
                <span
                  title="Required. Auto-populated from login when the logged-in user's email matches an employee record. If login is not active yet, choose the employee manually."
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
                disabled={Boolean(autoSubmittedByName)}
                style={inputStyle}
              >
                <option value="">
                  {autoSubmittedByName
                    ? autoSubmittedByName
                    : "Select employee"}
                </option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </label>

            <label
              style={formLabelStyle}
              title="Required. First day of the week this report covers."
            >
              <span style={labelRowStyle}>
                Week Start *
                <span
                  title="Required. First day of the week this report covers."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <input
                type="date"
                value={form.week_start}
                onChange={(event) =>
                  updateField("week_start", event.target.value)
                }
                style={inputStyle}
              />
            </label>

            <label
              style={formLabelStyle}
              title="Required. Last day of the week. Must be after Week Start."
            >
              <span style={labelRowStyle}>
                Week End *
                <span
                  title="Required. Last day of the week. Must be after Week Start."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <input
                type="date"
                value={form.week_end}
                onChange={(event) => updateField("week_end", event.target.value)}
                style={inputStyle}
              />
            </label>

            <label
              style={checkboxLabelStyle}
              title="Default unchecked. Check only when all fields are fully entered. This allows partial saves mid-week."
            >
              <input
                type="checkbox"
                checked={form.is_this_completed}
                onChange={(event) =>
                  updateField("is_this_completed", event.target.checked)
                }
              />
              Is This Completed?
              <span
                title="Default unchecked. Check only when all fields are fully entered. This allows partial saves mid-week."
                style={infoIconStyle}
              >
                i
              </span>
            </label>
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>REVENUE AND EXPENSES</div>
            <h2 style={sectionTitleStyle}>Revenue Collected and Money Out</h2>
            <p style={sectionTextStyle}>
              Revenue Collected calculates automatically from Other Deposits,
              Cash/Card/Check Payments, and Insurance Payments.
            </p>
          </div>

          <div style={formGridStyle}>
            {revenueFields.map((field) => moneyInput(field))}
          </div>

          <div
            style={calculatedBoxStyle}
            title="Required. Total revenue from all sources this week. Formula: Other Deposits + Cash, Card, or Check Payments + Insurance Payments."
          >
            <div style={summaryLabelStyle}>
              Revenue Collected
              <span
                title="Required. Total revenue from all sources this week. Formula: Other Deposits + Cash, Card, or Check Payments + Insurance Payments."
                style={infoIconStyle}
              >
                i
              </span>
            </div>
            <strong>${revenueCollected.toFixed(2)}</strong>
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>LABOUR AND OWNER PAY</div>
            <h2 style={sectionTitleStyle}>Payroll, Contractors, and Owner Pay</h2>
            <p style={sectionTextStyle}>
              Labour costs include payroll and contractor payments. Owner pay is
              tracked separately.
            </p>
          </div>

          <div style={formGridStyle}>
            {labourFields.map((field) => moneyInput(field))}

            <label
              style={checkboxLabelStyle}
              title="Checked means the owner was paid as scheduled this week."
            >
              <input
                type="checkbox"
                checked={form.was_owner_pay_distributed}
                onChange={(event) =>
                  updateField("was_owner_pay_distributed", event.target.checked)
                }
              />
              Was Owner Pay Distributed?
              <span
                title="Checked means the owner was paid as scheduled this week."
                style={infoIconStyle}
              >
                i
              </span>
            </label>
          </div>

          <div style={calculatedGridStyle}>
            <div
              style={calculatedBoxStyle}
              title="Auto-calculated. Formula: Payroll for the Week + Contractor Payments. Does not include Owner Pay."
            >
              <div style={summaryLabelStyle}>
                Total Labour Costs
                <span
                  title="Auto-calculated. Formula: Payroll for the Week + Contractor Payments. Does not include Owner Pay."
                  style={infoIconStyle}
                >
                  i
                </span>
              </div>
              <strong>${totalLabourCosts.toFixed(2)}</strong>
            </div>

            <div
              style={calculatedBoxStyle}
              title="Auto-calculated. Formula: Payroll Starting Balance + Revenue Collected - Bills and Expenses Paid - Payroll - Contractor Payments - Owner Pay."
            >
              <div style={summaryLabelStyle}>
                End of Week Balance
                <span
                  title="Auto-calculated. Formula: Payroll Starting Balance + Revenue Collected - Bills and Expenses Paid - Payroll - Contractor Payments - Owner Pay."
                  style={infoIconStyle}
                >
                  i
                </span>
              </div>
              <strong>${endOfWeekBalance.toFixed(2)}</strong>
            </div>

            <div
              style={calculatedBoxStyle}
              title="Auto-calculated. Formula: Payroll for the Week divided by Revenue Collected, multiplied by 100. Shows N/A when Revenue Collected is 0."
            >
              <div style={summaryLabelStyle}>
                Payroll as % of Collected Revenue
                <span
                  title="Auto-calculated. Formula: Payroll for the Week divided by Revenue Collected, multiplied by 100. Shows N/A when Revenue Collected is 0."
                  style={infoIconStyle}
                >
                  i
                </span>
              </div>
              <strong>
                {payrollPercentOfRevenue === null
                  ? "N/A"
                  : `${payrollPercentOfRevenue.toFixed(1)}%`}
              </strong>
            </div>
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>BLOCKERS AND NEXT WEEK</div>
            <h2 style={sectionTitleStyle}>Operational Notes</h2>
            <p style={sectionTextStyle}>
              Capture what blocked money, what staffing gaps affected finances,
              and the one thing to fix next week.
            </p>
          </div>

          <div style={twoColumnGridStyle}>
            <label
              style={formLabelStyle}
              title="Optional. Any money that was blocked, delayed, or did not move as expected."
            >
              <span style={labelRowStyle}>
                What Blocked Money This Week?
                <span
                  title="Optional. Any money that was blocked, delayed, or did not move as expected."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <textarea
                value={form.what_blocked_money_this_week}
                onChange={(event) =>
                  updateField("what_blocked_money_this_week", event.target.value)
                }
                style={textareaStyle}
              />
            </label>

            <label
              style={formLabelStyle}
              title="Optional. Any staffing gaps that affected operations or finances."
            >
              <span style={labelRowStyle}>
                What Staffing Gaps Were There?
                <span
                  title="Optional. Any staffing gaps that affected operations or finances."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <textarea
                value={form.what_staffing_gaps_were_there}
                onChange={(event) =>
                  updateField(
                    "what_staffing_gaps_were_there",
                    event.target.value
                  )
                }
                style={textareaStyle}
              />
            </label>

            <label
              style={formLabelStyle}
              title="Optional. The single highest-priority improvement item for next week."
            >
              <span style={labelRowStyle}>
                One Thing to Fix Next Week
                <span
                  title="Optional. The single highest-priority improvement item for next week."
                  style={infoIconStyle}
                >
                  i
                </span>
              </span>

              <input
                type="text"
                value={form.one_thing_to_fix_next_week}
                onChange={(event) =>
                  updateField("one_thing_to_fix_next_week", event.target.value)
                }
                style={inputStyle}
              />
            </label>
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionIntroStyle}>
            <div style={sectionTagStyle}>NOTES</div>
            <h2 style={sectionTitleStyle}>Notes</h2>
            <p style={sectionTextStyle}>
              Add any extra financial context that does not fit the fields above.
            </p>
          </div>

          <label
            style={formLabelStyle}
            title="Optional. Extra context, unusual financial activity, operational notes, or follow-up items."
          >
            <span style={labelRowStyle}>
              Notes
              <span
                title="Optional. Extra context, unusual financial activity, operational notes, or follow-up items."
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
          Before submitting, confirm the required fields are entered. Leave
          “Is This Completed?” unchecked if this is only a partial mid-week save.
        </div>

        <div style={buttonRowStyle}>
          <button
            type="button"
            onClick={submitForm}
            disabled={saving}
            style={submitButtonStyle}
          >
            {saving ? "Submitting..." : "Submit Weekly Financial Report"}
          </button>

          <a href="/weekly-financial-reports-list" style={secondaryButtonStyle}>
            Open Manager
          </a>

          <a href="/?table=weekly_financial_reports" style={secondaryButtonStyle}>
            Back to Weekly Financial Reports
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

const calculatedGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "16px",
  marginTop: "16px",
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
  marginLeft: "6px",
};

const checkboxLabelStyle: CSSProperties = {
  minHeight: "42px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: colors.cream,
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "0 10px",
  fontWeight: 800,
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