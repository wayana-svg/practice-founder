"use client";

import MasterManager from "../../components/MasterManager";
import type { MasterManagerConfig } from "../../components/MasterManager";

const roleEmployeeAssignmentsConfig: MasterManagerConfig = {
  title: "Role Employee Assignments",
  eyebrow: "PRACTICE FOUNDER · BUSINESS HQ",
  description:
    "Connect employees to roles. One role can have multiple employees, and one employee can belong to multiple roles.",
  tableName: "role_employees",
  primaryKey: "id",
  backPath: "/?table=roles",
  addButtonLabel: "+ Add Role Assignment",
  defaultSortField: "created_at",
  fields: [
    {
      key: "role_id",
      label: "Role",
      type: "number",
      required: true,
      description:
        "Choose the role this employee is connected to. This links to the Roles table.",
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
      key: "employee_id",
      label: "Employee",
      type: "number",
      required: true,
      description:
        "Choose the employee assigned to this role. This links to the Employees table.",
      linkedRecord: {
        tableName: "employees",
        primaryKey: "id",
        title: "Employee",
        labelField: "name",
        description: "Open the connected employee record.",
        fields: [
          { key: "id", label: "Employee ID", type: "text" },
          { key: "name", label: "Employee Name", type: "text" },
          { key: "email", label: "Work Email", type: "text" },
          { key: "phone", label: "Phone Number", type: "text" },
          { key: "role", label: "Employee Role", type: "text" },
          { key: "active", label: "Active", type: "boolean" },
        ],
      },
    },
    {
      key: "relationship_type",
      label: "Relationship Type",
      type: "select",
      defaultValue: "Assigned",
      description:
        "Defines how this employee is connected to the role.",
      options: [
        {
          value: "Assigned",
          label: "Assigned",
          description:
            "This employee is assigned to this role as part of their regular work.",
        },
        {
          value: "Primary Owner",
          label: "Primary Owner",
          description:
            "This employee is the main owner of this role.",
        },
        {
          value: "Backup",
          label: "Backup",
          description:
            "This employee covers this role when the main owner is unavailable.",
        },
        {
          value: "Temporary Coverage",
          label: "Temporary Coverage",
          description:
            "This employee is temporarily covering this role.",
        },
        {
          value: "Training",
          label: "Training",
          description:
            "This employee is being trained for this role.",
        },
      ],
    },
    {
      key: "is_primary",
      label: "Primary?",
      type: "boolean",
      defaultValue: "false",
      description:
        "Choose Yes if this employee is the main person responsible for the role.",
    },
    {
      key: "notes",
      label: "Notes",
      type: "textarea",
      description:
        "Extra context about this employee-role assignment, coverage, training, or responsibility.",
    },
  ],
  defaultVisibleFields: [
    "role_id",
    "employee_id",
    "relationship_type",
    "is_primary",
    "notes",
  ],
};

export default function RoleEmployeeAssignmentsListPage() {
  return <MasterManager config={roleEmployeeAssignmentsConfig} />;
}