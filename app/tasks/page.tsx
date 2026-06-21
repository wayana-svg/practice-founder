"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "../../lib/supabase/client";

type Employee = {
  id: number;
  name: string | null;
};

type OptionDefinition = {
  value: string;
  label: string;
  description: string;
};

type FormState = {
  task_title: string;
  status: string;
  priority: string;
  assigned_to: string;
  task_type: string;
  function_area: string;
  due_date: string;
  due_time: string;
  is_repeating: string;
  recurrence_frequency: string;
  recurrence_interval: string;
  recurrence_days: string;
  recurrence_monthly_rule: string;
  skip_weekends: string;
  create_next_when: string;
  recurrence_end_date: string;
  next_task_status: string;
  recurrence_fields_to_copy: string;
  ai_prompt_tool_link: string;
  description: string;
  notes: string;
};

const defaultAiToolLink = "https://chatgpt.com/g/g-BR7u9y8sL-task-creator";

const initialForm: FormState = {
  task_title: "",
  status: "To Do",
  priority: "Important",
  assigned_to: "",
  task_type: "One-time",
  function_area: "",
  due_date: "",
  due_time: "",
  is_repeating: "No",
  recurrence_frequency: "Monthly",
  recurrence_interval: "1",
  recurrence_days: "First Friday",
  recurrence_monthly_rule: "First Friday",
  skip_weekends: "No",
  create_next_when: "Complete",
  recurrence_end_date: "",
  next_task_status: "To Do",
  recurrence_fields_to_copy: "All Fields",
  ai_prompt_tool_link: defaultAiToolLink,
  description:
    "What is the purpose of the task?\n\nWhat resources are needed to complete this task?\n\nHow do we know the task is done?",
  notes: "",
};

const statusOptions: OptionDefinition[] = [
  {
    value: "To Do",
    label: "To Do",
    description:
      "The task has not started yet. Use this when the task has been created but no work has begun.",
  },
  {
    value: "In Progress",
    label: "In Progress",
    description:
      "The task is actively being worked on. Use this once someone has started doing the work.",
  },
  {
    value: "Revision Required",
    label: "Revision Required",
    description:
      "The task was reviewed and needs changes before it can be completed.",
  },
  {
    value: "Manager Review",
    label: "Manager Review",
    description:
      "The task is ready for a manager to review before it is marked complete.",
  },
  {
    value: "On Hold",
    label: "On Hold",
    description:
      "The task is paused because something is blocking progress, such as missing information, approval, or access.",
  },
  {
    value: "Complete",
    label: "Complete",
    description:
      "The task is finished. If repeat is turned on, this can create the next task.",
  },
  {
    value: "Canceled",
    label: "Canceled",
    description:
      "The task will not be completed. If repeat is turned on, this can still create the next task if that setting is chosen.",
  },
];

const priorityOptions: OptionDefinition[] = [
  {
    value: "Urgent and Important",
    label: "Urgent and Important",
    description:
      "Do this first. It is time-sensitive and important to patients, money, operations, deadlines, or leadership priorities.",
  },
  {
    value: "Important",
    label: "Important",
    description:
      "This matters and should be completed, but it is not an emergency today.",
  },
  {
    value: "Not Urgent",
    label: "Not Urgent",
    description:
      "This can be planned for later. It still matters, but it does not need immediate attention.",
  },
  {
    value: "Urgent, Not Important",
    label: "Urgent, Not Important",
    description:
      "This is time-sensitive, but it may not be high-value or strategic. Handle it after truly important work when possible.",
  },
  {
    value: "Not Important, Not Urgent",
    label: "Not Important, Not Urgent",
    description:
      "This is the lowest priority. Handle it only after higher-value work is complete.",
  },
];

const taskTypeOptions: OptionDefinition[] = [
  {
    value: "One-time",
    label: "One-time",
    description:
      "A task that happens once and does not repeat automatically.",
  },
  {
    value: "Recurring/Routine",
    label: "Recurring/Routine",
    description:
      "A task that happens on a regular schedule, such as daily, weekly, or monthly.",
  },
  {
    value: "Follow-up",
    label: "Follow-up",
    description:
      "A task created to follow up on a patient item, issue, huddle discussion, staff note, or previous task.",
  },
];

