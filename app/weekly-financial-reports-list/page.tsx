"use client";

import MasterManager from "../../components/MasterManager";
import type { MasterManagerConfig } from "../../components/MasterManager";

const weeklyFinancialReportsConfig: MasterManagerConfig = {
  title: "Weekly Financial Reports Manager",
  eyebrow: "PRACTICE FOUNDER · WEEKLY FINANCE",
  description:
    "Manage weekly revenue, expenses paid, payroll, contractors, owner pay, payroll starting balance, blocked money, staffing gaps, and calculated financial health metrics.",
  tableName: "weekly_financial_reports",
  primaryKey: "id",
  backPath: "/?table=weekly_financial_reports",
  addButtonLabel: "+ Add Weekly Financial Report",
  addPath: "/weekly-financial-report",
  defaultSortField: "week_start",
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
      type: "employee",
      required: true,
      description:
        "The employee submitting this weekly financial report.",
    },
    {
      key: "week_start",
      label: "Week Start",
      type: "date",
      required: true,
      description:
        "The first date covered by this weekly financial report.",
    },
    {
      key: "week_end",
      label: "Week End",
      type: "date",
      required: true,
      description:
        "The last date covered by this weekly financial report.",
    },
    {
      key: "is_this_completed",
      label: "Report Completed",
      type: "boolean",
      defaultValue: "false",
      description:
        "Choose Yes when the report has been fully completed and reviewed.",
    },

    {
      key: "bills_expenses_paid",
      label: "Bills and Expenses Paid",
      type: "currency",
      defaultValue: "0",
      description:
        "Total bills, expenses, vendor payments, and operating costs paid during the week.",
    },
    {
      key: "other_deposits",
      label: "Other Deposits",
      type: "currency",
      defaultValue: "0",
      description:
        "Deposits received that are not part of regular patient, insurance, or membership revenue.",
    },
    {
      key: "cash_card_check_payments",
      label: "Cash, Card, or Check Payments",
      type: "currency",
      defaultValue: "0",
      description:
        "Patient payments collected by cash, credit card, debit card, or check.",
    },
    {
      key: "insurance_payments",
      label: "Insurance Payments",
      type: "currency",
      defaultValue: "0",
      description:
        "Insurance payments received during the week.",
    },
    {
      key: "revenue_collected",
      label: "Revenue Collected",
      type: "currency",
      defaultValue: "0",
      description:
        "Total revenue collected during the week. This is the main collected revenue number for the report.",
    },

    {
      key: "payroll_for_week",
      label: "Payroll for the Week",
      type: "currency",
      defaultValue: "0",
      description:
        "Total payroll paid or owed for employees for this week.",
    },
    {
      key: "contractor_payments",
      label: "Contractor Payments",
      type: "currency",
      defaultValue: "0",
      description:
        "Total amount paid to contractors during the week.",
    },
    {
      key: "owner_pay_for_week",
      label: "Owner Pay for the Week",
      type: "currency",
      defaultValue: "0",
      description:
        "Owner pay amount assigned or distributed for the week.",
    },
    {
      key: "was_owner_pay_distributed",
      label: "Owner Pay Distributed",
      type: "boolean",
      defaultValue: "false",
      description:
        "Choose Yes if owner pay was actually distributed during the week.",
    },
    {
      key: "payroll_starting_balance",
      label: "Payroll Starting Balance",
      type: "currency",
      defaultValue: "0",
      description:
        "Starting balance available for payroll before weekly payroll activity.",
    },

    {
      key: "what_blocked_money_this_week",
      label: "What Blocked Money This Week?",
      type: "textarea",
      description:
        "Explain what prevented money from being collected, deposited, posted, or available this week.",
    },
    {
      key: "what_staffing_gaps_were_there",
      label: "What Staffing Gaps Were There?",
      type: "textarea",
      description:
        "Describe any staffing gaps that affected revenue, collections, billing, payroll, or operations.",
    },
    {
      key: "one_thing_to_fix_next_week",
      label: "One Thing to Fix Next Week",
      type: "text",
      description:
        "The single most important financial or operational issue to fix next week.",
    },

    {
      key: "end_of_week_balance",
      label: "End of Week Balance",
      type: "currency",
      defaultValue: "0",
      description:
        "Ending balance at the close of the week.",
    },
    {
      key: "total_labour_costs",
      label: "Total Labor Costs",
      type: "currency",
      defaultValue: "0",
      description:
        "Total labor cost for the week, including payroll and contractor payments where applicable.",
    },
    {
      key: "payroll_as_percent_of_collected_revenue",
      label: "Payroll as % of Collected Revenue",
      type: "number",
      defaultValue: "0",
      description:
        "Payroll cost compared to collected revenue. Enter the percentage value, such as 35 for 35%.",
    },
    {
      key: "notes",
      label: "Notes",
      type: "textarea",
      description:
        "Add any extra financial notes, context, concerns, or follow-up items for this weekly report.",
    },
  ],
  defaultVisibleFields: [
    "week_start",
    "week_end",
    "is_this_completed",
    "submitted_by",
    "revenue_collected",
    "bills_expenses_paid",
    "payroll_for_week",
    "contractor_payments",
    "owner_pay_for_week",
    "was_owner_pay_distributed",
    "end_of_week_balance",
    "total_labour_costs",
    "payroll_as_percent_of_collected_revenue",
  ],
};

export default function WeeklyFinancialReportsListPage() {
  return <MasterManager config={weeklyFinancialReportsConfig} />;
}