"use client";

import MasterManager from "./MasterManager";
import type { MasterManagerConfig } from "./MasterManager";

const dailyOperationsManagerConfig: MasterManagerConfig = {
  title: "Daily Operations Logs",
  eyebrow: "PRACTICE FOUNDER · DAILY OPERATIONS",
  description:
    "Complete opening, daily huddle, issue ownership, chart status, claims status, and end-of-day closeout in one decorated operating record.",
  tableName: "daily_operations_logs",
  primaryKey: "id",
  backPath: "/",
  addButtonLabel: "+ Add Daily Operations Log",
  defaultSortField: "opening_date",
  fields: [
    {
      key: "submitted_by",
      label: "Submitted By",
      description:
        "Choose the employee who is entering this daily operations log. This identifies who created the record for the day.",
      type: "employee",
      required: true,
    },
    {
      key: "opening_date",
      label: "Opening Date",
      description:
        "Choose the date for this daily operations log. This should usually match the workday being opened, huddled, and closed out.",
      type: "date",
      required: true,
    },
    {
      key: "opening_completed_by",
      label: "Opening Completed By",
      description:
        "Choose the employee who completed the opening checklist. This is the person responsible for confirming the practice was ready to start the day.",
      type: "employee",
    },
    {
      key: "opening_start_time",
      label: "Opening Start Time",
      description:
        "Enter the time the opening checklist started. Example: 7:45 AM. This is stored as text so you can enter it naturally.",
      type: "text",
    },
    {
      key: "opening_end_time",
      label: "Opening End Time",
      description:
        "Enter the time the opening checklist was finished. Example: 8:05 AM. This helps track whether the day was opened on time.",
      type: "text",
    },
    {
      key: "voicemail_checked",
      label: "Voicemail Checked?",
      description:
        "Set this to Yes when voicemail has been checked for the day. Set it to No if it still needs review.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "voicemail_checked_notes",
      label: "Voicemail Checked Notes",
      description:
        "Write any notes from voicemail review, including missed calls, urgent messages, patient follow-up, or items that need assignment.",
      type: "textarea",
    },
    {
      key: "inbox_checked",
      label: "Inbox Checked?",
      description:
        "Set this to Yes when the practice inbox or main communication inbox has been checked.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "inbox_checked_notes",
      label: "Inbox Checked Notes",
      description:
        "Write notes from the inbox review, including patient requests, follow-up items, forms, referrals, or messages requiring action.",
      type: "textarea",
    },
    {
      key: "faxes_checked",
      label: "Faxes Checked?",
      description:
        "Set this to Yes when faxes have been checked. This helps prevent referral, lab, record, and payer documents from being missed.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "faxes_checked_notes",
      label: "Faxes Checked Notes",
      description:
        "Write notes from fax review, including what arrived, what was assigned, and anything that needs follow-up.",
      type: "textarea",
    },
    {
      key: "portal_messages_checked",
      label: "Portal Messages Checked?",
      description:
        "Set this to Yes when patient portal messages have been checked and assigned for follow-up.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "portal_messages_checked_notes",
      label: "Portal Messages Checked Notes",
      description:
        "Write notes from portal message review, including patient requests, clinical messages, refill requests, or items needing escalation.",
      type: "textarea",
    },
    {
      key: "huddle_date",
      label: "Huddle Date",
      description:
        "Choose the date the team huddle happened. This usually matches the opening date, but it is separate so the huddle can be tracked clearly.",
      type: "date",
    },
    {
      key: "huddle_lead",
      label: "Huddle Lead",
      description:
        "Choose the employee who led the daily huddle. This is the person responsible for making sure issues have owners and follow-up is clear.",
      type: "employee",
    },
    {
      key: "huddle_end_time",
      label: "Huddle End Time",
      description:
        "Enter the time the huddle ended. Example: 8:45 AM. This helps show whether the huddle stayed focused and timely.",
      type: "text",
    },
    {
      key: "who_was_present",
      label: "Who Was Present",
      description:
        "List everyone who attended the huddle, including the doctor, manager, front desk, biller, clinical support, and anyone else present.",
      type: "textarea",
    },
    {
      key: "issues_assigned_today",
      label: "Issues Assigned Today",
      description:
        "Write each issue discussed today and the person assigned to resolve it. Every issue should have a clear owner before the huddle is complete.",
      type: "textarea",
    },
    {
      key: "new_issues_raised_today",
      label: "New Issues Raised Today",
      description:
        "List new problems, delays, staffing gaps, patient flow issues, billing issues, or operational concerns raised during the huddle.",
      type: "textarea",
    },
    {
      key: "open_issues_carried_over",
      label: "Open Issues Carried Over",
      description:
        "List open issues from previous days that are still unresolved. This keeps carryover work visible instead of letting it disappear.",
      type: "textarea",
    },
    {
      key: "all_issues_have_owners",
      label: "All Issues Have Owners?",
      description:
        "Set this to Yes only when every issue discussed in the huddle has a named person responsible for the next step.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "charts_not_closed_yesterday",
      label: "Charts Not Closed Yesterday",
      description:
        "Enter the number of charts from yesterday that were not closed. This helps the practice track documentation delays.",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "claims_not_submitted_yesterday",
      label: "Claims Not Submitted Yesterday",
      description:
        "Enter the number of claims from yesterday that were not submitted. This helps the practice track billing and cash-flow delays.",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "decision_tree_link",
      label: "Decision Tree Link",
      description:
        "Paste a link to the decision tree, escalation guide, or issue handling document the team should use for the day.",
      type: "url",
    },
    {
      key: "close_date",
      label: "Close Date",
      description:
        "Choose the date the day was closed out. This should usually match the opening date unless the record is being completed later.",
      type: "date",
    },
    {
      key: "close_completed_by",
      label: "Close Completed By",
      description:
        "Choose the employee who completed the end-of-day closeout. This person confirms final checks were completed.",
      type: "employee",
    },
    {
      key: "final_verified_by",
      label: "Final Verified By",
      description:
        "Choose the employee or manager who gave the final verification for the daily operations log.",
      type: "employee",
    },
    {
      key: "closing_notes_and_summary",
      label: "Closing Notes and Summary",
      description:
        "Write the final summary for the day, including what was completed, what is still open, what needs follow-up, and what should be carried into tomorrow.",
      type: "textarea",
    },
    {
      key: "daily_log_complete",
      label: "Daily Log Complete?",
      description:
        "Set this to Yes when opening, huddle, issue review, and closeout are complete for the day.",
      type: "boolean",
      defaultValue: "false",
    },
  ],
  defaultVisibleFields: [
    "opening_date",
    "submitted_by",
    "opening_completed_by",
    "huddle_date",
    "huddle_lead",
    "all_issues_have_owners",
    "close_date",
    "final_verified_by",
    "daily_log_complete",
  ],
};

export default function DailyOperationsManagerPage() {
  return <MasterManager config={dailyOperationsManagerConfig} />;
}