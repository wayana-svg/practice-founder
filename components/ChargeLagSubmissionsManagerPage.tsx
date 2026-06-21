"use client";

import MasterManager from "./MasterManager";
import type { MasterManagerConfig } from "./MasterManager";

const chargeLagSubmissionsManagerConfig: MasterManagerConfig = {
  title: "Charge Lag Submissions",
  eyebrow: "PRACTICE FOUNDER · BILLING ACTIVITIES · INTERNAL",
  description:
    "Log each claim from a billing review batch. The app compares the date of service to the claim submission date to calculate charge lag.",
  tableName: "charge_lag_submissions",
  primaryKey: "id",
  backPath: "/charge-lag",
  addButtonLabel: "+ Add Charge Lag Record",
  defaultSortField: "batch_name",
  fields: [
    {
      key: "submitted_by",
      label: "Submitted By",
      description:
        "Choose the PF team member or data collector entering this charge lag record.",
      type: "employee",
      required: true,
    },
    {
      key: "batch_name",
      label: "Batch Name",
      description:
        "Enter the review batch name. Use the same batch name across Charge Lag, AR Report, and Weekly Claims Summary for the same review week. Example: Batch 4 or Week of May 5, 2026.",
      type: "text",
      required: true,
    },
    {
      key: "date_of_service",
      label: "Date of Service",
      description:
        "Choose the date the patient was seen by the doctor. This is the starting point for the charge lag calculation.",
      type: "date",
      required: true,
    },
    {
      key: "claim_submission_date",
      label: "Claim Submission Date",
      description:
        "Choose the date the claim was submitted to insurance. This is the ending point for the charge lag calculation.",
      type: "date",
      required: true,
    },
    {
      key: "lag_in_days",
      label: "Lag in Days",
      description:
        "This is calculated by Supabase from Claim Submission Date minus Date of Service. If the submission date is before the date of service, Supabase will block the save.",
      type: "number",
      defaultValue: "0",
      showInAddForm: false,
      showInEditForm: false,
    },
    {
      key: "notes",
      label: "Notes",
      description:
        "Use this for any extra notes about the claim, batch, billing software, unusual timing, or review context.",
      type: "textarea",
    },
  ],
  defaultVisibleFields: [
    "batch_name",
    "submitted_by",
    "date_of_service",
    "claim_submission_date",
    "lag_in_days",
    "notes",
  ],
};

export default function ChargeLagSubmissionsManagerPage() {
  return <MasterManager config={chargeLagSubmissionsManagerConfig} />;
}