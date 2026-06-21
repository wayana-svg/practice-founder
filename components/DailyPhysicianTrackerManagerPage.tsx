"use client";

import MasterManager from "./MasterManager";
import type { MasterManagerConfig } from "./MasterManager";

const dailyPhysicianTrackerManagerConfig: MasterManagerConfig = {
  title: "Daily Physician Tracker",
  eyebrow: "PRACTICE FOUNDER · DAILY OPERATIONS",
  description:
    "Track daily physician completion, chart closure, clinical messages, lab review, referral review, urgent items, and documentation issues.",
  tableName: "daily_physician_tracker",
  primaryKey: "id",
  backPath: "/",
  addButtonLabel: "+ Add Physician Tracker",
  defaultSortField: "tracker_date",
  fields: [
    {
      key: "submitted_by",
      label: "Submitted By",
      description:
        "Choose the employee who is entering this tracker record. This identifies who created the daily physician tracker entry.",
      type: "employee",
      required: true,
    },
    {
      key: "tracker_date",
      label: "Tracker Date",
      description:
        "Choose the date this physician tracker record belongs to. This should usually match the workday being reviewed.",
      type: "date",
      required: true,
    },
    {
      key: "physician",
      label: "Physician",
      description:
        "Choose the physician or provider this tracker record is about. The person must already exist in the Employees Manager.",
      type: "employee",
      required: true,
    },
    {
      key: "charts_closed_today",
      label: "Charts Closed Today",
      description:
        "Enter the number of charts the physician closed today. This helps track documentation completion and provider throughput.",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "charts_left_open",
      label: "Charts Left Open",
      description:
        "Enter the number of charts still open at the end of the day. This helps identify charting delays before they affect billing.",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "labs_reviewed",
      label: "Labs Reviewed?",
      description:
        "Set this to Yes when labs that needed physician review have been reviewed for the day.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "referrals_reviewed",
      label: "Referrals Reviewed?",
      description:
        "Set this to Yes when referrals that needed physician review or action have been reviewed.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "messages_reviewed",
      label: "Messages Reviewed?",
      description:
        "Set this to Yes when patient messages, clinical inbox items, and physician-level messages have been reviewed.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "urgent_items_addressed",
      label: "Urgent Items Addressed?",
      description:
        "Set this to Yes when urgent patient, clinical, documentation, or operational items assigned to the physician have been addressed.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "documentation_issue_found",
      label: "Documentation Issue Found?",
      description:
        "Set this to Yes if there was a charting, documentation, coding, missing note, or provider follow-up issue found today.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "documentation_issue_summary",
      label: "Documentation Issue Summary",
      description:
        "Describe the documentation issue. Include what happened, what is delayed, who owns the next step, and whether it affects billing.",
      type: "textarea",
    },
    {
      key: "notes",
      label: "Notes",
      description:
        "Write any additional notes about physician work, chart closure, messages, labs, referrals, urgent items, or daily follow-up.",
      type: "textarea",
    },
    {
      key: "physician_tracker_complete",
      label: "Physician Tracker Complete?",
      description:
        "Set this to Yes when the physician tracker record is complete for the day and no more updates need to be added.",
      type: "boolean",
      defaultValue: "false",
    },
  ],
  defaultVisibleFields: [
    "tracker_date",
    "physician",
    "submitted_by",
    "charts_closed_today",
    "charts_left_open",
    "labs_reviewed",
    "messages_reviewed",
    "physician_tracker_complete",
  ],
};

export default function DailyPhysicianTrackerManagerPage() {
  return <MasterManager config={dailyPhysicianTrackerManagerConfig} />;
}