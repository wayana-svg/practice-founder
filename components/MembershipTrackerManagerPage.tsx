"use client";

import MasterManager from "./MasterManager";
import type { MasterManagerConfig } from "./MasterManager";

const membershipTrackerManagerConfig: MasterManagerConfig = {
  title: "Membership Tracker",
  eyebrow: "PRACTICE FOUNDER · TRACKERS",
  description:
    "Track weekly membership outcomes: new members, returning members, cancellations, active member total, and membership revenue.",
  tableName: "membership_tracker",
  primaryKey: "id",

  // This is the important part.
  // The manager back arrow should return to the Membership homepage.
  backPath: "/membership",

  addButtonLabel: "+ Add Membership Record",
  defaultSortField: "week_start_date",
  fields: [
    {
      key: "submitted_by",
      label: "Submitted By",
      description:
        "Choose the employee who is entering this weekly membership tracker record. This identifies who submitted the membership update.",
      type: "employee",
      required: true,
    },
    {
      key: "week_start_date",
      label: "Week Start Date",
      description:
        "Choose the first day of the week this membership record covers.",
      type: "date",
      required: true,
    },
    {
      key: "week_end_date",
      label: "Week End Date",
      description:
        "Choose the last day of the week this membership record covers. This should be after the week start date.",
      type: "date",
      required: true,
    },
    {
      key: "new_members_this_week",
      label: "New Members This Week",
      description:
        "Enter the number of new members who joined during this week. Use 0 if no new members joined.",
      type: "number",
      defaultValue: "0",
      required: true,
    },
    {
      key: "returning_members",
      label: "Returning Members",
      description:
        "Enter the number of members who renewed, continued, or returned during this week. Use 0 if there were none.",
      type: "number",
      defaultValue: "0",
      required: true,
    },
    {
      key: "cancelled_members_this_week",
      label: "Cancelled Members This Week",
      description:
        "Enter the number of members who cancelled during this week. Use 0 if no members cancelled.",
      type: "number",
      defaultValue: "0",
      required: true,
    },
    {
      key: "active_members_total",
      label: "Active Members Total",
      description:
        "Enter the total number of active members as of the end of the week. This is the current membership count after new, returning, and cancelled members are considered.",
      type: "number",
      defaultValue: "0",
      required: true,
    },
    {
      key: "membership_revenue_this_week",
      label: "Membership Revenue This Week",
      description:
        "Enter the total membership revenue collected this week. Enter the number only, without a dollar sign.",
      type: "number",
      defaultValue: "0",
      required: true,
    },
    {
      key: "membership_notes",
      label: "Membership Notes",
      description:
        "Write any useful notes about membership activity this week, such as cancellations, renewals, revenue changes, outreach, or follow-up needed.",
      type: "textarea",
    },
    {
      key: "tracker_complete",
      label: "Tracker Complete?",
      description:
        "Set this to Yes when all membership numbers for the week have been entered and reviewed.",
      type: "boolean",
      defaultValue: "false",
    },
  ],
  defaultVisibleFields: [
    "week_start_date",
    "week_end_date",
    "submitted_by",
    "new_members_this_week",
    "returning_members",
    "cancelled_members_this_week",
    "active_members_total",
    "membership_revenue_this_week",
    "tracker_complete",
  ],
};

export default function MembershipTrackerManagerPage() {
  return <MasterManager config={membershipTrackerManagerConfig} />;
}