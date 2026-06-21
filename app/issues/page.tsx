"use client";

import MasterManager from "../../components/MasterManager";
import type { MasterManagerConfig } from "../../components/MasterManager";

const issuesManagerConfig: MasterManagerConfig = {
  title: "Issues & Breakdowns Manager",
  eyebrow: "PRACTICE FOUNDER · DAILY HUDDLE + ISSUES LOG",
  description:
    "Track every operational issue from Open through Closed. Use this to document what happened, who owns it, what caused it, and whether a task was created.",
  tableName: "issues_breakdowns",
  primaryKey: "id",
  backPath: "/",
  addButtonLabel: "+ Add Issue",
  defaultSortField: "status",
  fields: [
    {
      key: "issue_name",
      label: "Issue Name",
      description:
        "Enter a short clear title for the issue. Example: Claims not submitted yesterday, Front desk missed callbacks, Rooming delay, or Patient referral breakdown.",
      type: "text",
      required: true,
    },
    {
      key: "submitted_by",
      label: "Submitted By",
      description:
        "Choose the employee who reported or entered this issue. The person must already exist in the Employees Manager.",
      type: "employee",
      required: true,
    },
    {
      key: "function_area",
      label: "Function Area",
      description:
        "Choose the part of the practice affected by this issue. This helps show where breakdowns are happening most often.",
      type: "select",
      options: [
        {
          value: "Clinical Care",
          label: "Clinical Care",
          description:
            "Use this for patient care, charting, referrals, clinical flow, rooming, or provider-related issues.",
        },
        {
          value: "Revenue Cycle",
          label: "Revenue Cycle",
          description:
            "Use this for billing, claims, denials, collections, AR, charge lag, payment posting, or payer follow-up issues.",
        },
        {
          value: "Patient Access & Front Desk",
          label: "Patient Access & Front Desk",
          description:
            "Use this for scheduling, phones, check-in, check-out, patient communication, intake, or front desk issues.",
        },
        {
          value: "Operations",
          label: "Operations",
          description:
            "Use this for workflow, follow-up, handoffs, daily management, ownership, or execution issues.",
        },
        {
          value: "Human Resources & Staffing",
          label: "Human Resources & Staffing",
          description:
            "Use this for staffing gaps, coverage problems, role confusion, training issues, or employee accountability.",
        },
        {
          value: "Compliance",
          label: "Compliance",
          description:
            "Use this for policy, documentation, payer requirement, HIPAA, or compliance-related issues.",
        },
        {
          value: "Leadership & Strategic Growth",
          label: "Leadership & Strategic Growth",
          description:
            "Use this for owner-level decisions, management rhythm, strategic direction, or growth-related issues.",
        },
        {
          value: "Quality Improvement",
          label: "Quality Improvement",
          description:
            "Use this when the issue points to a process that needs to be improved, standardized, or made more reliable.",
        },
      ],
      sortOrder: [
        "Clinical Care",
        "Revenue Cycle",
        "Patient Access & Front Desk",
        "Operations",
        "Human Resources & Staffing",
        "Compliance",
        "Leadership & Strategic Growth",
        "Quality Improvement",
      ],
    },
    {
      key: "impact_level",
      label: "Impact Level",
      description:
        "Choose how serious the issue is. Impact should be based on business disruption, patient impact, financial risk, or urgency.",
      type: "select",
      defaultValue: "Medium",
      options: [
        {
          value: "Low",
          label: "Low",
          description:
            "The issue is small, contained, and does not significantly affect patients, money, staff, or daily flow.",
        },
        {
          value: "Medium",
          label: "Medium",
          description:
            "The issue affects workflow or follow-up but is not yet a major risk.",
        },
        {
          value: "High",
          label: "High",
          description:
            "The issue creates meaningful delay, confusion, revenue risk, patient experience problems, or repeated staff disruption.",
        },
        {
          value: "Critical",
          label: "Critical",
          description:
            "The issue requires urgent attention because it creates major patient, compliance, financial, staffing, or operational risk.",
        },
      ],
      sortOrder: ["Critical", "High", "Medium", "Low"],
    },
    {
      key: "status",
      label: "Status",
      description:
        "Choose the current stage of the issue. New issues should usually start as Open and move forward as the team investigates and resolves them.",
      type: "select",
      defaultValue: "Open",
      options: [
        {
          value: "Open",
          label: "Open",
          description:
            "The issue has been reported and still needs ownership, investigation, or action.",
        },
        {
          value: "Investigating",
          label: "Investigating",
          description:
            "Someone is looking into what happened, what caused it, and what needs to change.",
        },
        {
          value: "Resolved",
          label: "Resolved",
          description:
            "The immediate issue has been fixed, but the record may still need review before it is fully closed.",
        },
        {
          value: "Closed",
          label: "Closed",
          description:
            "The issue is fully handled, documented, and no further action is needed.",
        },
      ],
      sortOrder: ["Open", "Investigating", "Resolved", "Closed"],
    },
    {
      key: "priority",
      label: "Priority",
      description:
        "Choose how soon this issue needs attention. Priority helps the team decide what to address first.",
      type: "select",
      defaultValue: "Medium",
      options: [
        {
          value: "Low",
          label: "Low",
          description:
            "Handle when time allows. The issue matters but does not require immediate attention.",
        },
        {
          value: "Medium",
          label: "Medium",
          description:
            "Handle during normal follow-up. The issue should not sit too long.",
        },
        {
          value: "High",
          label: "High",
          description:
            "Handle soon. This issue is important and may affect patients, revenue, staff, or operations.",
        },
      ],
      sortOrder: ["High", "Medium", "Low"],
    },
    {
      key: "description",
      label: "Description",
      description:
        "Describe what happened in plain language. Include when it happened, who noticed it, what was affected, and why it matters.",
      type: "textarea",
      required: true,
    },
    {
      key: "root_cause",
      label: "Root Cause",
      description:
        "Write the underlying reason this issue happened after investigation. Example: unclear owner, missing SOP, system access issue, training gap, payer delay, or staffing gap.",
      type: "textarea",
    },
    {
      key: "linked_huddle_log",
      label: "Linked Huddle Log",
      description:
        "Enter the huddle date, huddle ID, or short reference to the huddle where this issue was discussed. Later we can upgrade this into a true huddle dropdown.",
      type: "text",
    },
    {
      key: "linked_task",
      label: "Linked Task",
      description:
        "Enter the task name or task ID created to resolve this issue. Later we can upgrade this into a true task dropdown.",
      type: "text",
    },
  ],
  defaultVisibleFields: [
    "issue_name",
    "submitted_by",
    "function_area",
    "impact_level",
    "status",
    "priority",
    "linked_task",
  ],
};

export default function IssuesPage() {
  return <MasterManager config={issuesManagerConfig} />;
}