const functionAreaOptions: OptionDefinition[] = [
  {
    value: "Daily Operations",
    label: "Daily Operations",
    description:
      "Daily practice flow, opening checklists, huddles, closeout, and operational readiness.",
  },
  {
    value: "Front Desk / Reception",
    label: "Front Desk / Reception",
    description:
      "Scheduling, phones, check-in, intake, referrals, patient communication, and front desk activity.",
  },
  {
    value: "Provider Operations",
    label: "Provider Operations",
    description:
      "Physician, clinical, charting, provider workflow, patient care, or documentation tasks.",
  },
  {
    value: "Billing & Claims",
    label: "Billing & Claims",
    description:
      "Claims creation, submission, rejections, denials, coding follow-up, and billing workflow.",
  },
  {
    value: "AR & Payments",
    label: "AR & Payments",
    description:
      "Accounts receivable, payer balances, patient balances, payment follow-up, and collections.",
  },
  {
    value: "Finance",
    label: "Finance",
    description:
      "Revenue, payroll, expenses, owner pay, deposits, weekly financial reporting, and cash flow.",
  },
  {
    value: "Membership",
    label: "Membership",
    description:
      "Membership starts, cancellations, reactivations, failed payments, outreach, and follow-up.",
  },
];

const yesNoOptions: OptionDefinition[] = [
  {
    value: "No",
    label: "No",
    description: "This setting is off.",
  },
  {
    value: "Yes",
    label: "Yes",
    description: "This setting is on.",
  },
];

const recurrenceFrequencyOptions: OptionDefinition[] = [
  {
    value: "Daily",
    label: "Daily",
    description:
      "The next task is created by adding days to the current due date.",
  },
  {
    value: "Weekly",
    label: "Weekly",
    description:
      "The next task is created by adding weeks to the current due date.",
  },
  {
    value: "Monthly",
    label: "Monthly",
    description:
      "The next task is created by adding months to the current due date.",
  },
  {
    value: "Custom",
    label: "Custom",
    description:
      "Use a custom repeat interval, such as every 2 weeks or every 3 days.",
  },
];

const recurrenceRuleOptions: OptionDefinition[] = [
  {
    value: "Every Day",
    label: "Every Day",
    description: "The task may repeat every calendar day.",
  },
  {
    value: "Weekdays Only",
    label: "Weekdays Only",
    description:
      "The task repeats only on weekdays and avoids Saturday and Sunday.",
  },
  {
    value: "Monday",
    label: "Monday",
    description: "The weekly repeat is tied to Monday.",
  },
  {
    value: "Tuesday",
    label: "Tuesday",
    description: "The weekly repeat is tied to Tuesday.",
  },
  {
    value: "Wednesday",
    label: "Wednesday",
    description: "The weekly repeat is tied to Wednesday.",
  },
  {
    value: "Thursday",
    label: "Thursday",
    description: "The weekly repeat is tied to Thursday.",
  },
  {
    value: "Friday",
    label: "Friday",
    description: "The weekly repeat is tied to Friday.",
  },
  {
    value: "First Monday",
    label: "First Monday",
    description: "Repeat on the first Monday of the month.",
  },
  {
    value: "First Tuesday",
    label: "First Tuesday",
    description: "Repeat on the first Tuesday of the month.",
  },
  {
    value: "First Wednesday",
    label: "First Wednesday",
    description: "Repeat on the first Wednesday of the month.",
  },
  {
    value: "First Thursday",
    label: "First Thursday",
    description: "Repeat on the first Thursday of the month.",
  },
  {
    value: "First Friday",
    label: "First Friday",
    description: "Repeat on the first Friday of the month.",
  },
  {
    value: "Same Day of Month",
    label: "Same Day of Month",
    description: "Repeat on the same calendar day number of the next month.",
  },
  {
    value: "Last Friday",
    label: "Last Friday",
    description: "Repeat on the last Friday of the month.",
  },
];

const createNextWhenOptions: OptionDefinition[] = [
  {
    value: "Complete",
    label: "Complete",
    description:
      "Create the next task when this task is marked Complete.",
  },
  {
    value: "Canceled",
    label: "Canceled",
    description:
      "Create the next task when this task is marked Canceled.",
  },
  {
    value: "Complete or Canceled",
    label: "Complete or Canceled",
    description:
      "Create the next task when this task is marked either Complete or Canceled.",
  },
];

