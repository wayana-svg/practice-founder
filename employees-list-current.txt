"use client";

import MasterManager from "../../components/MasterManager";
import type { MasterManagerConfig } from "../../components/MasterManager";

const employeesManagerConfig: MasterManagerConfig = {
  title: "Employees Manager",
  eyebrow: "PRACTICE FOUNDER · BUSINESS HQ",
  description:
    "Manage the staff directory used across tasks, roles, daily logs, billing records, tracker submissions, and accountability tracking.",
  tableName: "employees",
  primaryKey: "id",
  backPath: "/?table=employees",
  addButtonLabel: "+ Add Employee",
  addPath: "/employees",
  defaultSortField: "name",
  fields: [
    {
      key: "name",
      label: "Employee Name",
      description:
        "The full name of the employee. Add the person here before assigning tasks, roles, huddles, tracker submissions, or other records to them.",
      type: "text",
      required: true,
    },
    {
      key: "email",
      label: "Work Email",
      description:
        "The employee's work email address. This should match the email they use for practice systems or app access.",
      type: "text",
      required: true,
    },
    {
      key: "phone",
      label: "Phone Number",
      description:
        "The employee's phone number. This is optional but useful for internal contact records.",
      type: "text",
    },
    {
      key: "role",
      label: "Employee Role",
      description:
        "The employee's role in the practice. This helps connect people to the work they own.",
      type: "select",
      options: [
        {
          value: "Physician",
          label: "Physician",
          description:
            "Provider or physician responsible for patient care, clinical decisions, charting, and clinical leadership.",
        },
        {
          value: "Receptionist",
          label: "Receptionist",
          description:
            "Front desk, reception, scheduling, patient communication, check-in, or patient access role.",
        },
        {
          value: "Biller",
          label: "Biller",
          description:
            "Billing, claims, collections, payment posting, AR, or revenue cycle role.",
        },
        {
          value: "Operations Manager",
          label: "Operations Manager",
          description:
            "Manager responsible for operations, accountability, daily flow, follow-up, and team execution.",
        },
        {
          value: "Clinical Support",
          label: "Clinical Support",
          description:
            "Medical assistant, nurse, rooming, referrals, vitals, prep, or clinical support role.",
        },
        {
          value: "Client Staff",
          label: "Client Staff",
          description:
            "General staff member working inside the client practice.",
        },
        {
          value: "PF Team",
          label: "PF Team",
          description:
            "Practice Founder team member supporting the client, system, implementation, or operations work.",
        },
      ],
      sortOrder: [
        "Physician",
        "Operations Manager",
        "Receptionist",
        "Clinical Support",
        "Biller",
        "Client Staff",
        "PF Team",
      ],
    },
    {
      key: "active",
      label: "Active Employee",
      description:
        "Yes means this employee is active and can be assigned work. No means this employee should not be used for new assignments.",
      type: "boolean",
      defaultValue: "true",
    },
  ],
  defaultVisibleFields: ["name", "email", "phone", "role", "active"],
};

export default function EmployeesListPage() {
  return <MasterManager config={employeesManagerConfig} />;
}