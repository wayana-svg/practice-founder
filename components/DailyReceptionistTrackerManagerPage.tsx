"use client";

import MasterManager from "./MasterManager";
import type { MasterManagerConfig } from "./MasterManager";

const dailyReceptionistTrackerManagerConfig: MasterManagerConfig = {
  title: "Daily Receptionist Tracker",
  eyebrow: "PRACTICE FOUNDER · DAILY OPERATIONS",
  description:
    "Track daily front desk completion, calls, missed calls, voicemail, scheduling requests, patient messages, and front desk issues.",
  tableName: "daily_receptionist_tracker",
  primaryKey: "id",
  backPath: "/",
  addButtonLabel: "+ Add Receptionist Tracker",
  defaultSortField: "tracker_date",
  fields: [
    {
      key: "submitted_by",
      label: "Submitted By",
      description:
        "Choose the employee who is entering this tracker record. This identifies who created the daily receptionist tracker entry.",
      type: "employee",
      required: true,
    },
    {
      key: "tracker_date",
      label: "Tracker Date",
      description:
        "Choose the date this receptionist tracker record belongs to. This should usually match the workday being reviewed.",
      type: "date",
      required: true,
    },
    {
      key: "receptionist",
      label: "Receptionist",
      description:
        "Choose the receptionist, front desk employee, or patient access staff member this tracker record is about.",
      type: "employee",
      required: true,
    },
    {
      key: "calls_answered",
      label: "Calls Answered",
      description:
        "Enter the number of calls answered during the day. This helps track front desk volume and phone coverage.",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "missed_calls",
      label: "Missed Calls",
      description:
        "Enter the number of missed calls for the day. This helps the practice identify call coverage issues before they become patient access problems.",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "voicemails_completed",
      label: "Voicemails Completed?",
      description:
        "Set this to Yes when all voicemails have been reviewed, handled, assigned, or documented.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "scheduling_requests_completed",
      label: "Scheduling Requests Completed?",
      description:
        "Set this to Yes when scheduling requests, appointment changes, and appointment-related follow-up have been completed.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "patient_messages_assigned",
      label: "Patient Messages Assigned?",
      description:
        "Set this to Yes when patient messages that need follow-up have been assigned to the correct staff member.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "front_desk_issue_found",
      label: "Front Desk Issue Found?",
      description:
        "Set this to Yes if a front desk issue was found, such as missed calls, scheduling delays, patient complaints, unclear ownership, or communication breakdowns.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "front_desk_issue_summary",
      label: "Front Desk Issue Summary",
      description:
        "Describe the front desk issue. Include what happened, what was affected, who owns the next step, and whether an issue record or task should be created.",
      type: "textarea",
    },
    {
      key: "notes",
      label: "Notes",
      description:
        "Write any additional notes about calls, voicemail, scheduling, patient messages, front desk coverage, or follow-up needed.",
      type: "textarea",
    },
    {
      key: "receptionist_tracker_complete",
      label: "Receptionist Tracker Complete?",
      description:
        "Set this to Yes when the receptionist tracker record is complete for the day and no more updates need to be added.",
      type: "boolean",
      defaultValue: "false",
    },
  ],
  defaultVisibleFields: [
    "tracker_date",
    "receptionist",
    "submitted_by",
    "calls_answered",
    "missed_calls",
    "voicemails_completed",
    "scheduling_requests_completed",
    "receptionist_tracker_complete",
  ],
};

export default function DailyReceptionistTrackerManagerPage() {
  return <MasterManager config={dailyReceptionistTrackerManagerConfig} />;
}