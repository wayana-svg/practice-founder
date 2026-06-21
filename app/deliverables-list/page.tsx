"use client";

import MasterManager from "../../components/MasterManager";
import type { MasterManagerConfig } from "../../components/MasterManager";

const deliverablesConfig: MasterManagerConfig = {
  title: "Deliverables Manager",
  eyebrow: "PRACTICE FOUNDER · DELIVERABLES",
  description:
    "Track the outputs, documents, reports, files, projects, and completed items owed to the business or practice.",
  tableName: "deliverables",
  primaryKey: "id",
  backPath: "/?table=deliverables",
  addButtonLabel: "+ Add Deliverable",
  addPath: "/deliverables",
  defaultSortField: "due_date",
  fields: [
    {
      key: "deliverable_name",
      label: "Deliverable Name",
      type: "text",
      required: true,
      description:
        "The name of the deliverable. This should clearly describe the item that needs to be produced, sent, finished, or reviewed.",
    },
    {
      key: "deliverable_type",
      label: "Deliverable Type",
      type: "select",
      description:
        "The category of deliverable. Use this to separate reports, documents, projects, files, SOPs, dashboards, and other outputs.",
      options: [
        {
          value: "Report",
          label: "Report",
          description:
            "A recurring or one-time report that summarizes information, numbers, performance, or progress.",
        },
        {
          value: "Document",
          label: "Document",
          description:
            "A written document, form, guide, proposal, or internal reference file.",
        },
        {
          value: "SOP / Process",
          label: "SOP / Process",
          description:
            "A standard operating procedure, checklist, workflow, or process instruction.",
        },
        {
          value: "Dashboard",
          label: "Dashboard",
          description:
            "A visual or data-based dashboard used to track performance, metrics, or operations.",
        },
        {
          value: "File / Asset",
          label: "File / Asset",
          description:
            "A file, graphic, spreadsheet, presentation, template, or other asset that needs to be created or delivered.",
        },
        {
          value: "Project Output",
          label: "Project Output",
          description:
            "A finished item that comes from a larger project or initiative.",
        },
        {
          value: "Client / Practice Deliverable",
          label: "Client / Practice Deliverable",
          description:
            "Something owed to a client, practice, provider, owner, or stakeholder.",
        },
        {
          value: "Other",
          label: "Other",
          description:
            "Use this when the deliverable does not fit the other categories.",
        },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      defaultValue: "Not Started",
      description:
        "Shows where the deliverable is in the completion process.",
      options: [
        {
          value: "Not Started",
          label: "Not Started",
          description:
            "The deliverable has been identified but work has not started yet.",
        },
        {
          value: "In Progress",
          label: "In Progress",
          description:
            "Work has started and the deliverable is being prepared.",
        },
        {
          value: "Waiting on Info",
          label: "Waiting on Info",
          description:
            "The deliverable is paused because information, files, decisions, or approvals are still needed.",
        },
        {
          value: "Ready for Review",
          label: "Ready for Review",
          description:
            "The deliverable is complete enough for someone to review it.",
        },
        {
          value: "Revision Required",
          label: "Revision Required",
          description:
            "The deliverable was reviewed, but changes are needed before it can be completed.",
        },
        {
          value: "Completed",
          label: "Completed",
          description:
            "The deliverable is finished and no further action is needed.",
        },
        {
          value: "Canceled",
          label: "Canceled",
          description:
            "The deliverable is no longer needed.",
        },
      ],
      sortOrder: [
        "Not Started",
        "In Progress",
        "Waiting on Info",
        "Ready for Review",
        "Revision Required",
        "Completed",
        "Canceled",
      ],
    },
    {
      key: "priority",
      label: "Priority",
      type: "select",
      defaultValue: "Important",
      description:
        "Shows how important or time-sensitive the deliverable is.",
      options: [
        {
          value: "Urgent and Important",
          label: "Urgent and Important",
          description:
            "This needs immediate attention and has high business or practice impact.",
        },
        {
          value: "Important",
          label: "Important",
          description:
            "This matters and should be completed, but it may not require immediate action.",
        },
        {
          value: "Not Urgent",
          label: "Not Urgent",
          description:
            "This should be done, but it is not time-sensitive.",
        },
        {
          value: "Low Priority",
          label: "Low Priority",
          description:
            "This can wait until higher-priority deliverables are handled.",
        },
      ],
      sortOrder: [
        "Urgent and Important",
        "Important",
        "Not Urgent",
        "Low Priority",
      ],
    },
    {
      key: "linked_task",
      label: "Linked Task",
      type: "number",
      description:
        "The task connected to this deliverable. Enter the task record ID. Once linked, the task can be opened from the manager popup.",
      linkedRecord: {
        tableName: "tasks",
        primaryKey: "id",
        title: "Task",
        labelField: "task_title",
        description:
          "Open the connected task record from the Tasks table.",
        fields: [
          {
            key: "id",
            label: "Task ID",
            type: "text",
          },
          {
            key: "task_title",
            label: "Task Title",
            type: "text",
          },
          {
            key: "status",
            label: "Status",
            type: "text",
          },
          {
            key: "priority",
            label: "Priority",
            type: "text",
          },
          {
            key: "function_area",
            label: "Function Area",
            type: "text",
          },
          {
            key: "task_type",
            label: "Task Type",
            type: "text",
          },
          {
            key: "assigned_to",
            label: "Assigned To",
            type: "employee",
          },
          {
            key: "due_date",
            label: "Due Date",
            type: "date",
          },
          {
            key: "description",
            label: "Description",
            type: "text",
          },
          {
            key: "notes",
            label: "Notes",
            type: "text",
          },
        ],
      },
    },
    {
      key: "owner",
      label: "Owner",
      type: "employee",
      description:
        "The person responsible for making sure this deliverable gets finished.",
    },
    {
      key: "submitted_by",
      label: "Submitted By",
      type: "employee",
      description:
        "The person who created or submitted this deliverable record.",
    },
    {
      key: "due_date",
      label: "Due Date",
      type: "date",
      description:
        "The date this deliverable should be completed or ready for review.",
    },
    {
      key: "completed_date",
      label: "Completed Date",
      type: "date",
      description:
        "The date the deliverable was fully completed. Leave blank until the status is Completed.",
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      description:
        "Explain what needs to be delivered, why it matters, and what the final completed version should include.",
    },
    {
      key: "notes",
      label: "Notes",
      type: "textarea",
      description:
        "Extra details, blockers, updates, review notes, or follow-up information.",
    },
  ],
  defaultVisibleFields: [
    "deliverable_name",
    "deliverable_type",
    "status",
    "priority",
    "linked_task",
    "owner",
    "due_date",
    "completed_date",
  ],
};

export default function DeliverablesListPage() {
  return <MasterManager config={deliverablesConfig} />;
}