"use client";

import MasterManager from "./MasterManager";
import type { MasterManagerConfig } from "./MasterManager";

const weeklyFinancialReportsManagerConfig: MasterManagerConfig = {
  title: "Weekly Financial Reports",
  eyebrow: "PRACTICE FOUNDER · TRACKERS",
  description:
    "Track weekly financial activity, revenue collected, payroll, contractor payments, owner pay, money blocks, staffing gaps, and next-week priorities.",
  tableName: "weekly_financial_reports",
  primaryKey: "id",
  backPath: "/weekly-financial-reports",
  addButtonLabel: "+ Add Weekly Financial Report",
  defaultSortField: "week_start_date",
  fields: [
    {
      key: "revenue",
      label: "Revenue",
      type: "currency",
      description:
        "Enter the actual revenue for this weekly financial report. This is typed manually and is not automatically calculated.",
    },

    {
      key: "submitted_by",
      label: "Submitted By",
      description:
        "Choose the employee submitting this weekly financial report. This should usually be the operations manager or the person responsible for weekly financial tracking.",
      type: "employee",
      required: true,
    },
    {
      key: "week_start_date",
      label: "Week Start Date",
      description:
        "Choose the first day of the week this report covers.",
      type: "date",
      required: true,
    },
    {
      key: "week_end_date",
      label: "Week End Date",
      description:
        "Choose the last day of the week this report covers. This should be after the week start date.",
      type: "date",
      required: true,
    },
    {
      key: "is_this_completed",
      label: "Is This Completed?",
      description:
        "Set this to Yes only when every field for the weekly report has been entered and reviewed. Leave it as No if the report is still being completed.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "bills_and_expenses_paid",
      label: "Bills and Expenses Paid",
      description:
        "Enter the total bills and expenses paid during the week.",
      type: "currency",
      defaultValue: "0",
      required: true,
    },
    {
      key: "other_deposits",
      label: "Other Deposits",
      description:
        "Enter any deposits beyond standard revenue collected during the week.",
      type: "currency",
      defaultValue: "0",
      required: true,
    },
    {
      key: "cash_card_or_check_payments",
      label: "Cash, Card, or Check Payments",
      description:
        "Enter revenue collected through cash, card, or check payments during the week.",
      type: "currency",
      defaultValue: "0",
      required: true,
    },
    {
      key: "insurance_payments",
      label: "Insurance Payments",
      description:
        "Enter total insurance payments received during the week.",
      type: "currency",
      defaultValue: "0",
      required: true,
    },
    {
      key: "revenue_collected",
      label: "Revenue Collected",
      description:
        "Enter total revenue collected from all sources this week.",
      type: "currency",
      defaultValue: "0",
      required: true,
    },
    {
      key: "payroll_for_the_week",
      label: "Payroll for the Week",
      description:
        "Enter total payroll paid to employees this week. Do not include contractor payments or owner pay here.",
      type: "currency",
      defaultValue: "0",
      required: true,
    },
    {
      key: "contractor_payments",
      label: "Contractor Payments",
      description:
        "Enter total payments made to contractors this week. Keep this separate from employee payroll.",
      type: "currency",
      defaultValue: "0",
      required: true,
    },
    {
      key: "owner_pay_for_the_week",
      label: "Owner Pay for the Week",
      description:
        "Enter the dollar amount the practice owner was paid this week. This is separate from payroll and contractor payments.",
      type: "currency",
      defaultValue: "0",
      required: true,
    },
    {
      key: "was_owner_pay_distributed",
      label: "Was Owner Pay Distributed?",
      description:
        "Set this to Yes if owner pay was distributed as scheduled this week.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "payroll_starting_balance",
      label: "Payroll Starting Balance",
      description:
        "Enter the payroll account balance at the beginning of the week.",
      type: "currency",
      defaultValue: "0",
      required: true,
    },
    {
      key: "what_blocked_money_this_week",
      label: "What Blocked Money This Week?",
      description:
        "Write anything that blocked, delayed, or stopped money from moving as expected this week.",
      type: "textarea",
    },
    {
      key: "what_staffing_gaps_were_there",
      label: "What Staffing Gaps Were There?",
      description:
        "Write any staffing gaps that affected operations, patient flow, billing, or finances this week.",
      type: "textarea",
    },
    {
      key: "one_thing_to_fix_next_week",
      label: "One Thing to Fix Next Week",
      description:
        "Write the single highest-priority improvement item for next week.",
      type: "text",
    },
    {
      key: "end_of_week_balance",
      label: "End of Week Balance",
      description:
        "Enter or review the end-of-week balance. Later we can automate this calculation from revenue, expenses, payroll, contractor payments, and owner pay.",
      type: "currency",
      defaultValue: "0",
    },
    {
      key: "total_labour_costs",
      label: "Total Labour Costs",
      description:
        "Enter or review total labour costs. This should be payroll plus contractor payments. It should not include owner pay.",
      type: "currency",
      defaultValue: "0",
    },
    {
      key: "payroll_as_percent_of_collected_revenue",
      label: "Payroll as % of Collected Revenue",
      description:
        "Enter or review payroll as a percent of collected revenue. Later we can automate this calculation.",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "notes",
      label: "Notes",
      description:
        "Use this for extra context, review comments, or follow-up notes about the weekly financial report.",
      type: "textarea",
    },
  ],
  defaultVisibleFields: [
    "week_start_date",
    "week_end_date",
    "submitted_by",
    "revenue_collected",
    "payroll_for_the_week",
    "contractor_payments",
    "owner_pay_for_the_week",
    "was_owner_pay_distributed",
    "is_this_completed",
  ],
};

export default function WeeklyFinancialReportsManagerPage() {
  return <MasterManager config={weeklyFinancialReportsManagerConfig} />;
}