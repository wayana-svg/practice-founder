"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "../lib/supabase/client";

type ColumnConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "currency";
  description: string;
};

type TableConfig = {
  key: string;
  label: string;
  description: string;
  tableName: string;
  managerPath: string;
  addPath?: string;
  columns: ColumnConfig[];
  defaultColumns: string[];
};

type SectionConfig = {
  title: string;
  description: string;
  tables: TableConfig[];
};

type RowData = Record<string, string | number | boolean | null>;

type MetricCard = {
  label: string;
  value: string;
};

const sections: SectionConfig[] = [
  {
    title: "Trackers",
    description: "Daily and weekly practice activity.",
    tables: [
      {
        key: "daily_receptionist_tracker",
        label: "Daily Receptionist Tracker",
        description:
          "Receptionist activity, completed visits, collections, referrals, no-shows, and reschedules.",
        tableName: "daily_receptionist_tracker",
        managerPath: "/daily-receptionist-tracker-list",
        addPath: "/daily-receptionist-tracker",
        columns: [
          {
            key: "created_at",
            label: "Created At",
            type: "date",
            description: "The date and time this record was created in the system.",
          },
          {
            key: "tracker_date",
            label: "Tracker Date",
            type: "date",
            description: "The business day these receptionist tracker numbers belong to.",
          },
          {
            key: "submitted_by",
            label: "Submitted By",
            description: "The employee who submitted the tracker for the day.",
          },
          {
            key: "annual_wellness_visits",
            label: "Annual Wellness Visits",
            type: "number",
            description: "Completed Medicare annual wellness visits for the day.",
          },
          {
            key: "comprehensive_physical_exam",
            label: "Comprehensive Physical Exam",
            type: "number",
            description: "Completed comprehensive physical exam visits for the day.",
          },
          {
            key: "new_cpe",
            label: "New CPE",
            type: "number",
            description: "Completed comprehensive physical exams for new patients.",
          },
          {
            key: "well_woman_check",
            label: "Well Woman Check",
            type: "number",
            description: "Completed well woman check visits for the day.",
          },
          {
            key: "well_woman_exam",
            label: "Well Woman Exam",
            type: "number",
            description: "Completed well woman exam visits for the day.",
          },
          {
            key: "immigration_physical",
            label: "Immigration Physical",
            type: "number",
            description: "Completed immigration physical appointments for the day.",
          },
          {
            key: "new_patient_evaluation",
            label: "New Patient Evaluation",
            type: "number",
            description: "Completed new patient evaluation visits for the day.",
          },
          {
            key: "follow_up_visits",
            label: "Follow-Up Visits",
            type: "number",
            description: "Completed follow-up visits for existing patients.",
          },
          {
            key: "six_visits",
            label: "Sick Visits",
            type: "number",
            description: "Completed sick visit appointments for the day.",
          },
          {
            key: "nurse_visits",
            label: "Nurse Visits",
            type: "number",
            description: "Completed nurse visit appointments for the day.",
          },
          {
            key: "chronic_care_management",
            label: "Chronic Care Management",
            type: "number",
            description: "Completed chronic care management encounters for the day.",
          },
          {
            key: "telehealth_telemedicine",
            label: "Telehealth / Telemedicine",
            type: "number",
            description: "Completed telehealth or telemedicine visits for the day.",
          },
          {
            key: "wellness_evaluation",
            label: "Wellness Evaluation",
            type: "number",
            description: "Completed wellness evaluation visits for the day.",
          },
          {
            key: "wellness_follow_up",
            label: "Wellness Follow-Up",
            type: "number",
            description: "Completed wellness follow-up visits for the day.",
          },
          {
            key: "wellness_shots",
            label: "Wellness Shots",
            type: "number",
            description: "Completed wellness shot appointments for the day.",
          },
          {
            key: "iv_therapy",
            label: "IV Therapy",
            type: "number",
            description:
              "Completed intravenous therapy appointments for the day. This means fluids, vitamins, nutrients, or medication given directly into a vein through an IV line.",
          },
          {
            key: "pellet_insertion",
            label: "Pellet Insertion",
            type: "number",
            description: "Completed pellet insertion procedures for the day.",
          },
          {
            key: "joint_injection",
            label: "Joint Injection",
            type: "number",
            description: "Completed joint injection procedures for the day.",
          },
          {
            key: "home_mobile_visits",
            label: "Home / Mobile Visits",
            type: "number",
            description: "Completed home or mobile visits for the day.",
          },
          {
            key: "same_day_add_ons",
            label: "Same-Day Add-Ons",
            type: "number",
            description: "Patients added to the schedule and seen on the same day.",
          },
          {
            key: "no_shows",
            label: "No-Shows",
            type: "number",
            description: "Patients who were scheduled but did not arrive.",
          },
          {
            key: "reschedules",
            label: "Reschedules",
            type: "number",
            description: "Appointments moved from the original date to another date.",
          },
          {
            key: "non_billable_phone_calls",
            label: "Non-Billable Phone Calls",
            type: "number",
            description: "Patient calls handled by the team that were not billable visits.",
          },
          {
            key: "referrals",
            label: "Referrals",
            type: "number",
            description: "Formal referrals created or issued during the day.",
          },
          {
            key: "cash_collected",
            label: "Cash Collected",
            type: "currency",
            description: "Cash payments collected by the front desk or receptionist.",
          },
          {
            key: "credit_card_collected",
            label: "Credit Card Collected",
            type: "currency",
            description: "Credit card payments collected for the day.",
          },
          {
            key: "check_collected",
            label: "Check Collected",
            type: "currency",
            description: "Check payments collected for the day.",
          },
          {
            key: "total_collections",
            label: "Total Collections",
            type: "currency",
            description: "Total cash, credit card, and check collections for the day.",
          },
          {
            key: "notes",
            label: "Notes",
            description: "Extra context, issues, or unusual events from the day.",
          },
        ],
        defaultColumns: [
          "tracker_date",
          "submitted_by",
          "annual_wellness_visits",
          "new_patient_evaluation",
          "follow_up_visits",
          "same_day_add_ons",
          "no_shows",
          "referrals",
          "total_collections",
        ],
      },
      {
        key: "daily_physician_tracker",
        label: "Daily Physician Tracker",
        description:
          "Provider activity, encounters, chart closure, and clinical follow-up.",
        tableName: "daily_physician_tracker",
        managerPath: "/daily-physician-tracker-list",
        addPath: "/daily-physician-tracker",
        columns: [
          {
            key: "created_at",
            label: "Created At",
            type: "date",
            description: "The date and time this record was created.",
          },
          {
            key: "tracker_date",
            label: "Tracker Date",
            type: "date",
            description: "The business day these physician tracker numbers belong to.",
          },
          {
            key: "submitted_by",
            label: "Submitted By",
            description: "The employee or physician who submitted this tracker.",
          },
          {
            key: "total_patient_encounters_today",
            label: "Patient Encounters",
            type: "number",
            description: "Total patients seen by the provider that day.",
          },
          {
            key: "total_charts_completed_today",
            label: "Charts Completed",
            type: "number",
            description: "Total charts completed by the provider that day.",
          },
          {
            key: "charts_closed_same_day",
            label: "Charts Closed Same Day",
            type: "number",
            description: "Charts completed on the same day as the visit.",
          },
          {
            key: "charts_now_greater_than_7_days_old",
            label: "Charts > 7 Days Old",
            type: "number",
            description: "Open charts that are now more than seven days old.",
          },
          {
            key: "notes",
            label: "Notes",
            description: "Extra context, issues, or notes from the provider.",
          },
        ],
        defaultColumns: [
          "tracker_date",
          "submitted_by",
          "total_patient_encounters_today",
          "total_charts_completed_today",
          "charts_closed_same_day",
          "charts_now_greater_than_7_days_old",
          "notes",
        ],
      },
      {
        key: "membership_tracker",
        label: "Membership Tracker",
        description:
          "Membership count, activity, starts, cancellations, and notes.",
        tableName: "membership_tracker",
        managerPath: "/membership-tracker-list",
        addPath: "/membership-tracker",
        columns: [
          {
            key: "created_at",
            label: "Created At",
            type: "date",
            description: "The date and time this record was created.",
          },
          {
            key: "tracker_date",
            label: "Tracker Date",
            type: "date",
            description: "The business day this membership activity belongs to.",
          },
          {
            key: "submitted_by",
            label: "Submitted By",
            description: "The employee who submitted this tracker.",
          },
          {
            key: "new_memberships",
            label: "New Memberships",
            type: "number",
            description: "New memberships started during the tracking period.",
          },
          {
            key: "cancelled_memberships",
            label: "Cancelled Memberships",
            type: "number",
            description: "Memberships cancelled during the tracking period.",
          },
          {
            key: "notes",
            label: "Notes",
            description: "Extra membership context or follow-up notes.",
          },
        ],
        defaultColumns: [
          "tracker_date",
          "submitted_by",
          "new_memberships",
          "cancelled_memberships",
          "notes",
        ],
      },
      {
        key: "weekly_financial_reports",
        label: "Weekly Financial Reports",
        description:
          "Weekly revenue, collections, expenses, payroll, and operational notes.",
        tableName: "weekly_financial_reports",
        managerPath: "/weekly-financial-reports-list",
        addPath: "/weekly-financial-report",
        columns: [
          {
            key: "created_at",
            label: "Created At",
            type: "date",
            description: "The date and time this report was created.",
          },
          {
            key: "week_start",
            label: "Week Start",
            type: "date",
            description: "The first date in the reporting week.",
          },
          {
            key: "week_end",
            label: "Week End",
            type: "date",
            description: "The last date in the reporting week.",
          },
          {
            key: "submitted_by",
            label: "Submitted By",
            description: "The employee who submitted this report.",
          },
          {
            key: "revenue_collected",
            label: "Revenue Collected",
            type: "currency",
            description: "Total revenue collected for the week.",
          },
          {
            key: "notes",
            label: "Notes",
            description: "Extra context or notes about the weekly financial report.",
          },
        ],
        defaultColumns: [
          "week_start",
          "week_end",
          "submitted_by",
          "revenue_collected",
          "notes",
        ],
      },
    ],
  },
  {
    title: "Task Management",
    description: "Work ownership, due dates, and execution.",
    tables: [
      {
        key: "tasks",
        label: "Tasks",
        description:
          "Task ownership, status, due dates, priority, and function area.",
        tableName: "tasks",
        managerPath: "/tasks-list",
        addPath: "/tasks",
        columns: [
          {
            key: "created_at",
            label: "Created At",
            type: "date",
            description: "The date and time this task was created.",
          },
          {
            key: "task_title",
            label: "Task",
            description: "The name or short title of the task.",
          },
          {
            key: "status",
            label: "Status",
            description: "The current stage of the task.",
          },
          {
            key: "priority",
            label: "Priority",
            description: "The urgency and importance level of the task.",
          },
          {
            key: "assigned_to",
            label: "Assigned To",
            description: "The employee responsible for completing this task.",
          },
          {
            key: "due_date",
            label: "Due Date",
            type: "date",
            description: "The date the task should be completed by.",
          },
          {
            key: "function_area",
            label: "Function Area",
            description: "The business area this task belongs to.",
          },
        ],
        defaultColumns: [
          "task_title",
          "status",
          "priority",
          "assigned_to",
          "due_date",
          "function_area",
        ],
      },
      {
        key: "deliverables",
        label: "Deliverables",
        description: "Deliverables, owners, deadlines, notes, and status.",
        tableName: "deliverables",
        managerPath: "/deliverables-list",
        addPath: "/deliverables",
        columns: [
          {
            key: "created_at",
            label: "Created At",
            type: "date",
            description: "The date and time this deliverable was created.",
          },
          {
            key: "deliverable_name",
            label: "Deliverable",
            description: "The name of the deliverable.",
          },
          {
            key: "status",
            label: "Status",
            description: "The current stage of the deliverable.",
          },
          {
            key: "priority",
            label: "Priority",
            description: "The urgency and importance level of the deliverable.",
          },
          {
            key: "owner",
            label: "Owner",
            description: "The person responsible for this deliverable.",
          },
          {
            key: "due_date",
            label: "Due Date",
            type: "date",
            description: "The date this deliverable is due.",
          },
          {
            key: "notes",
            label: "Notes",
            description: "Extra details or follow-up notes for this deliverable.",
          },
        ],
        defaultColumns: [
          "deliverable_name",
          "status",
          "priority",
          "owner",
          "due_date",
          "notes",
        ],
      },
    ],
  },
  {
    title: "Business HQ",
    description: "Business structure, roles, staff, and settings.",
    tables: [

      {
        key: "schedule_calendar",
        label: "Schedule",
        description:
          "Open the Schedule dashboard to view and manage shared Google Calendar blocks.",
        tableName: "app_embeds",
        managerPath: "/schedule",
        addPath: "/calendar-settings",
        columns: [
          {
            key: "embed_name",
            label: "Calendar",
            type: "text",
            description: "The display name of the calendar block shown in the Schedule dashboard.",
          },
          {
            key: "embed_type",
            label: "Type",
            type: "text",
            description: "The type of embedded schedule item, such as a Google Calendar embed.",
          },
          {
            key: "is_active",
            label: "Active",
            type: "text",
            description: "Shows whether this calendar block is active and visible in the Schedule dashboard.",
          },
        ],
        defaultColumns: ["embed_name", "embed_type", "is_active"],
      },
      {
        key: "roles",
        label: "Roles",
        description:
          "Role ownership, accountability, responsibilities, and time limits.",
        tableName: "roles",
        managerPath: "/roles-list",
        addPath: "/roles",
        columns: [
          {
            key: "created_at",
            label: "Created At",
            type: "date",
            description: "The date and time this role record was created.",
          },
          {
            key: "role_name",
            label: "Role",
            description: "The name of the role.",
          },
          {
            key: "staff_member",
            label: "Staff Member",
            description: "The employee assigned to this role.",
          },
          {
            key: "role_status",
            label: "Status",
            description: "Whether this role is active, inactive, or needs review.",
          },
          {
            key: "must_log",
            label: "Must Log",
            description: "The required log or record for this role.",
          },
          {
            key: "time_limit",
            label: "Time Limit",
            description: "The expected time limit or timing rule for the role.",
          },
          {
            key: "notes",
            label: "Notes",
            description: "Extra notes about this role.",
          },
        ],
        defaultColumns: [
          "role_name",
          "staff_member",
          "role_status",
          "must_log",
          "time_limit",
          "notes",
        ],
      },
      {
        key: "employees",
        label: "Employees",
        description: "Staff directory and employee records.",
        tableName: "employees",
        managerPath: "/employees-list",
        addPath: "/employees",
        columns: [
          {
            key: "created_at",
            label: "Created At",
            type: "date",
            description: "The date and time this employee record was created.",
          },
          {
            key: "name",
            label: "Name",
            description: "The employee's name.",
          },
          {
            key: "email",
            label: "Email",
            description: "The employee's email address.",
          },
          {
            key: "role",
            label: "Role",
            description: "The employee's role or job title.",
          },
          {
            key: "active",
            label: "Active",
            description: "Whether this employee is active and available for new assignments.",
          },
        ],
        defaultColumns: ["name", "email", "role", "active"],
      },
    ],
  },
  {
    title: "Daily On-call and Issues Log",
    description: "Breakdowns, issues, on-call notes, and operations logs.",
    tables: [
      {
        key: "issues_breakdowns",
        label: "Issues / Breakdowns",
        description: "Issues, impact, priority, status, and resolution notes.",
        tableName: "issues_breakdowns",
        managerPath: "/issues-list",
        addPath: "/issues-breakdowns",
        columns: [
          {
            key: "created_at",
            label: "Created At",
            type: "date",
            description: "The date and time this issue was created.",
          },
          {
            key: "issue_name",
            label: "Issue",
            description: "The short name of the issue or breakdown.",
          },
          {
            key: "date_identified",
            label: "Date Identified",
            type: "date",
            description: "The date this issue was first identified.",
          },
          {
            key: "impact_level",
            label: "Impact",
            description: "How much the issue affects operations.",
          },
          {
            key: "status",
            label: "Status",
            description: "The current stage of the issue.",
          },
          {
            key: "priority",
            label: "Priority",
            description: "How urgently this issue needs attention.",
          },
          {
            key: "submitted_by",
            label: "Submitted By",
            description: "The employee who submitted the issue.",
          },
        ],
        defaultColumns: [
          "issue_name",
          "date_identified",
          "impact_level",
          "status",
          "priority",
          "submitted_by",
        ],
      },
      {
        key: "daily_operations_logs",
        label: "Daily Operations Logs",
        description:
          "Opening checklist, daily huddle, and end-of-day close records.",
        tableName: "daily_operations_logs",
        managerPath: "/daily-operations-logs-list",
        addPath: "/daily-operations-logs",
        columns: [
          {
            key: "created_at",
            label: "Created At",
            type: "date",
            description: "The date and time this operations log was created.",
          },
          {
            key: "log_date",
            label: "Log Date",
            type: "date",
            description: "The business day this operations log belongs to.",
          },
          {
            key: "submitted_by",
            label: "Submitted By",
            description: "The employee who submitted this operations log.",
          },
          {
            key: "huddle_open_issues_review",
            label: "Huddle Issues",
            description: "Issues discussed during the daily huddle.",
          },
          {
            key: "huddle_notes",
            label: "Huddle Notes",
            description: "Additional notes from the daily huddle.",
          },
        ],
        defaultColumns: [
          "log_date",
          "submitted_by",
          "huddle_open_issues_review",
          "huddle_notes",
        ],
      },
    ],
  },
  {
    title: "Billing",
    description: "Claims, AR, charge lag, and billing follow-up.",
    tables: [
      {
        key: "daily_billing_claims",
        label: "Daily Billing Claims",
        description:
          "Claims submitted, rejected, denied, resubmitted, and total charges.",
        tableName: "daily_billing_claims",
        managerPath: "/daily-billing-claims-list",
        addPath: "/daily-billing-claims",
        columns: [
          {
            key: "created_at",
            label: "Created At",
            type: "date",
            description: "The date and time this billing claim record was created.",
          },
          {
            key: "report_date",
            label: "Report Date",
            type: "date",
            description: "The date these billing numbers belong to.",
          },
          {
            key: "submitted_by",
            label: "Submitted By",
            description: "The employee who submitted the billing claim report.",
          },
          {
            key: "total_claims_submitted",
            label: "Claims Submitted",
            type: "number",
            description: "Total claims submitted for the report date.",
          },
          {
            key: "total_claims_rejected",
            label: "Claims Rejected",
            type: "number",
            description: "Total claims rejected for the report date.",
          },
          {
            key: "total_claims_denied",
            label: "Claims Denied",
            type: "number",
            description: "Total claims denied for the report date.",
          },
          {
            key: "total_charges",
            label: "Total Charges",
            type: "currency",
            description: "Total charges connected to submitted claims.",
          },
        ],
        defaultColumns: [
          "report_date",
          "submitted_by",
          "total_claims_submitted",
          "total_claims_rejected",
          "total_claims_denied",
          "total_charges",
        ],
      },
      {
        key: "charge_lag_submissions",
        label: "Charge Lag Submissions",
        description: "Date of service, claim submission date, and lag in days.",
        tableName: "charge_lag_submissions",
        managerPath: "/charge-lag-list",
        addPath: "/charge-lag-list?add=1",
        columns: [
          {
            key: "created_at",
            label: "Created At",
            type: "date",
            description: "The date and time this charge lag record was created.",
          },
          {
            key: "batch_name",
            label: "Batch",
            description: "The name or label for the charge lag batch.",
          },
          {
            key: "submitted_by",
            label: "Submitted By",
            description: "The employee who submitted this charge lag record.",
          },
          {
            key: "date_of_service",
            label: "Date of Service",
            type: "date",
            description: "The date the service was provided.",
          },
          {
            key: "claim_submission_date",
            label: "Claim Submission Date",
            type: "date",
            description: "The date the claim was submitted.",
          },
          {
            key: "lag_in_days",
            label: "Lag in Days",
            type: "number",
            description: "Number of days between service and claim submission.",
          },
          {
            key: "notes",
            label: "Notes",
            description: "Extra notes about charge lag issues or follow-up.",
          },
        ],
        defaultColumns: [
          "batch_name",
          "submitted_by",
          "date_of_service",
          "claim_submission_date",
          "lag_in_days",
        ],
      },
      {
        key: "ar_report_submissions",
        label: "AR Report Submissions",
        description: "AR report details, payer balances, and days in AR.",
        tableName: "ar_report_submissions",
        managerPath: "/ar-report-submissions-list",
        addPath: "/ar-report-submissions-list?add=1",
        columns: [
          {
            key: "created_at",
            label: "Created At",
            type: "date",
            description: "The date and time this AR report was created.",
          },
          {
            key: "week_start",
            label: "Week Start",
            type: "date",
            description: "The first date in the AR reporting week.",
          },
          {
            key: "week_end",
            label: "Week End",
            type: "date",
            description: "The last date in the AR reporting week.",
          },
          {
            key: "payer_name",
            label: "Payer",
            description: "The payer connected to the AR balance.",
          },
          {
            key: "ar_balance",
            label: "AR Balance",
            type: "currency",
            description: "The accounts receivable balance for the payer.",
          },
          {
            key: "days_in_ar",
            label: "Days in AR",
            type: "number",
            description: "The number of days the balance has been in AR.",
          },
        ],
        defaultColumns: [
          "week_start",
          "week_end",
          "payer_name",
          "ar_balance",
          "days_in_ar",
        ],
      },
      {
        key: "weekly_claims_summary",
        label: "Weekly Claims Summary",
        description:
          "Weekly claims submitted, rejected, denied, and resubmitted.",
        tableName: "weekly_claims_summary",
        managerPath: "/weekly-claims-summary-list",
        addPath: "/weekly-claims-summary-list?add=1",
        columns: [
          {
            key: "created_at",
            label: "Created At",
            type: "date",
            description: "The date and time this weekly claims summary was created.",
          },
          {
            key: "week_start_date",
            label: "Week Start",
            type: "date",
            description: "The first date in the claims summary week.",
          },
          {
            key: "week_end_date",
            label: "Week End",
            type: "date",
            description: "The last date in the claims summary week.",
          },
          {
            key: "submitted_by",
            label: "Submitted By",
            description: "The employee who submitted the weekly claims summary.",
          },
          {
            key: "claims_submitted",
            label: "Claims Submitted",
            type: "number",
            description: "Total claims submitted during the week.",
          },
          {
            key: "claims_rejected",
            label: "Claims Rejected",
            type: "number",
            description: "Total claims rejected during the week.",
          },
          {
            key: "claims_denied",
            label: "Claims Denied",
            type: "number",
            description: "Total claims denied during the week.",
          },
          {
            key: "denials_resubmitted",
            label: "Denials Resubmitted",
            type: "number",
            description: "Total denied claims resubmitted during the week.",
          },
        ],
        defaultColumns: [
          "week_start_date",
          "week_end_date",
          "submitted_by",
          "claims_submitted",
          "claims_rejected",
          "claims_denied",
          "denials_resubmitted",
        ],
      },
    ],
  },
];

