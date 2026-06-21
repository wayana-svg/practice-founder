"use client";

import MasterManager from "./MasterManager";
import type { MasterManagerConfig } from "./MasterManager";

const dailyBillingClaimsManagerConfig: MasterManagerConfig = {
  title: "Daily Billing Claims",
  eyebrow: "PRACTICE FOUNDER · BILLING ACTIVITIES",
  description:
    "Track daily billing work, claim submission, payment posting, denials, AR follow-up, and billing issues that need action.",
  tableName: "daily_billing_claims",
  primaryKey: "id",
  backPath: "/?table=daily_billing_claims",
  addPath: "/daily-billing-claims",
  addButtonLabel: "+ Add Daily Billing Record",
  defaultSortField: "billing_date",
  fields: [
    {
      key: "submitted_by",
      label: "Submitted By",
      description:
        "Choose the employee who is entering this billing record. This shows who created the daily billing update.",
      type: "employee",
      required: true,
    },
    {
      key: "billing_date",
      label: "Billing Date",
      description:
        "Choose the date this billing work belongs to. This should usually match the workday being reviewed.",
      type: "date",
      required: true,
    },
    {
      key: "billing_completed_by",
      label: "Billing Completed By",
      description:
        "Choose the employee who completed the billing work for this day. This may be the biller, billing lead, or staff member responsible for revenue cycle follow-up.",
      type: "employee",
    },
    {
      key: "charge_entry_completed",
      label: "Charge Entry Completed?",
      description:
        "Set this to Yes when all charges that should be entered for the day have been entered. Set it to No if charge entry is still incomplete.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "claims_submitted",
      label: "Claims Submitted?",
      description:
        "Set this to Yes when all ready claims have been submitted. Set it to No if claims are still waiting or blocked.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "claims_not_submitted_count",
      label: "Claims Not Submitted Count",
      description:
        "Enter the number of claims that were not submitted. Use 0 if everything that should have been submitted was submitted.",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "payments_posted",
      label: "Payments Posted?",
      description:
        "Set this to Yes when payments have been posted for the day. This helps confirm money received is reflected in the system.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "denials_reviewed",
      label: "Denials Reviewed?",
      description:
        "Set this to Yes when denials have been checked and reviewed. Denials should not sit unworked without ownership.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "ar_follow_up_completed",
      label: "AR Follow-Up Completed?",
      description:
        "Set this to Yes when accounts receivable follow-up was completed for the day. This includes payer follow-up, unpaid claims review, and aging work.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "billing_issue_found",
      label: "Billing Issue Found?",
      description:
        "Set this to Yes if the billing work revealed an issue, delay, denial pattern, missing information, payer problem, or claim submission blocker.",
      type: "boolean",
      defaultValue: "false",
    },
    {
      key: "billing_issue_summary",
      label: "Billing Issue Summary",
      description:
        "Describe the billing issue found. Include what happened, what is blocked, who owns the next step, and what needs follow-up.",
      type: "textarea",
    },
    {
      key: "linked_issue",
      label: "Linked Issue",
      description:
        "Enter the related issue name or issue ID if this billing problem was also added to Issues & Breakdowns. Later this can become a true linked dropdown.",
      type: "text",
    },
    {
      key: "billing_notes",
      label: "Billing Notes",
      description:
        "Write any additional notes about claims, payments, denials, AR, missing information, payer follow-up, or billing work completed today.",
      type: "textarea",
    },
    {
      key: "daily_billing_complete",
      label: "Daily Billing Complete?",
      description:
        "Set this to Yes when the billing record is complete for the day and no more billing updates need to be added.",
      type: "boolean",
      defaultValue: "false",
    },
  ],
  defaultVisibleFields: [
    "billing_date",
    "submitted_by",
    "billing_completed_by",
    "charge_entry_completed",
    "claims_submitted",
    "claims_not_submitted_count",
    "denials_reviewed",
    "ar_follow_up_completed",
    "daily_billing_complete",
  ],
};

export default function DailyBillingClaimsManagerPage() {
  return <MasterManager config={dailyBillingClaimsManagerConfig} />;
}