const copyFieldsOptions: OptionDefinition[] = [
  {
    value: "All Fields",
    label: "All Fields",
    description:
      "Copy the full task setup into the next repeating task.",
  },
  {
    value: "Core Fields Only",
    label: "Core Fields Only",
    description:
      "Copy only the main task details, ownership, priority, and repeat rule.",
  },
  {
    value: "Title and Schedule Only",
    label: "Title and Schedule Only",
    description:
      "Copy only the title and schedule. Use this when notes should not carry forward.",
  },
];

function formatDateLabel(value: string) {
  if (!value) return "Select";

  const date = new Date(`${value}T12:00:00`);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthDays(calendarDate: Date) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<number | null> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export default function TasksPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(() => new Date());

  useEffect(() => {
    loadEmployees();
  }, []);

  const calendarDays = useMemo(() => getMonthDays(calendarDate), [calendarDate]);

  async function loadEmployees() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("employees")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setEmployees((data as Employee[]) || []);
  }

  function updateField(key: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toNumberOrNull(value: string) {
    if (!value) return null;
    return Number(value);
  }

  function toBoolean(value: string) {
    return value === "Yes";
  }

  function getOptionDescription(options: OptionDefinition[], value: string) {
    return options.find((option) => option.value === value)?.description || "";
  }

  function chooseCalendarDay(day: number) {
    const selectedDate = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      day
    );

    const value = toDateInputValue(selectedDate);

    setForm((current) => ({
      ...current,
      due_date: value,
      recurrence_end_date: current.recurrence_end_date || value,
    }));
  }

  function moveMonth(direction: "previous" | "next") {
    setCalendarDate((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + (direction === "next" ? 1 : -1));
      return next;
    });
  }

  function buildPayload() {
    const isRepeating = form.is_repeating === "Yes";

    return {
      task_title: form.task_title || null,
      status: form.status || "To Do",
      priority: form.priority || "Important",
      assigned_to: toNumberOrNull(form.assigned_to),
      task_type: form.task_type || null,
      function_area: form.function_area || null,

      due_date_type: isRepeating ? "Repeating" : "Standard",
      due_date: form.due_date || null,
      due_time: form.due_time || null,

      recurrence_frequency: isRepeating
        ? form.recurrence_frequency || null
        : null,
      recurrence_interval: isRepeating
        ? Number(form.recurrence_interval || 1)
        : 1,
      recurrence_days: isRepeating ? form.recurrence_days || null : null,
      recurrence_monthly_rule: isRepeating ? form.recurrence_days || null : null,
      skip_weekends: isRepeating ? toBoolean(form.skip_weekends) : false,
      create_next_when: isRepeating ? form.create_next_when || "Complete" : null,
      recurrence_end_date: isRepeating ? form.recurrence_end_date || null : null,
      next_task_status: isRepeating ? form.next_task_status || "To Do" : null,
      recurrence_fields_to_copy: isRepeating
        ? form.recurrence_fields_to_copy || "All Fields"
        : null,

      ai_prompt_tool_link: form.ai_prompt_tool_link || defaultAiToolLink,
      description: form.description || null,
      notes: form.notes || null,
    };
  }

  async function saveTask() {
    setMessage("");
    setErrorMessage("");

    if (!form.task_title.trim()) {
      setErrorMessage("Task Title is required.");
      return;
    }

    setSaving(true);

    const supabase = createClient();

    const { error } = await supabase.from("tasks").insert(buildPayload());

    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Task saved.");
    setForm(initialForm);
  }

  return (
    <main style={pageStyle}>
      <section style={headerStyle}>
        <div>
          <a href="/?table=tasks" style={backLinkStyle}>
            ← Back to Tasks
          </a>

          <div style={eyebrowStyle}>PRACTICE FOUNDER · TASK MANAGEMENT</div>
          <h1 style={titleStyle}>Add Task</h1>
          <p style={descriptionStyle}>
            Add a task, assign ownership, set priority, choose a regular due
            date, and turn on repeat only when this task should happen again.
          </p>
        </div>

        <a href="/tasks-list" style={managerLinkStyle}>
          Open Manager
        </a>
      </section>

      {message ? <div style={successStyle}>{message}</div> : null}
      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      <section style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <div style={sectionEyebrowStyle}>SECTION 1</div>
            <h2 style={sectionTitleStyle}>Task Details</h2>
          </div>

          <p style={sectionHelpStyle}>
            Start with the task name, status, priority, owner, type, and
            function area.
          </p>
        </div>

        <div style={fieldGridStyle}>
          <label style={fieldStyle}>
            <span style={labelRowStyle}>
              Task Title <strong style={requiredStyle}>*</strong>
              <span title="Short, clear name of the task." style={infoIconStyle}>
                i
              </span>
            </span>
            <small style={helpTextStyle}>
              Short, clear name of the task. The assignee should understand the
              work quickly.
            </small>
            <input
              value={form.task_title}
              onChange={(event) => updateField("task_title", event.target.value)}
              style={inputStyle}
            />
          </label>

          <SelectField
            label="Status"
            value={form.status}
            description="Current workflow stage of the task."
            options={statusOptions}
            onChange={(value) => updateField("status", value)}
          />

          <SelectField
            label="Priority"
            value={form.priority}
            description="How urgent and important the task is compared with other work."
            options={priorityOptions}
            onChange={(value) => updateField("priority", value)}
          />

          <label style={fieldStyle}>
            <span style={labelRowStyle}>
              Assigned To
              <span title="The person responsible for the task." style={infoIconStyle}>
                i
              </span>
            </span>
            <small style={helpTextStyle}>
              The employee responsible for completing this task.
            </small>
            <select
              value={form.assigned_to}
              onChange={(event) => updateField("assigned_to", event.target.value)}
              style={inputStyle}
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name || `Employee #${employee.id}`}
                </option>
              ))}
            </select>
          </label>

          <SelectField
            label="Task Type"
            value={form.task_type}
            description="The kind of task being created."
            options={taskTypeOptions}
            onChange={(value) => updateField("task_type", value)}
          />

          <SelectField
            label="Function Area"
            value={form.function_area}
            description="The business area this task belongs to."
            options={functionAreaOptions}
            placeholder="Select function area"
            onChange={(value) => updateField("function_area", value)}
          />
        </div>
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <div style={sectionEyebrowStyle}>SECTION 2</div>
            <h2 style={sectionTitleStyle}>Due Date</h2>
          </div>

          <p style={sectionHelpStyle}>
            Pick a regular due date. Use the repeating task pop-up when this
            task needs to happen again.
          </p>
        </div>

        <div style={dateFieldWrapStyle}>
          <button
            type="button"
            onClick={() => setDatePopoverOpen(true)}
            style={datePickerButtonStyle}
          >
            <span>
              <strong>Due Date</strong>
              <small style={datePickerHelpStyle}>
                Click to open calendar and repeat settings.
              </small>
            </span>

            <span style={dateValueBadgeStyle}>
              {form.due_date ? formatDateLabel(form.due_date) : "Choose Date"}
            </span>
          </button>

          <label style={timeFieldStyle}>
            Due Time
            <small style={helpTextStyle}>
              Optional time the task should be completed by.
            </small>
            <input
              type="time"
              value={form.due_time}
              onChange={(event) => updateField("due_time", event.target.value)}
              style={inputStyle}
            />
          </label>

          {datePopoverOpen ? (
            <div style={datePopoverBackdropStyle}>
              <div style={datePopoverStyle}>
                <aside style={repeatSideStyle}>
                  <div style={repeatSideHeaderStyle}>
                    <h3 style={repeatSideTitleStyle}>Repeating Task</h3>

                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          "is_repeating",
                          form.is_repeating === "Yes" ? "No" : "Yes"
                        )
                      }
                      style={
                        form.is_repeating === "Yes"
                          ? activeSwitchStyle
                          : switchStyle
                      }
                      aria-label="Toggle repeating task"
                    >
                      <span
                        style={
                          form.is_repeating === "Yes"
                            ? activeSwitchKnobStyle
                            : switchKnobStyle
                        }
                      />
                    </button>
                  </div>

                  <div style={repeatRowStyle}>
                    <label style={compactLabelStyle}>
                      Repeats
                      <span
                        title="How often this task should repeat."
                        style={smallInfoIconStyle}
                      >
                        i
                      </span>
                    </label>

                    <select
                      value={form.recurrence_frequency}
                      onChange={(event) =>
                        updateField("recurrence_frequency", event.target.value)
                      }
                      disabled={form.is_repeating !== "Yes"}
                      style={compactSelectStyle}
                    >
                      {recurrenceFrequencyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <small style={compactDescriptionStyle}>
                      {getOptionDescription(
                        recurrenceFrequencyOptions,
                        form.recurrence_frequency
                      )}
                    </small>
                  </div>

                  <div style={repeatRowStyle}>
                    <select
                      value={form.recurrence_days}
                      onChange={(event) => {
                        updateField("recurrence_days", event.target.value);
                        updateField("recurrence_monthly_rule", event.target.value);
                      }}
                      disabled={form.is_repeating !== "Yes"}
                      style={compactSelectStyle}
                    >
                      {recurrenceRuleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <small style={compactDescriptionStyle}>
                      {getOptionDescription(
                        recurrenceRuleOptions,
                        form.recurrence_days
                      )}
                    </small>
                  </div>

                  <div style={repeatDividerStyle} />

                  <div style={repeatRowStyle}>
                    <label style={compactLabelStyle}>
                      Create new task
                      <small style={mutedSmallStyle}>
                        when status is set to completed
                      </small>
                    </label>

                    <select
                      value={form.create_next_when}
                      onChange={(event) =>
                        updateField("create_next_when", event.target.value)
                      }
                      disabled={form.is_repeating !== "Yes"}
                      style={compactSelectStyle}
                    >
                      {createNextWhenOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={repeatDividerStyle} />

                  <div style={repeatInlineRowStyle}>
                    <span style={compactLabelStyle}>Set Status to</span>

                    <select
                      value={form.next_task_status}
                      onChange={(event) =>
                        updateField("next_task_status", event.target.value)
                      }
                      disabled={form.is_repeating !== "Yes"}
                      style={statusPillSelectStyle}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={repeatDividerStyle} />

                  <div style={repeatInlineRowStyle}>
                    <span style={compactLabelStyle}>Fields to Copy</span>

                    <select
                      value={form.recurrence_fields_to_copy}
                      onChange={(event) =>
                        updateField(
                          "recurrence_fields_to_copy",
                          event.target.value
                        )
                      }
                      disabled={form.is_repeating !== "Yes"}
                      style={plainSelectStyle}
                    >
                      {copyFieldsOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </aside>

                <section style={calendarSideStyle}>
                  <div style={calendarTopStyle}>
                    <div style={dateHeaderBlockStyle}>
                      <span style={dateHeaderLabelStyle}>Start Date</span>
                      <strong style={dateHeaderValueStyle}>
                        {formatDateLabel(form.due_date)}
                      </strong>
                    </div>

                    <div style={dateHeaderBlockStyle}>
                      <span style={dateHeaderLabelStyle}>End Date</span>
                      <strong style={dateHeaderValueStyle}>
                        {formatDateLabel(form.recurrence_end_date || form.due_date)}
                      </strong>
                    </div>
                  </div>

                  <div style={calendarNavStyle}>
                    <button
                      type="button"
                      onClick={() => moveMonth("previous")}
                      style={calendarArrowStyle}
                    >
                      ←
                    </button>

                    <strong>{formatMonthYear(calendarDate)}</strong>

                    <button
                      type="button"
                      onClick={() => moveMonth("next")}
                      style={calendarArrowStyle}
                    >
                      →
                    </button>
                  </div>

                  <div style={calendarGridStyle}>
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div key={day} style={weekdayStyle}>
                        {day}
                      </div>
                    ))}

                    {calendarDays.map((day, index) => {
                      const selectedDate =
                        day !== null
                          ? toDateInputValue(
                              new Date(
                                calendarDate.getFullYear(),
                                calendarDate.getMonth(),
                                day
                              )
                            )
                          : "";

                      const isSelected = selectedDate === form.due_date;

                      return (
                        <button
                          key={`${day || "blank"}-${index}`}
                          type="button"
                          disabled={day === null}
                          onClick={() => {
                            if (day !== null) chooseCalendarDay(day);
                          }}
                          style={
                            day === null
                              ? blankDayStyle
                              : isSelected
                                ? selectedDayStyle
                                : dayButtonStyle
                          }
                        >
                          {day || ""}
                        </button>
                      );
                    })}
                  </div>

                  <div style={calendarFooterStyle}>
                    <button
                      type="button"
                      style={iconButtonStyle}
                      title="Time settings"
                    >
                      ◷
                    </button>

                    <button
                      type="button"
                      style={iconButtonStyle}
                      title="Repeat settings"
                      onClick={() => updateField("is_repeating", "Yes")}
                    >
                      ↻
                    </button>

                    <div style={{ flex: 1 }} />

                    <button
                      type="button"
                      onClick={() => setDatePopoverOpen(false)}
                      style={calendarCancelButtonStyle}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => setDatePopoverOpen(false)}
                      style={calendarDoneButtonStyle}
                    >
                      Done
                    </button>
                  </div>
                </section>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <div style={sectionEyebrowStyle}>SECTION 3</div>
            <h2 style={sectionTitleStyle}>AI Prompt and Task Instructions</h2>
          </div>

          <p style={sectionHelpStyle}>
            Use the AI task creator link when you want help turning a rough idea
            into a clear task.
          </p>
        </div>

        <label style={fieldStyle}>
          <span style={labelRowStyle}>
            AI Prompt Tool Link
            <span title="Link to the AI task creator." style={infoIconStyle}>
              i
            </span>
          </span>
          <small style={helpTextStyle}>
            Link to the AI task creator used to help write a clear task
            description.
          </small>
          <input
            type="url"
            value={form.ai_prompt_tool_link}
            onChange={(event) =>
              updateField("ai_prompt_tool_link", event.target.value)
            }
            style={inputStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelRowStyle}>
            Description
            <span title="Task details and definition of done." style={infoIconStyle}>
              i
            </span>
          </span>
          <small style={helpTextStyle}>
            Task details. Include the purpose, resources needed, and definition
            of done.
          </small>
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            style={textareaStyle}
          />
        </label>

        <label style={fieldStyle}>
          <span style={labelRowStyle}>
            Notes
            <span title="Extra task context or comments." style={infoIconStyle}>
              i
            </span>
          </span>
          <small style={helpTextStyle}>
            Optional extra context, follow-up notes, reminders, or internal
            comments.
          </small>
          <textarea
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            style={textareaStyle}
          />
        </label>
      </section>

      <section style={submitBarStyle}>
        <button
          type="button"
          onClick={saveTask}
          disabled={saving}
          style={saveButtonStyle}
        >
          {saving ? "Saving..." : "Save Task"}
        </button>

        <a href="/?table=tasks" style={secondaryLinkStyle}>
          Cancel
        </a>
      </section>
    </main>
  );
}

