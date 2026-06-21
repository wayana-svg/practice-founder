"use client";

import MasterManager from "../../components/MasterManager";
import type { MasterManagerConfig } from "../../components/MasterManager";

const dailyPhysicianTrackerConfig: MasterManagerConfig = {
  title: "Daily Physician Tracker Manager",
  eyebrow: "PRACTICE FOUNDER · DAILY TRACKER",
  description:
    "Manage daily physician clinical KPIs, chart closure, notes signed, target service mix, staffing gaps, delegation opportunities, and bottlenecks.",
  tableName: "daily_physician_tracker",
  primaryKey: "id",
  backPath: "/?table=daily_physician_tracker",
  addButtonLabel: "+ Add Daily Physician Tracker",
  addPath: "/daily-physician-tracker",
  defaultSortField: "tracker_date",
  fields: [
    {
      key: "tracker_date",
      label: "Tracker Date",
      type: "date",
      required: true,
      description:
        "The business date these physician tracker numbers belong to.",
    },
    {
      key: "submitted_by",
      label: "Submitted By",
      type: "employee",
      required: true,
      description:
        "The employee or physician submitting this Daily Physician Tracker.",
    },

    {
      key: "total_patient_encounters_today",
      label: "Total Patient Encounters Today",
      type: "number",
      defaultValue: "0",
      description:
        "Total number of patient encounters completed by the physician today.",
    },
    {
      key: "total_charts_completed_today",
      label: "Total Charts Completed Today",
      type: "number",
      defaultValue: "0",
      description:
        "Total number of charts fully completed by the physician today.",
    },
    {
      key: "charts_closed_same_day",
      label: "Charts Closed Same Day",
      type: "number",
      defaultValue: "0",
      description:
        "Charts from today that were closed on the same business day.",
    },
    {
      key: "charts_pending_from_prior_days",
      label: "Charts Pending From Prior Days",
      type: "number",
      defaultValue: "0",
      description:
        "Charts still pending from earlier dates before today.",
    },
    {
      key: "charts_now_less_than_7_days_old",
      label: "Charts Now Less Than 7 Days Old",
      type: "number",
      defaultValue: "0",
      description:
        "Open charts that are currently less than 7 days old.",
    },
    {
      key: "charts_now_greater_than_7_days_old",
      label: "Charts Now Greater Than 7 Days Old",
      type: "number",
      defaultValue: "0",
      description:
        "Open charts that are currently more than 7 days old and need attention.",
    },
    {
      key: "time_last_chart_closed",
      label: "Time Last Chart Closed",
      type: "text",
      description:
        "The time the final chart was closed for the day. Use time format such as 5:30 PM or 17:30.",
    },
    {
      key: "notes_signed_today",
      label: "Notes Signed Today",
      type: "boolean",
      defaultValue: "false",
      description:
        "Choose Yes if the physician signed the needed notes for the day.",
    },

    {
      key: "did_schedule_reflect_target_service_mix",
      label: "Schedule Reflected Target Service Mix",
      type: "boolean",
      defaultValue: "false",
      description:
        "Choose Yes if the schedule matched the target mix of services the practice wanted for the day.",
    },
    {
      key: "schedule_reflection_notes",
      label: "Schedule Reflection Notes",
      type: "textarea",
      description:
        "Explain anything about the schedule mix, including what worked, what was missing, or what should change.",
    },

    {
      key: "was_there_a_staffing_gap",
      label: "Staffing Gap Today",
      type: "boolean",
      defaultValue: "false",
      description:
        "Choose Yes if a staffing issue affected physician flow, charting, visits, or daily operations.",
    },
{
      key: "duration_of_staffing_gap",
      label: "Duration of Staffing Gap",
      type: "text",
      description:
        "How long the staffing gap lasted, such as 2 hours, half day, full day, or all week.",
    },

    {
      key: "tasks_that_could_be_delegated",
      label: "Tasks That Could Be Delegated",
      type: "textarea",
      description:
        "List tasks the physician handled that could be delegated to another role in the future.",
    },
    {
      key: "primary_bottleneck_today",
      label: "Primary Bottleneck Today",
      type: "textarea",
      description:
        "Describe the main issue that slowed the physician down today.",
    },
    {
      key: "role_impacted_id",
      label: "Role Impacted",
      type: "number",
      description:
        "The role affected by this physician tracker entry. This links to the Roles table so the linked role can be opened and reviewed.",
      linkedRecord: {
        tableName: "roles",
        primaryKey: "id",
        title: "Role",
        labelField: "role_name",
        description: "Open the connected role record.",
        fields: [
          { key: "id", label: "Role ID", type: "text" },
          { key: "role_name", label: "Role Name", type: "text" },
          { key: "role_status", label: "Role Status", type: "text" },
          { key: "must_log", label: "Must Log?", type: "text" },
          { key: "time_limit", label: "Time Limit", type: "text" },
          { key: "notes", label: "Notes", type: "text" },
        ],
      },
    },
    {
      key: "notes",
      label: "Notes",
      type: "textarea",
      description:
        "Add any extra physician, clinical, charting, staffing, or workflow notes from the day.",
    },
  ],
  defaultVisibleFields: [
    "tracker_date",
    "submitted_by",
    "total_patient_encounters_today",
    "total_charts_completed_today",
    "charts_closed_same_day",
    "charts_pending_from_prior_days",
    "charts_now_greater_than_7_days_old",
    "time_last_chart_closed",
    "notes_signed_today",
    "was_there_a_staffing_gap",
    "role_impacted_id",
  ],
};

export default function DailyPhysicianTrackerListPage() {
  return <MasterManager config={dailyPhysicianTrackerConfig} />;
}