"use client";

import MasterManager from "../../components/MasterManager";
import type { MasterManagerConfig } from "../../components/MasterManager";

const dailyHuddleManagerConfig: MasterManagerConfig = {
  title: "Daily Huddle Log",
  eyebrow: "PRACTICE FOUNDER · DAILY HUDDLE + ISSUES LOG",
  description:
    "Capture the daily huddle, attendance, issues, chart status, claims status, ownership, and the decisions made by the team.",
  tableName: "daily_huddle_logs",
  primaryKey: "id",
  backPath: "/",
  addButtonLabel: "+ Add Huddle Log",
  defaultSortField: "huddle_date",
  fields: [
    {
      key: "submitted_by",
      label: "Submitted By",
      description:
        "Choose the employee who is entering this huddle log. In the full app this can later be auto-filled from the logged-in user.",
      type: "employee",
      required: true,
    },
    {
      key: "huddle_date",
      label: "Date",
      description:
        "Choose the date this huddle happened. There should usually be one huddle log per workday.",
      type: "date",
      required: true,
    },
    {
      key: "huddle_end_time",
      label: "Huddle End Time",
      description:
        "Enter the time the huddle ended. Example: 8:45 AM. This is stored as text for now so you can enter it naturally.",
      type: "text",
      required: true,
    },
    {
      key: "who_was_present",
      label: "Who Was Present",
      description:
        "List everyone who attended the huddle. Include the doctor, manager, front desk, biller, clinical support, and anyone else present.",
      type: "textarea",
      required: true,
    },
    {
      key: "issues_assigned_today",
      label: "Issues Assigned Today",
      description:
        "Write each issue discussed today and the person assigned to resolve it. Every issue should have a clear owner before the huddle is complete.",
      type: "textarea",
      required: true,
    },
    {
      key: "new_issues_raised_today",
      label: "New Issues Raised Today",
      description:
        "List new problems, breakdowns, delays, staffing gaps, patient flow issues, billing issues, or operational concerns raised during the huddle.",
      type: "textarea",
    },
    {
      key: "open_issues_carried_over",
      label: "Open Issues Carried Over",
      description:
        "List open issues from previous days that are still not resolved. Later we can turn this into a direct link to the Issues & Breakdowns table.",
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
        "Enter the number of claims from yesterday that were not submitted. This helps the practice track billing and claims delays.",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "decision_tree_link",
      label: "Decision Tree Link",
      description:
        "Paste the link to the issue decision tree document for this practice. This should help the team decide what to resolve, log, or escalate.",
      type: "url",
    },
    {
      key: "huddle_complete",
      label: "Huddle Complete?",
      description:
        "Set this to Yes when the huddle record is finished and there is nothing else to add for the day.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "notes_and_summary",
      label: "Notes and Summary",
      description:
        "Write a short summary of what was discussed, what decisions were made, what changed, and what needs follow-up.",
      type: "textarea",
      required: true,
    },
  ],
  defaultVisibleFields: [
    "huddle_date",
    "submitted_by",
    "huddle_end_time",
    "all_issues_have_owners",
    "charts_not_closed_yesterday",
    "claims_not_submitted_yesterday",
    "huddle_complete",
  ],
};

export default function DailyHuddlePage() {
  return <MasterManager config={dailyHuddleManagerConfig} />;
}