function SelectField({
  label,
  value,
  description,
  options,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  description: string;
  options: OptionDefinition[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <label style={fieldStyle}>
      <span style={labelRowStyle}>
        {label}
        <span title={description} style={infoIconStyle}>
          i
        </span>
      </span>

      <small style={helpTextStyle}>{description}</small>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={inputStyle}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            title={option.description}
          >
            {option.label}
          </option>
        ))}
      </select>

      <small style={optionHelpStyle}>
        {selectedOption
          ? `${selectedOption.label}: ${selectedOption.description}`
          : "Choose an option to see what it means."}
      </small>
    </label>
  );
}

const colors = {
  navy: "#1C2333",
  gold: "#C9A84C",
  goldPale: "#F5EDD8",
  cream: "#F8F5EE",
  white: "#FFFFFF",
  slate: "#5F6673",
  border: "#DED8C8",
  red: "#9F1239",
  green: "#166534",
  orange: "#FF6B2C",
  orangeLight: "#FFE6DA",
};

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: colors.cream,
  color: colors.navy,
  fontFamily: "var(--font-dm-sans), Arial, sans-serif",
  padding: "34px",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "24px",
  marginBottom: "22px",
};

const backLinkStyle: CSSProperties = {
  display: "inline-block",
  marginBottom: "16px",
  color: colors.navy,
  textDecoration: "none",
  fontWeight: 800,
};

const eyebrowStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "11px",
  letterSpacing: "0.16em",
};

const titleStyle: CSSProperties = {
  margin: "8px 0 0",
  fontFamily: "var(--font-playfair), serif",
  fontSize: "42px",
  fontWeight: 600,
};

const descriptionStyle: CSSProperties = {
  color: colors.slate,
  fontSize: "16px",
  maxWidth: "860px",
  lineHeight: 1.6,
};

const managerLinkStyle: CSSProperties = {
  background: colors.gold,
  color: colors.navy,
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  fontWeight: 900,
  height: "fit-content",
};

const successStyle: CSSProperties = {
  background: "#ecfdf5",
  color: colors.green,
  border: "1px solid #bbf7d0",
  padding: "14px",
  marginBottom: "16px",
};

const errorStyle: CSSProperties = {
  background: "#fff1f2",
  color: colors.red,
  border: "1px solid #fecdd3",
  padding: "14px",
  marginBottom: "16px",
};

const sectionCardStyle: CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "22px",
  marginBottom: "20px",
  boxShadow: "0 18px 42px rgba(28,35,51,0.06)",
};

const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  borderBottom: `1px solid ${colors.border}`,
  paddingBottom: "14px",
  marginBottom: "18px",
};

const sectionEyebrowStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "10px",
  letterSpacing: "0.16em",
};

