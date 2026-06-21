"use client";

import MasterManager from "../../components/MasterManager";
import type { MasterManagerConfig } from "../../components/MasterManager";

const rolesManagerConfig: MasterManagerConfig = {
  title: "Roles Manager",
  eyebrow: "PRACTICE FOUNDER · BUSINESS HQ",
  description:
    "Define who owns each role, what they are responsible for, what they decide independently, and when they must escalate.",
  tableName: "roles",
  primaryKey: "id",
  backPath: "/?table=roles",
  addButtonLabel: "+ Add Role",
  addPath: "/roles",
  defaultSortField: "role_name",
  fields: [
    {
      key: "role_name",
      label: "Role Name",
      description:
        "Enter the name of the role in the practice. Use a clear operational role name such as Front Desk, Rooming + Referrals, Clinical Support, Billing, Operations Manager, or Physician.",
      type: "text",
      required: true,
    },
    {
      key: "staff_member",
      label: "Staff Member",
      description:
        "Choose the employee who currently owns this role. The employee must already exist in the Employees Manager before they can be assigned here.",
      type: "employee",
    },
    {
      key: "role_status",
      label: "Role Status",
      description:
        "Choose the current staffing condition for this role. This shows whether the role is owned, shared, covered temporarily, vacant, or outsourced.",
      type: "select",
      defaultValue: "Vacant — Not Yet Hired",
      options: [
        {
          value: "Properly Staffed",
          label: "Properly Staffed",
          description:
            "The role has a clear owner and is being handled by the right person.",
        },
        {
          value: "Owner Covering This Role",
          label: "Owner Covering This Role",
          description:
            "The physician or practice owner is still personally covering this role.",
        },
        {
          value: "Shared Across Team",
          label: "Shared Across Team",
          description:
            "More than one person is sharing the role and there is not one clean owner yet.",
        },
        {
          value: "Temporarily Covered",
          label: "Temporarily Covered",
          description:
            "Someone is covering the role for a short period but is not the permanent owner.",
        },
        {
          value: "Vacant — Not Yet Hired",
          label: "Vacant — Not Yet Hired",
          description:
            "The role exists, but no one has been hired or assigned to own it yet.",
        },
        {
          value: "Outsourced",
          label: "Outsourced",
          description:
            "The role is handled by an outside contractor, vendor, billing company, or external support team.",
        },
      ],
      sortOrder: [
        "Properly Staffed",
        "Shared Across Team",
        "Temporarily Covered",
        "Owner Covering This Role",
        "Outsourced",
        "Vacant — Not Yet Hired",
      ],
    },
    {
      key: "what_this_role_does",
      label: "What This Role Does",
      description:
        "Describe the day-to-day work this role owns. Write what the person actually does, manages, checks, updates, follows up on, or completes.",
      type: "textarea",
    },
    {
      key: "what_this_role_is_accountable_for",
      label: "What This Role Is Accountable For",
      description:
        "Describe the non-negotiable outcomes this role must deliver. This should be written as results, not just activities.",
      type: "textarea",
    },
    {
      key: "resolve_handles_independently",
      label: "Resolve — Handles Independently",
      description:
        "List the situations this role should handle without asking the doctor, owner, or manager first. These are routine issues the role is expected to resolve.",
      type: "textarea",
    },
    {
      key: "judgment_decides_and_logs",
      label: "Judgment — Decides and Logs",
      description:
        "List the situations where this role should use judgment, make a decision, and log what they decided. These are not automatic escalations.",
      type: "textarea",
    },
    {
      key: "escalate_brings_to_doctor",
      label: "Escalate — Brings to Doctor",
      description:
        "List the specific situations that must be escalated to the doctor or owner. These should be true exceptions, not routine questions.",
      type: "textarea",
    },
    {
      key: "check_steps_before_escalating",
      label: "Check Steps Before Escalating",
      description:
        "Write the numbered steps this role must complete before escalating. Example: 1. Check the payer portal. 2. Call the payer. 3. Log the result. 4. Escalate only if still unresolved.",
      type: "textarea",
    },
    {
      key: "time_limit",
      label: "Time Limit",
      description:
        "Enter how long this role should work through the check steps before escalating. Examples: Immediate, 5 minutes, same day, 24 hours, or end of week.",
      type: "text",
    },
    {
      key: "must_log",
      label: "Must Log?",
      description:
        "Choose when this role must document what happened. Logging creates accountability and prevents the same issue from being solved from scratch every time.",
      type: "select",
      defaultValue: "Judgment + Escalation",
      options: [
        {
          value: "Escalation Only",
          label: "Escalation Only",
          description:
            "The role only logs the situation when it is escalated.",
        },
        {
          value: "Judgment + Escalation",
          label: "Judgment + Escalation",
          description:
            "The role logs judgment calls and escalations, but not every routine action.",
        },
        {
          value: "Always",
          label: "Always",
          description:
            "The role logs every important action, decision, and issue handled.",
        },
      ],
      sortOrder: ["Always", "Judgment + Escalation", "Escalation Only"],
    },
    {
      key: "notes",
      label: "Notes",
      description:
        "Use this for extra internal notes about the role, future changes, staffing concerns, coverage issues, or setup details.",
      type: "textarea",
    },
  ],
  defaultVisibleFields: [
    "role_name",
    "staff_member",
    "role_status",
    "must_log",
    "time_limit",
  ],
};

export default function RolesListPage() {
  return <MasterManager config={rolesManagerConfig} />;
}