const allTables = sections.flatMap((section) => section.tables);

const receptionistVisitFields = [
  "annual_wellness_visits",
  "comprehensive_physical_exam",
  "new_cpe",
  "well_woman_check",
  "well_woman_exam",
  "immigration_physical",
  "new_patient_evaluation",
  "follow_up_visits",
  "six_visits",
  "nurse_visits",
  "chronic_care_management",
  "telehealth_telemedicine",
  "wellness_evaluation",
  "wellness_follow_up",
  "wellness_shots",
  "iv_therapy",
  "pellet_insertion",
  "joint_injection",
  "home_mobile_visits",
  "same_day_add_ons",
];

function getSectionTitleForTable(tableKey: string) {
  const section = sections.find((item) =>
    item.tables.some((table) => table.key === tableKey)
  );

  return section?.title || "Home";
}

function getInitialTableKey() {
  if (typeof window === "undefined") return "daily_receptionist_tracker";

  const params = new URLSearchParams(window.location.search);
  const tableFromUrl = params.get("table");

  if (tableFromUrl && allTables.some((table) => table.key === tableFromUrl)) {
    return tableFromUrl;
  }

  return "daily_receptionist_tracker";
}

function toNumber(value: string | number | boolean | null | undefined) {
  const numberValue = Number(value || 0);

  if (Number.isNaN(numberValue)) return 0;

  return numberValue;
}