const sectionTitleStyle: CSSProperties = {
  margin: "6px 0 0",
  fontFamily: "var(--font-playfair), serif",
  fontSize: "30px",
  fontWeight: 600,
};

const sectionHelpStyle: CSSProperties = {
  color: colors.slate,
  maxWidth: "460px",
  lineHeight: 1.5,
  margin: 0,
};

const fieldGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "16px",
  marginBottom: "18px",
};

const fieldStyle: CSSProperties = {
  display: "grid",
  gap: "6px",
  fontWeight: 800,
  marginBottom: "16px",
};

const labelRowStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
};

const requiredStyle: CSSProperties = {
  color: colors.red,
};

const helpTextStyle: CSSProperties = {
  color: colors.slate,
  fontSize: "12px",
  fontWeight: 500,
  lineHeight: 1.4,
};

const optionHelpStyle: CSSProperties = {
  color: colors.slate,
  fontSize: "12px",
  fontWeight: 700,
  lineHeight: 1.4,
};

const infoIconStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "16px",
  height: "16px",
  borderRadius: "999px",
  background: colors.goldPale,
  color: colors.navy,
  fontSize: "11px",
  fontWeight: 900,
  cursor: "help",
};

const smallInfoIconStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "14px",
  height: "14px",
  borderRadius: "999px",
  background: "#D8D8D8",
  color: colors.white,
  fontSize: "10px",
  fontWeight: 900,
  cursor: "help",
  marginLeft: "5px",
};

