"use client";

import MasterManager from "../../components/MasterManager";
import type { MasterManagerConfig } from "../../components/MasterManager";

const weeklyClaimsSummaryConfig: MasterManagerConfig = {
  title: "Weekly Claims Summary Manager",
  eyebrow: "PRACTICE FOUNDER · BILLING & CLAIMS",
  description:
    "Track weekly claims created, submitted, accepted, rejected, denied, resubmitted, charges, expected reimbursement, and billing notes.",
  tableName: "weekly_claims_summary",
  primaryKey: "id",
  backPath: "/?table=weekly_claims_summary",
  addButtonLabel: "+ Add Weekly Claims Summary",
  defaultSortField: "week_start_date",
  fields: [
    {
      key: "week_start_date",
      label: "Week Start Date",
      type: "date",
      required: true,
      description:
        "The first date included in this weekly claims reporting period.",
    },
    {
      key: "week_end_date",
      label: "Week End Date",
      type: "date",
      description:
        "The last date included in this weekly claims reporting period.",
    },
    {
      key: "submitted_by",
      label: "Submitted By",
      type: "employee",
      description:
        "The employee responsible for preparing, entering, or submitting this weekly claims summary.",
    },
    {
      key: "claims_created",
      label: "Claims Created",
      type: "number",
      defaultValue: "0",
      description:
        "The total number of claims created during the reporting week, whether or not they were submitted yet.",
    },
    {
      key: "claims_submitted",
      label: "Claims Submitted",
      type: "number",
      defaultValue: "0",
      description:
        "The total number of claims submitted to payers during the reporting week.",
    },
    {
      key: "claims_accepted",
      label: "Claims Accepted",
      type: "number",
      defaultValue: "0",
      description:
        "The number of submitted claims accepted by the clearinghouse or payer for processing.",
    },
    {
      key: "claims_rejected",
      label: "Claims Rejected",
      type: "number",
      defaultValue: "0",
      description:
        "The number of claims rejected before full payer processing because something was missing, invalid, or incorrect.",
    },
    {
      key: "claims_denied",
      label: "Claims Denied",
      type: "number",
      defaultValue: "0",
      description:
        "The number of claims denied by payers after review or processing.",
    },
    {
      key: "denials_resubmitted",
      label: "Denials Resubmitted",
      type: "number",
      defaultValue: "0",
      description:
        "The number of denied claims corrected and resubmitted during the reporting week.",
    },
    {
      key: "total_charges",
      label: "Total Charges",
      type: "currency",
      defaultValue: "0",
      description:
        "The total dollar amount charged for the claims included in this weekly summary.",
    },
    {
      key: "total_expected_reimbursement",
      label: "Expected Reimbursement",
      type: "currency",
      defaultValue: "0",
      description:
        "The total dollar amount expected to be reimbursed from the submitted claims.",
    },
    {
      key: "notes",
      label: "Notes",
      type: "textarea",
      description:
        "Use this for billing notes, payer issues, denial trends, rejection reasons, cleanup work, or follow-up needs.",
    },
  ],
  defaultVisibleFields: [
    "week_start_date",
    "week_end_date",
    "submitted_by",
    "claims_submitted",
    "claims_accepted",
    "claims_rejected",
    "claims_denied",
    "denials_resubmitted",
    "total_charges",
  ],
};

export default function WeeklyClaimsSummaryListPage() {
  return <MasterManager config={weeklyClaimsSummaryConfig} />;
}