function sumField(rows: RowData[], fieldKey: string) {
  return rows.reduce((total, row) => total + toNumber(row[fieldKey]), 0);
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export default function HomePage() {
  const jumpInputRef = useRef<HTMLInputElement | null>(null);
  const jumpWrapperRef = useRef<HTMLDivElement | null>(null);
  const tableMenuRef = useRef<HTMLDivElement | null>(null);

  const [selectedTableKey, setSelectedTableKey] = useState(getInitialTableKey);
  const [rows, setRows] = useState<RowData[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Trackers: true,
    "Task Management": true,
    "Business HQ": true,
    "Daily On-call and Issues Log": true,
    Billing: true,
  });

  const [jumpText, setJumpText] = useState("");
  const [jumpOpen, setJumpOpen] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [activeMenu, setActiveMenu] = useState<
    "" | "filter" | "sort" | "viewFields"
  >("");

  const [fieldSearchText, setFieldSearchText] = useState("");
  const [draggedColumnKey, setDraggedColumnKey] = useState<string | null>(null);

  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");

  const [groupBy, setGroupBy] = useState("");
  const [sortBy, setSortBy] = useState("created_at");

  const selectedTable =
    allTables.find((table) => table.key === selectedTableKey) || allTables[0];

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    selectedTable.defaultColumns
  );

  const jumpResults = useMemo(() => {
    const search = jumpText.trim().toLowerCase();

    if (!search) {
      return allTables.slice(0, 8);
    }

    return allTables
      .filter((table) => {
        const sectionTitle = getSectionTitleForTable(table.key);

        return (
          table.label.toLowerCase().includes(search) ||
          table.description.toLowerCase().includes(search) ||
          table.tableName.toLowerCase().includes(search) ||
          sectionTitle.toLowerCase().includes(search)
        );
      })
      .slice(0, 10);
  }, [jumpText]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCtrlK =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

      if (!isCtrlK) return;

      event.preventDefault();
      setJumpOpen(true);
      jumpInputRef.current?.focus();
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (jumpWrapperRef.current?.contains(target)) return;
      if (tableMenuRef.current?.contains(target)) return;

      setJumpOpen(false);
      setJumpText("");
      setActiveMenu("");
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const sectionTitle = getSectionTitleForTable(selectedTableKey);

    setOpenSections((current) => ({
      ...current,
      [sectionTitle]: true,
    }));

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("table", selectedTableKey);
      window.history.replaceState(null, "", url.toString());
    }

    setVisibleColumns(selectedTable.defaultColumns);
    setSearchText("");
    setFieldSearchText("");
    setFilterField("");
    setFilterValue("");
    setGroupBy("");
    setSortBy("created_at");
    setActiveMenu("");
    loadRows(selectedTable);
  }, [selectedTableKey]);

  async function loadRows(table: TableConfig) {
    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from(table.tableName)
      .select("*")
      .limit(100);

    if (error) {
      setErrorMessage(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data as RowData[]) || []);
    setLoading(false);
  }

  const visibleColumnConfigs = useMemo(() => {
    return visibleColumns
      .map((columnKey) =>
        selectedTable.columns.find((column) => column.key === columnKey)
      )
      .filter(Boolean) as ColumnConfig[];
  }, [selectedTable, visibleColumns]);

  const availableColumnConfigs = useMemo(() => {
    return selectedTable.columns.filter(
      (column) => !visibleColumns.includes(column.key)
    );
  }, [selectedTable, visibleColumns]);

  const searchedAvailableColumnConfigs = useMemo(() => {
    const search = fieldSearchText.trim().toLowerCase();

    if (!search) return availableColumnConfigs;

    return availableColumnConfigs.filter(
      (column) =>
        column.label.toLowerCase().includes(search) ||
        column.key.toLowerCase().includes(search) ||
        (column.type || "text").toLowerCase().includes(search)
    );
  }, [availableColumnConfigs, fieldSearchText]);

  const filterOptions = useMemo(() => {
    if (!filterField) return [];

    const uniqueValues = new Set<string>();

    rows.forEach((row) => {
      const value = row[filterField];

      if (value !== null && value !== undefined && String(value).trim() !== "") {
        uniqueValues.add(String(value));
      }
    });

    return Array.from(uniqueValues).sort();
  }, [rows, filterField]);

  const filteredRows = useMemo(() => {
    let nextRows = [...rows];

    if (searchText.trim()) {
      const loweredSearch = searchText.toLowerCase();

      nextRows = nextRows.filter((row) =>
        Object.values(row).some((value) =>
          String(value || "").toLowerCase().includes(loweredSearch)
        )
      );
    }

    if (filterField && filterValue) {
      nextRows = nextRows.filter(
        (row) => String(row[filterField] || "") === filterValue
      );
    }

    if (sortBy) {
      nextRows.sort((a, b) => {
        const firstValue = String(a[sortBy] || "");
        const secondValue = String(b[sortBy] || "");

        return secondValue.localeCompare(firstValue);
      });
    }

    return nextRows;
  }, [rows, searchText, filterField, filterValue, sortBy]);

  const groupedRows = useMemo(() => {
    if (!groupBy) {
      return [{ groupName: "All Records", items: filteredRows }];
    }

    const groups: Record<string, RowData[]> = {};

    filteredRows.forEach((row) => {
      const rawValue = row[groupBy];

      const groupName =
        rawValue !== null &&
        rawValue !== undefined &&
        String(rawValue).trim() !== ""
          ? String(rawValue)
          : "Not Set";

      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      groups[groupName].push(row);
    });

    return Object.entries(groups).map(([groupName, items]) => ({
      groupName,
      items,
    }));
  }, [filteredRows, groupBy]);

  const metricCards = useMemo(() => {
    return getMetricCards(selectedTable.key, rows);
  }, [selectedTable.key, rows]);

  function getMetricCards(tableKey: string, tableRows: RowData[]): MetricCard[] {
    if (tableKey === "daily_receptionist_tracker") {
      const completedVisits = tableRows.reduce((total, row) => {
        return (
          total +
          receptionistVisitFields.reduce((fieldTotal, fieldKey) => {
            return fieldTotal + toNumber(row[fieldKey]);
          }, 0)
        );
      }, 0);

      const totalCollections = sumField(tableRows, "total_collections");
      const noShows = sumField(tableRows, "no_shows");
      const referrals = sumField(tableRows, "referrals");

      return [
        { label: "Records Loaded", value: String(tableRows.length) },
        { label: "Completed Visits", value: String(completedVisits) },
        { label: "Total Collections", value: formatCurrency(totalCollections) },
        { label: "Referrals", value: String(referrals) },
        { label: "No-Shows", value: String(noShows) },
      ];
    }

    if (tableKey === "daily_physician_tracker") {
      return [
        { label: "Records Loaded", value: String(tableRows.length) },
        {
          label: "Patient Encounters",
          value: String(sumField(tableRows, "total_patient_encounters_today")),
        },
        {
          label: "Charts Completed",
          value: String(sumField(tableRows, "total_charts_completed_today")),
        },
        {
          label: "Charts > 7 Days",
          value: String(sumField(tableRows, "charts_now_greater_than_7_days_old")),
        },
      ];
    }

    if (tableKey === "daily_billing_claims") {
      return [
        { label: "Records Loaded", value: String(tableRows.length) },
        {
          label: "Claims Submitted",
          value: String(sumField(tableRows, "total_claims_submitted")),
        },
        {
          label: "Claims Denied",
          value: String(sumField(tableRows, "total_claims_denied")),
        },
        {
          label: "Total Charges",
          value: formatCurrency(sumField(tableRows, "total_charges")),
        },
      ];
    }

    return [
      { label: "Records Loaded", value: String(tableRows.length) },
      { label: "Selected Table", value: selectedTable.label },
      { label: "Visible Fields", value: String(visibleColumns.length) },
      { label: "Rows Showing", value: String(filteredRows.length) },
    ];
  }

  function selectJumpTable(tableKey: string) {
    setSelectedTableKey(tableKey);
    setJumpText("");
    setJumpOpen(false);
  }

  function toggleSection(sectionTitle: string) {
    setOpenSections((current) => ({
      ...current,
      [sectionTitle]: !current[sectionTitle],
    }));
  }

  function openMenu(menu: "" | "filter" | "sort" | "viewFields") {
    setActiveMenu((current) => (current === menu ? "" : menu));
  }

  function addColumnToView(columnKey: string) {
    setVisibleColumns((current) => {
      if (current.includes(columnKey)) return current;

      return [...current, columnKey];
    });
  }

  function removeColumnFromView(columnKey: string) {
    setVisibleColumns((current) => {
      if (current.length === 1) return current;

      return current.filter((key) => key !== columnKey);
    });
  }

  function onSelectedColumnDrop(targetColumnKey: string) {
    if (!draggedColumnKey || draggedColumnKey === targetColumnKey) return;

    setVisibleColumns((current) => {
      const draggedIndex = current.indexOf(draggedColumnKey);
      const targetIndex = current.indexOf(targetColumnKey);

      if (draggedIndex === -1 || targetIndex === -1) return current;

      const next = [...current];
      const [removed] = next.splice(draggedIndex, 1);
      next.splice(targetIndex, 0, removed);

      return next;
    });

    setDraggedColumnKey(null);
  }

  function moveColumn(columnKey: string, direction: "left" | "right") {
    setVisibleColumns((current) => {
      const currentIndex = current.indexOf(columnKey);

      if (currentIndex === -1) return current;

      const newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= current.length) return current;

      const next = [...current];
      const [removed] = next.splice(currentIndex, 1);
      next.splice(newIndex, 0, removed);

      return next;
    });
  }

  function formatValue(
    value: string | number | boolean | null,
    column?: ColumnConfig
  ) {
    if (value === null || value === undefined || value === "") return "—";

    if (column?.type === "currency") {
      return `$${Number(value || 0).toFixed(2)}`;
    }

    if (column?.type === "date") {
      const text = String(value);
      return text.includes("T") ? text.split("T")[0] : text;
    }

    return String(value);
  }

  return (
    <main style={appShellStyle}>
      <aside style={sidebarStyle}>
        <div style={brandBoxStyle}>
          <div style={wordmarkBoxStyle}>
            <span style={practiceWordStyle}>PRACTICE</span>
            <span style={founderWordStyle}>FOUNDER</span>
          </div>
          <div style={brandSublineStyle}>Internal Operations Hub</div>
        </div>

        <div ref={jumpWrapperRef} style={jumpWrapperStyle}>
          <div style={jumpBoxStyle}>
            <span>⌕</span>

            <input
              ref={jumpInputRef}
              value={jumpText}
              onChange={(event) => {
                setJumpText(event.target.value);
                setJumpOpen(true);
              }}
              onFocus={() => setJumpOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setJumpOpen(false);
                  setJumpText("");
                }

                if (event.key === "Enter" && jumpResults[0]) {
                  selectJumpTable(jumpResults[0].key);
                }
              }}
              placeholder="Jump to..."
              style={jumpInputStyle}
            />

            <span style={keyBadgeStyle}>Ctrl K</span>
          </div>

          {jumpOpen && (
            <div style={jumpResultsStyle}>
              {jumpResults.length > 0 ? (
                jumpResults.map((table) => (
                  <button
                    key={table.key}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectJumpTable(table.key);
                    }}
                    style={{
                      ...jumpResultItemStyle,
                      ...(table.key === selectedTable.key
                        ? jumpResultItemActiveStyle
                        : {}),
                    }}
                  >
                    <span style={jumpResultLabelStyle}>{table.label}</span>
                    <span style={jumpResultSectionStyle}>
                      {getSectionTitleForTable(table.key)}
                    </span>
                  </button>
                ))
              ) : (
                <div style={jumpEmptyStyle}>No matching pages found.</div>
              )}
            </div>
          )}
        </div>

        <nav style={navStyle}>
          {sections.map((section) => {
            const isOpen = openSections[section.title];

            return (
              <div key={section.title} style={sectionBlockStyle}>
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  style={sectionToggleButtonStyle}
                >
                  <span style={sectionCaretStyle}>{isOpen ? "▾" : "▸"}</span>
                  <span>{section.title}</span>
                </button>

                {isOpen && (
                  <div style={sectionItemsStyle}>
                    {section.tables.map((table) => {
                      const isActive = table.key === selectedTable.key;

                      return (
                        <button
                          key={table.key}
                          type="button"
                          onClick={() => setSelectedTableKey(table.key)}
                          style={{
                            ...navItemStyle,
                            ...(isActive ? navItemActiveStyle : {}),
                          }}
                        >
                          <span style={navIconStyle}>▣</span>
                          <span style={navLabelStyle}>{table.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <section style={contentStyle}>
        <header style={topHeaderStyle}>
          <div>
            <div style={eyebrowStyle}>PRACTICE FOUNDER · OPERATIONS</div>
            <div style={breadcrumbStyle}>
              <span>Home</span>
              <span>›</span>
              <span>{selectedTable.label}</span>
            </div>

            <h1 style={pageTitleStyle}>{selectedTable.label}</h1>
            <p style={pageDescriptionStyle}>{selectedTable.description}</p>
          </div>

          <div style={topActionsStyle}>
            <a href={selectedTable.managerPath} style={secondaryActionStyle}>
              Open Manager
            </a>

            {selectedTable.addPath && (
              <a href={selectedTable.addPath} style={primaryActionStyle}>
                + Add Record
              </a>
            )}
          </div>
        </header>

        <section style={metricGridStyle}>
          {metricCards.map((card) => (
            <div key={card.label} style={summaryCardStyle}>
              <div style={summaryLabelStyle}>{card.label}</div>
              <div style={summaryValueStyle}>{card.value}</div>
            </div>
          ))}
        </section>

        <section style={tableCardStyle}>
          <div ref={tableMenuRef}>
            <div style={toolbarStyle}>
              <div style={toolbarLeftStyle}>
                <div style={searchBoxStyle}>
                  <span>⌕</span>
                  <input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Search this table..."
                    style={searchInputStyle}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => openMenu("filter")}
                  style={{
                    ...toolbarButtonStyle,
                    ...(activeMenu === "filter" ? activeToolbarButtonStyle : {}),
                  }}
                >
                  Filter
                </button>

                <button
                  type="button"
                  onClick={() => openMenu("sort")}
                  style={{
                    ...toolbarButtonStyle,
                    ...(activeMenu === "sort" ? activeToolbarButtonStyle : {}),
                  }}
                >
                  Sort
                </button>

                <select
                  value={groupBy}
                  onChange={(event) => setGroupBy(event.target.value)}
                  style={toolbarSelectStyle}
                >
                  <option value="">Group</option>
                  {selectedTable.columns.map((column) => (
                    <option key={column.key} value={column.key}>
                      Group by {column.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => openMenu("viewFields")}
                  style={{
                    ...toolbarButtonStyle,
                    ...(activeMenu === "viewFields"
                      ? activeToolbarButtonStyle
                      : {}),
                  }}
                >
                  View Fields
                </button>
              </div>

              <button
                type="button"
                onClick={() => loadRows(selectedTable)}
                style={refreshButtonStyle}
              >
                Refresh
              </button>
            </div>

            {activeMenu === "filter" && (
              <div style={floatingPanelStyle}>
                <div style={panelTitleStyle}>Filter Records</div>

                <div style={compactGridStyle}>
                  <label style={panelLabelStyle}>
                    Field
                    <select
                      value={filterField}
                      onChange={(event) => {
                        setFilterField(event.target.value);
                        setFilterValue("");
                      }}
                      style={panelInputStyle}
                    >
                      <option value="">Choose a field</option>
                      {selectedTable.columns.map((column) => (
                        <option key={column.key} value={column.key}>
                          {column.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={panelLabelStyle}>
                    Value
                    <select
                      value={filterValue}
                      onChange={(event) => setFilterValue(event.target.value)}
                      style={panelInputStyle}
                      disabled={!filterField}
                    >
                      <option value="">All values</option>
                      {filterOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setFilterField("");
                      setFilterValue("");
                    }}
                    style={clearButtonStyle}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {activeMenu === "sort" && (
              <div style={sortPanelStyle}>
                <div style={panelTitleStyle}>Sort Records</div>

                <div style={sortListStyle}>
                  {selectedTable.columns.map((column) => (
                    <button
                      key={column.key}
                      type="button"
                      title={column.description}
                      onClick={() => {
                        setSortBy(column.key);
                        setActiveMenu("");
                      }}
                      style={{
                        ...sortItemStyle,
                        ...(sortBy === column.key ? sortItemActiveStyle : {}),
                      }}
                    >
                      <span>
                        <strong>{column.label}</strong>
                        <small style={fieldMetaStyle}>
                          {column.type || "text"} · {column.description}
                        </small>
                      </span>
                      <span>{sortBy === column.key ? "✓" : ""}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeMenu === "viewFields" && (
              <div style={viewFieldsPanelStyle}>
                <div style={viewFieldsHeaderStyle}>
                  <div>
                    <div style={panelEyebrowStyle}>FIELDS TO DISPLAY</div>
                    <div style={viewFieldsTitleStyle}>Build This View</div>
                  </div>

                  <div style={viewFieldsButtonRowStyle}>
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleColumns(
                          selectedTable.columns.map((column) => column.key)
                        )
                      }
                      style={smallPanelButtonStyle}
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setVisibleColumns(selectedTable.defaultColumns)
                      }
                      style={smallPanelButtonStyle}
                    >
                      Default View
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setVisibleColumns([selectedTable.defaultColumns[0]])
                      }
                      style={smallPanelButtonStyle}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div style={viewTwoColumnStyle}>
                  <div style={viewColumnStyle}>
                    <div style={viewColumnHeaderStyle}>
                      <div>
                        <div style={panelEyebrowStyle}>AVAILABLE FIELDS</div>
                        <strong>Choose fields</strong>
                      </div>
                    </div>

                    <div style={fieldSearchBoxStyle}>
                      <span>⌕</span>
                      <input
                        value={fieldSearchText}
                        onChange={(event) =>
                          setFieldSearchText(event.target.value)
                        }
                        placeholder="Search fields"
                        style={searchInputStyle}
                      />
                    </div>

                    <div style={fieldListStyle}>
                      {searchedAvailableColumnConfigs.map((column) => (
                        <button
                          type="button"
                          key={column.key}
                          title={column.description}
                          onClick={() => addColumnToView(column.key)}
                          style={availableFieldItemStyle}
                        >
                          <span>
                            <strong>{column.label}</strong>
                            <small style={fieldMetaStyle}>
                              {column.type || "text"} · {column.description}
                            </small>
                          </span>

                          <span style={addFieldButtonStyle}>+</span>
                        </button>
                      ))}

                      {searchedAvailableColumnConfigs.length === 0 && (
                        <div style={emptyFieldBoxStyle}>
                          No hidden fields found.
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={viewColumnStyle}>
                    <div style={viewColumnHeaderStyle}>
                      <div>
                        <div style={panelEyebrowStyle}>SELECTED FIELDS</div>
                        <strong>{visibleColumns.length} fields selected</strong>
                      </div>
                    </div>

                    <div style={viewHelpStyle}>
                      Hover over a field to see what it means. Drag fields up or
                      down to change the table order.
                    </div>

                    <div style={fieldListStyle}>
                      {visibleColumnConfigs.map((column, index) => (
                        <div
                          key={column.key}
                          title={column.description}
                          draggable
                          onDragStart={() => setDraggedColumnKey(column.key)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => onSelectedColumnDrop(column.key)}
                          style={selectedFieldItemStyle}
                        >
                          <div style={dragHandleStyle}>⋮⋮</div>

                          <div style={{ flex: 1 }}>
                            <strong>{column.label}</strong>
                            <small style={fieldMetaStyle}>
                              {column.type || "text"} · {column.description}
                            </small>
                          </div>

                          <span style={fieldMoveButtonsStyle}>
                            <button
                              type="button"
                              onClick={() => moveColumn(column.key, "left")}
                              style={tinyButtonStyle}
                            >
                              ↑
                            </button>

                            <button
                              type="button"
                              onClick={() => moveColumn(column.key, "right")}
                              style={tinyButtonStyle}
                            >
                              ↓
                            </button>
                          </span>

                          <button
                            type="button"
                            onClick={() => removeColumnFromView(column.key)}
                            style={smallRemoveButtonStyle}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div style={errorBoxStyle}>
              <strong>Table error:</strong> {errorMessage}
            </div>
          )}

          {loading && <div style={loadingStyle}>Loading records...</div>}

          {!loading && !errorMessage && (
            <div style={tableWrapStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={selectHeaderStyle}></th>
                    {visibleColumnConfigs.map((column) => (
                      <th
                        key={column.key}
                        style={thStyle}
                        title={column.description}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {groupedRows.map((group) => (
                    <Fragment key={group.groupName}>
                      {groupBy && (
                        <tr>
                          <td
                            colSpan={visibleColumnConfigs.length + 1}
                            style={groupRowStyle}
                          >
                            {group.groupName} ({group.items.length})
                          </td>
                        </tr>
                      )}

                      {group.items.map((row, index) => (
                        <tr key={`${row.id || index}-${index}`} style={trStyle}>
                          <td style={selectCellStyle}>
                            <span style={rowAccentStyle}></span>
                          </td>

                          {visibleColumnConfigs.map((column) => (
                            <td
                              key={column.key}
                              style={tdStyle}
                              title={column.description}
                            >
                              {formatValue(row[column.key], column)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>

              {filteredRows.length === 0 && (
                <div style={emptyStateStyle}>No records match this view.</div>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

const colors = {
  navy: "#1C2333",
  navyLight: "#232D42",
  gold: "#C9A84C",
  goldLight: "#E2C47A",
  goldPale: "#F5EDD8",
  cream: "#F8F5EE",
  white: "#FFFFFF",
  slate: "#5F6673",
  border: "#DED8C8",
  orange: "#FF6B2C",
  orangeLight: "#FFE6DA",
};

const appShellStyle: CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "320px 1fr",
  background: colors.cream,
  color: colors.navy,
  fontFamily: "var(--font-dm-sans), Arial, sans-serif",
};

const sidebarStyle: CSSProperties = {
  background: colors.navy,
  color: colors.white,
  padding: "22px 16px",
  overflowY: "auto",
  borderRight: `1px solid ${colors.navyLight}`,
};

const brandBoxStyle: CSSProperties = {
  marginBottom: "22px",
};

const wordmarkBoxStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  alignItems: "baseline",
  letterSpacing: "0.16em",
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "14px",
};

const practiceWordStyle: CSSProperties = {
  color: "rgba(255,255,255,0.48)",
};

const founderWordStyle: CSSProperties = {
  color: colors.gold,
  fontWeight: 500,
};

const brandSublineStyle: CSSProperties = {
  marginTop: "8px",
  color: "rgba(255,255,255,0.62)",
  fontSize: "13px",
};

const jumpWrapperStyle: CSSProperties = {
  position: "relative",
  marginBottom: "24px",
};

const jumpBoxStyle: CSSProperties = {
  height: "46px",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "0 12px",
  color: "rgba(255,255,255,0.78)",
};

const jumpInputStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: "none",
  outline: "none",
  background: "transparent",
  color: colors.white,
  fontSize: "16px",
  fontWeight: 600,
};

const jumpResultsStyle: CSSProperties = {
  position: "absolute",
  top: "54px",
  left: 0,
  right: 0,
  zIndex: 50,
  background: colors.white,
  border: `1px solid ${colors.border}`,
  borderRadius: "12px",
  boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
  padding: "8px",
  display: "grid",
  gap: "4px",
};

const jumpResultItemStyle: CSSProperties = {
  border: "none",
  background: colors.white,
  color: colors.navy,
  borderRadius: "8px",
  padding: "10px",
  textAlign: "left",
  cursor: "pointer",
  display: "grid",
  gap: "2px",
};

const jumpResultItemActiveStyle: CSSProperties = {
  background: colors.goldPale,
};

const jumpResultLabelStyle: CSSProperties = {
  fontWeight: 800,
};

const jumpResultSectionStyle: CSSProperties = {
  color: colors.slate,
  fontSize: "12px",
};

const jumpEmptyStyle: CSSProperties = {
  padding: "12px",
  color: colors.slate,
};

const keyBadgeStyle: CSSProperties = {
  marginLeft: "auto",
  background: colors.goldPale,
  color: colors.navy,
  borderRadius: "8px",
  padding: "2px 6px",
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "11px",
  whiteSpace: "nowrap",
};

const navStyle: CSSProperties = {
  display: "grid",
  gap: "22px",
};

const sectionBlockStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
};

const sectionToggleButtonStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "11px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: colors.gold,
  background: "transparent",
  border: "none",
  padding: "0",
  cursor: "pointer",
  textAlign: "left",
};

const sectionCaretStyle: CSSProperties = {
  color: "rgba(255,255,255,0.45)",
  width: "12px",
};

const sectionItemsStyle: CSSProperties = {
  display: "grid",
  gap: "5px",
  marginTop: "4px",
};

const navItemStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "rgba(255,255,255,0.78)",
  borderRadius: "12px",
  padding: "11px 12px",
  textAlign: "left",
  display: "flex",
  gap: "10px",
  alignItems: "center",
  cursor: "pointer",
  fontWeight: 600,
};

const navItemActiveStyle: CSSProperties = {
  background: "rgba(201,168,76,0.16)",
  color: colors.white,
  boxShadow: `inset 3px 0 0 ${colors.gold}`,
};

const navIconStyle: CSSProperties = {
  color: colors.gold,
};

const navLabelStyle: CSSProperties = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const contentStyle: CSSProperties = {
  padding: "34px",
  overflowX: "hidden",
};

const topHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "24px",
};

const eyebrowStyle: CSSProperties = {
  fontFamily: "var(--font-dm-mono), monospace",
  color: colors.gold,
  fontSize: "11px",
  letterSpacing: "0.16em",
  marginBottom: "10px",
};

const breadcrumbStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  color: colors.slate,
  fontSize: "14px",
  marginBottom: "10px",
};

const pageTitleStyle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-playfair), serif",
  fontSize: "42px",
  fontWeight: 600,
  letterSpacing: "-0.03em",
};

const pageDescriptionStyle: CSSProperties = {
  margin: "8px 0 0",
  color: colors.slate,
  fontSize: "16px",
  maxWidth: "760px",
};

const topActionsStyle: CSSProperties = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
};

const primaryActionStyle: CSSProperties = {
  background: colors.gold,
  color: colors.navy,
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: 800,
};

const secondaryActionStyle: CSSProperties = {
  background: colors.white,
  color: colors.navy,
  border: `1px solid ${colors.border}`,
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: 800,
};

const metricGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "18px",
};

const summaryCardStyle: CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  borderRadius: "0",
  padding: "18px",
};

const summaryLabelStyle: CSSProperties = {
  color: colors.gold,
  fontSize: "10px",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  fontFamily: "var(--font-dm-mono), monospace",
};

const summaryValueStyle: CSSProperties = {
  marginTop: "8px",
  fontSize: "22px",
  fontWeight: 800,
};

const tableCardStyle: CSSProperties = {
  position: "relative",
  background: colors.white,
  border: `1px solid ${colors.border}`,
  boxShadow: "0 20px 50px rgba(28,35,51,0.08)",
  overflow: "visible",
};

const toolbarStyle: CSSProperties = {
  minHeight: "68px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  padding: "14px 16px",
  borderBottom: `1px solid ${colors.border}`,
  background: colors.white,
};

const toolbarLeftStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flexWrap: "wrap",
};

const searchBoxStyle: CSSProperties = {
  height: "40px",
  minWidth: "280px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: colors.cream,
  border: `1px solid ${colors.border}`,
  borderRadius: "10px",
  padding: "0 12px",
};

const searchInputStyle: CSSProperties = {
  border: "none",
  outline: "none",
  width: "100%",
  fontSize: "14px",
  background: "transparent",
  color: colors.navy,
};

const toolbarButtonStyle: CSSProperties = {
  height: "40px",
  border: `1px solid ${colors.border}`,
  background: colors.white,
  borderRadius: "10px",
  padding: "0 12px",
  fontWeight: 700,
  cursor: "pointer",
  color: colors.navy,
};

const activeToolbarButtonStyle: CSSProperties = {
  background: colors.orangeLight,
  border: `1px solid ${colors.orange}`,
  color: colors.navy,
};

const toolbarSelectStyle: CSSProperties = {
  height: "40px",
  border: `1px solid ${colors.border}`,
  background: colors.white,
  borderRadius: "10px",
  padding: "0 12px",
  fontWeight: 700,
  color: colors.navy,
};

const refreshButtonStyle: CSSProperties = {
  height: "40px",
  border: "none",
  background: colors.navy,
  color: colors.white,
  borderRadius: "10px",
  padding: "0 14px",
  fontWeight: 800,
  cursor: "pointer",
};

const floatingPanelStyle: CSSProperties = {
  position: "absolute",
  top: "76px",
  left: "18px",
  right: "18px",
  zIndex: 20,
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "16px",
  boxShadow: "0 18px 45px rgba(28,35,51,0.18)",
};

const sortPanelStyle: CSSProperties = {
  position: "absolute",
  top: "76px",
  left: "120px",
  width: "420px",
  zIndex: 21,
  background: colors.white,
  border: `1px solid ${colors.border}`,
  borderTop: `5px solid ${colors.orange}`,
  padding: "14px",
  boxShadow: "0 18px 45px rgba(28,35,51,0.18)",
};

const panelTitleStyle: CSSProperties = {
  fontWeight: 900,
  marginBottom: "12px",
};

const panelEyebrowStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "10px",
  letterSpacing: "0.16em",
};

const compactGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr auto",
  gap: "12px",
  alignItems: "end",
};

const panelLabelStyle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 800,
  color: colors.navy,
};

const panelInputStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "40px",
  marginTop: "6px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "0 10px",
  background: colors.white,
};

const clearButtonStyle: CSSProperties = {
  height: "40px",
  border: "none",
  background: colors.goldPale,
  borderRadius: "8px",
  padding: "0 14px",
  fontWeight: 800,
  cursor: "pointer",
  color: colors.navy,
};

const sortListStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
  maxHeight: "360px",
  overflowY: "auto",
};

const sortItemStyle: CSSProperties = {
  border: `1px solid ${colors.border}`,
  background: colors.cream,
  color: colors.navy,
  textAlign: "left",
  padding: "12px",
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  cursor: "pointer",
};

const sortItemActiveStyle: CSSProperties = {
  background: colors.orangeLight,
  border: `1px solid ${colors.orange}`,
};

const viewFieldsPanelStyle: CSSProperties = {
  position: "absolute",
  top: "76px",
  left: "18px",
  right: "18px",
  zIndex: 25,
  background: colors.white,
  border: `1px solid ${colors.border}`,
  borderTop: `5px solid ${colors.orange}`,
  padding: "16px",
  boxShadow: "0 18px 45px rgba(28,35,51,0.18)",
  maxHeight: "calc(100vh - 220px)",
  overflowY: "auto",
};

const viewFieldsHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "14px",
  position: "sticky",
  top: 0,
  background: colors.white,
  zIndex: 2,
  paddingBottom: "10px",
};

const viewFieldsTitleStyle: CSSProperties = {
  fontWeight: 900,
  fontSize: "18px",
  marginTop: "4px",
};

const viewFieldsButtonRowStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const smallPanelButtonStyle: CSSProperties = {
  padding: "8px 10px",
  background: colors.goldPale,
  color: colors.navy,
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 800,
};

const viewTwoColumnStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1.2fr",
  gap: "16px",
  minHeight: "430px",
};

const viewColumnStyle: CSSProperties = {
  background: colors.cream,
  border: `1px solid ${colors.border}`,
  padding: "14px",
  minHeight: "420px",
  maxHeight: "calc(100vh - 340px)",
  overflowY: "auto",
};

const viewColumnHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "12px",
  position: "sticky",
  top: 0,
  background: colors.cream,
  zIndex: 1,
  paddingBottom: "8px",
};

const fieldSearchBoxStyle: CSSProperties = {
  height: "42px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: colors.white,
  border: `1px solid ${colors.border}`,
  borderRadius: "10px",
  padding: "0 12px",
  marginBottom: "12px",
};

const viewHelpStyle: CSSProperties = {
  color: colors.slate,
  fontSize: "13px",
  marginBottom: "12px",
};

const fieldListStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
};

const availableFieldItemStyle: CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  textAlign: "left",
  color: colors.navy,
  cursor: "pointer",
};

const selectedFieldItemStyle: CSSProperties = {
  background: colors.goldPale,
  border: `1px solid ${colors.gold}`,
  padding: "12px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  cursor: "grab",
};

const dragHandleStyle: CSSProperties = {
  color: colors.gold,
  fontWeight: 900,
  letterSpacing: "-4px",
  paddingRight: "4px",
};

const fieldMetaStyle: CSSProperties = {
  display: "block",
  marginTop: "2px",
  color: colors.slate,
  fontWeight: 500,
};

const addFieldButtonStyle: CSSProperties = {
  width: "24px",
  height: "24px",
  borderRadius: "999px",
  background: colors.orangeLight,
  color: colors.orange,
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
};

const smallRemoveButtonStyle: CSSProperties = {
  background: colors.white,
  color: colors.navy,
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "8px 10px",
  cursor: "pointer",
  fontWeight: 800,
};

const fieldMoveButtonsStyle: CSSProperties = {
  display: "flex",
  gap: "4px",
};

const emptyFieldBoxStyle: CSSProperties = {
  padding: "18px",
  color: colors.slate,
  background: colors.white,
  border: `1px dashed ${colors.border}`,
};

const tinyButtonStyle: CSSProperties = {
  marginLeft: "4px",
  border: `1px solid ${colors.border}`,
  background: colors.white,
  borderRadius: "6px",
  cursor: "pointer",
  color: colors.navy,
};

const errorBoxStyle: CSSProperties = {
  margin: "16px",
  padding: "14px",
  background: "#fff1f2",
  border: "1px solid #fecdd3",
  color: "#9f1239",
};

const loadingStyle: CSSProperties = {
  padding: "30px",
  color: colors.slate,
};

const tableWrapStyle: CSSProperties = {
  overflowX: "auto",
};

const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
};

const selectHeaderStyle: CSSProperties = {
  width: "42px",
  padding: "14px",
  background: colors.cream,
  borderBottom: `1px solid ${colors.border}`,
  color: colors.gold,
};

const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  background: colors.cream,
  color: colors.navy,
  borderBottom: `1px solid ${colors.border}`,
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontFamily: "var(--font-dm-mono), monospace",
};

const trStyle: CSSProperties = {
  background: colors.white,
};

const selectCellStyle: CSSProperties = {
  width: "42px",
  padding: "16px",
  borderBottom: `1px solid ${colors.border}`,
  color: colors.gold,
};

const rowAccentStyle: CSSProperties = {
  display: "block",
  width: "6px",
  height: "28px",
  borderRadius: "999px",
  background: colors.gold,
  opacity: 0.75,
};

const tdStyle: CSSProperties = {
  padding: "16px",
  borderBottom: `1px solid ${colors.border}`,
  verticalAlign: "top",
  color: colors.navy,
};

const groupRowStyle: CSSProperties = {
  background: colors.goldPale,
  color: colors.navy,
  padding: "12px 16px",
  fontWeight: 900,
  borderBottom: `1px solid ${colors.border}`,
};

const emptyStateStyle: CSSProperties = {
  padding: "34px",
  textAlign: "center",
  color: colors.slate,
};