const inputStyle: CSSProperties = {
  height: "42px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "0 10px",
  color: colors.navy,
  background: colors.white,
};

const textareaStyle: CSSProperties = {
  minHeight: "140px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "10px",
  color: colors.navy,
  background: colors.white,
  fontFamily: "var(--font-dm-sans), Arial, sans-serif",
};

const dateFieldWrapStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "1fr 260px",
  gap: "16px",
  alignItems: "start",
};

const datePickerButtonStyle: CSSProperties = {
  border: `1px solid ${colors.border}`,
  background: colors.cream,
  color: colors.navy,
  minHeight: "74px",
  borderRadius: "12px",
  padding: "14px 16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "18px",
  cursor: "pointer",
  textAlign: "left",
};

const datePickerHelpStyle: CSSProperties = {
  display: "block",
  marginTop: "4px",
  color: colors.slate,
  fontSize: "12px",
  fontWeight: 500,
};

const dateValueBadgeStyle: CSSProperties = {
  background: colors.orange,
  color: colors.white,
  padding: "9px 12px",
  borderRadius: "999px",
  fontWeight: 900,
  minWidth: "112px",
  textAlign: "center",
};

const timeFieldStyle: CSSProperties = {
  display: "grid",
  gap: "6px",
  fontWeight: 800,
};

const datePopoverBackdropStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 90,
  background: "rgba(28,35,51,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
};

const datePopoverStyle: CSSProperties = {
  width: "min(900px, 96vw)",
  minHeight: "560px",
  display: "grid",
  gridTemplateColumns: "330px 1fr",
  background: colors.white,
  border: `2px solid ${colors.orange}`,
  boxShadow: "0 30px 80px rgba(0,0,0,0.30)",
};

const repeatSideStyle: CSSProperties = {
  borderRight: `1px solid ${colors.border}`,
  padding: "20px",
  background: colors.white,
};

const repeatSideHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "18px",
};

const repeatSideTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "18px",
  fontWeight: 900,
};

const switchStyle: CSSProperties = {
  width: "36px",
  height: "20px",
  borderRadius: "999px",
  border: "none",
  background: "#D8D8D8",
  padding: "2px",
  cursor: "pointer",
};

const activeSwitchStyle: CSSProperties = {
  ...switchStyle,
  background: colors.orange,
};

