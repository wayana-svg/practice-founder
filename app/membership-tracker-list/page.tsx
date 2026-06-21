"use client";

import MasterManager from "../../components/MasterManager";
import type { MasterManagerConfig } from "../../components/MasterManager";

const membershipTrackerConfig: MasterManagerConfig = {
  title: "Membership Tracker Manager",
  eyebrow: "PRACTICE FOUNDER · DAILY TRACKER",
  description:
    "Manage membership growth, cancellations, pauses, reactivations, membership revenue, failed payments, outreach, follow-ups, and notes.",
  tableName: "membership_tracker",
  primaryKey: "id",
  backPath: "/?table=membership_tracker",
  addButtonLabel: "+ Add Membership Tracker",
  addPath: "/membership-tracker",
  defaultSortField: "tracker_date",
  fields: [
    {
      key: "tracker_date",
      label: "Tracker Date",
      type: "date",
      required: true,
      description:
        "The business date these membership tracker numbers belong to.",
    },
    {
      key: "submitted_by",
      label: "Submitted By",
      type: "employee",
      required: true,
      description:
        "The employee submitting this Membership Tracker record.",
    },

    {
      key: "active_members_start",
      label: "Active Members at Start",
      type: "number",
      defaultValue: "0",
      description:
        "The number of active membership patients at the beginning of the tracker period.",
    },
    {
      key: "new_memberships",
      label: "New Memberships",
      type: "number",
      defaultValue: "0",
      description:
        "The number of new memberships started during this tracker period.",
    },
    {
      key: "cancelled_memberships",
      label: "Cancelled Memberships",
      type: "number",
      defaultValue: "0",
      description:
        "The number of memberships cancelled during this tracker period.",
    },
    {
      key: "paused_memberships",
      label: "Paused Memberships",
      type: "number",
      defaultValue: "0",
      description:
        "The number of memberships temporarily paused during this tracker period.",
    },
    {
      key: "reactivated_memberships",
      label: "Reactivated Memberships",
      type: "number",
      defaultValue: "0",
      description:
        "The number of previously paused, cancelled, or inactive memberships restarted during this tracker period.",
    },
    {
      key: "active_members_end",
      label: "Active Members at End",
      type: "number",
      defaultValue: "0",
      description:
        "The number of active membership patients at the end of the tracker period.",
    },

    {
      key: "membership_revenue_collected",
      label: "Membership Revenue Collected",
      type: "currency",
      defaultValue: "0",
      description:
        "Total membership revenue collected during this tracker period.",
    },
    {
      key: "membership_payments_failed",
      label: "Membership Payments Failed",
      type: "number",
      defaultValue: "0",
      description:
        "The number of membership payment attempts that failed.",
    },
    {
      key: "failed_payment_amount",
      label: "Failed Payment Amount",
      type: "currency",
      defaultValue: "0",
      description:
        "The total dollar amount connected to failed membership payments.",
    },

    {
      key: "outreach_calls_made",
      label: "Outreach Calls Made",
      type: "number",
      defaultValue: "0",
      description:
        "The number of membership outreach calls made during this tracker period.",
    },
    {
      key: "membership_follow_ups_due",
      label: "Membership Follow-Ups Due",
      type: "number",
      defaultValue: "0",
      description:
        "The number of membership follow-ups that were due during this tracker period.",
    },
    {
      key: "membership_follow_ups_completed",
      label: "Membership Follow-Ups Completed",
      type: "number",
      defaultValue: "0",
      description:
        "The number of due membership follow-ups that were completed.",
    },

    {
      key: "cancellation_reason",
      label: "Cancellation Reason",
      type: "textarea",
      description:
        "Explain why members cancelled, if any cancellations happened during this tracker period.",
    },
    {
      key: "notes",
      label: "Notes",
      type: "textarea",
      description:
        "Add any extra membership, payment, outreach, retention, or follow-up notes.",
    },
  ],
  defaultVisibleFields: [
    "tracker_date",
    "submitted_by",
    "active_members_start",
    "new_memberships",
    "cancelled_memberships",
    "paused_memberships",
    "reactivated_memberships",
    "active_members_end",
    "membership_revenue_collected",
    "membership_payments_failed",
    "failed_payment_amount",
  ],
};

export default function MembershipTrackerListPage() {
  return <MasterManager config={membershipTrackerConfig} />;
}