const switchKnobStyle: CSSProperties = {
  display: "block",
  width: "16px",
  height: "16px",
  borderRadius: "999px",
  background: colors.white,
};

const activeSwitchKnobStyle: CSSProperties = {
  ...switchKnobStyle,
  marginLeft: "16px",
};

const repeatRowStyle: CSSProperties = {
  display: "grid",
  gap: "7px",
  marginBottom: "14px",
};

const repeatInlineRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  marginBottom: "14px",
};

const compactLabelStyle: CSSProperties = {
  color: colors.navy,
  fontSize: "14px",
  fontWeight: 700,
};

const mutedSmallStyle: CSSProperties = {
  display: "block",
  color: colors.slate,
  fontSize: "11px",
  fontWeight: 500,
  marginTop: "3px",
};

const compactSelectStyle: CSSProperties = {
  height: "40px",
  border: `1px solid ${colors.border}`,
  borderRadius: "6px",
  padding: "0 10px",
  background: colors.white,
  color: colors.navy,
};

const compactDescriptionStyle: CSSProperties = {
  color: colors.slate,
  fontSize: "11px",
  lineHeight: 1.35,
};

const repeatDividerStyle: CSSProperties = {
  height: "1px",
  background: colors.border,
  margin: "14px 0",
};

const statusPillSelectStyle: CSSProperties = {
  border: "none",
  background: "#FF5D68",
  color: colors.white,
  borderRadius: "7px",
  padding: "5px 7px",
  fontWeight: 900,
  fontSize: "12px",
};

const plainSelectStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: colors.slate,
  fontWeight: 700,
};

const calendarSideStyle: CSSProperties = {
  background: colors.white,
  display: "grid",
  gridTemplateRows: "82px auto 1fr auto",
};

const calendarTopStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  background: colors.orange,
  color: colors.white,
};

const dateHeaderBlockStyle: CSSProperties = {
  padding: "14px 24px",
  display: "grid",
  gap: "5px",
  alignContent: "center",
  textAlign: "center",
};

const dateHeaderLabelStyle: CSSProperties = {
  fontSize: "12px",
  fontWeight: 800,
};

const dateHeaderValueStyle: CSSProperties = {
  fontSize: "18px",
};

const calendarNavStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "20px 36px 8px",
};

const calendarArrowStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#B8B8B8",
  fontSize: "24px",
  cursor: "pointer",
};

const calendarGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: "4px",
  padding: "8px 34px 20px",
  alignContent: "start",
};

const weekdayStyle: CSSProperties = {
  textAlign: "center",
  fontSize: "13px",
  color: colors.navy,
  padding: "8px 0",
};

const dayButtonStyle: CSSProperties = {
  height: "38px",
  border: "none",
  background: "transparent",
  borderRadius: "999px",
  cursor: "pointer",
  color: colors.navy,
  fontWeight: 700,
};

const selectedDayStyle: CSSProperties = {
  ...dayButtonStyle,
  background: colors.orange,
  color: colors.white,
};

const blankDayStyle: CSSProperties = {
  height: "38px",
  border: "none",
  background: "transparent",
};

const calendarFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "16px 28px",
  borderTop: `1px solid ${colors.border}`,
};

const iconButtonStyle: CSSProperties = {
  width: "32px",
  height: "32px",
  border: `1px solid ${colors.orange}`,
  background: colors.white,
  color: colors.orange,
  borderRadius: "7px",
  fontWeight: 900,
  cursor: "pointer",
};

const calendarCancelButtonStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: colors.navy,
  fontWeight: 900,
  padding: "10px 12px",
  cursor: "pointer",
};

const calendarDoneButtonStyle: CSSProperties = {
  border: "none",
  background: colors.orange,
  color: colors.white,
  borderRadius: "999px",
  fontWeight: 900,
  padding: "10px 18px",
  cursor: "pointer",
};

const submitBarStyle: CSSProperties = {
  display: "flex",
  gap: "10px",
  justifyContent: "flex-end",
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "16px",
  position: "sticky",
  bottom: "20px",
};

const saveButtonStyle: CSSProperties = {
  background: colors.gold,
  color: colors.navy,
  border: "none",
  borderRadius: "8px",
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

const secondaryLinkStyle: CSSProperties = {
  background: colors.goldPale,
  color: colors.navy,
  borderRadius: "8px",
  padding: "10px 14px",
  fontWeight: 900,
  textDecoration: "none",
};