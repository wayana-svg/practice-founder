"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "../lib/supabase/client";

export type DailyOperationsLogData = Record<
  string,
  string | number | boolean | null
>;

type Employee = {
  id: number;
  name: string | null;
};

type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "time"
  | "datetime"
  | "select"
  | "employee"
  | "number";

type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  description: string;
  required?: boolean;
  options?: string[];
};

type ChecklistItem = {
  checkKey: string;
  notesKey: string;
  label: string;
  description: string;
};

type FormState = Record<string, string>;

type DailyOperationsLogFormProps = {
  mode: "create" | "edit";
  initialData?: DailyOperationsLogData | null;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  onSaved?: () => void;
};

const basicFields: FieldConfig[] = [
  {
    key: "log_date",
    label: "Log Date",
    type: "date",
    required: true,
    description: "The date this full daily operations packet is being completed for.",
  },
  {
    key: "submitted_by",
    label: "Submitted By",
    type: "employee",
    description: "The person creating or updating this daily operations log.",
  },
  {
    key: "overall_status",
    label: "Overall Status",
    type: "select",
    description:
      "Use this to show whether the daily packet is still in progress, completed, incomplete, or needs follow-up.",
    options: ["In Progress", "Completed", "Needs Follow-Up", "Incomplete"],
  },
  {
    key: "notes",
    label: "General Notes",
    type: "textarea",
    description:
      "General notes about the day that do not belong in a specific checklist section.",
  },
];

const openingHeaderFields: FieldConfig[] = [
  {
    key: "opening_completed_by",
    label: "Opening Completed By",
    type: "employee",
    description:
      "The person responsible for completing the Daily Opening Checklist before the first patient.",
  },
  {
    key: "opening_start_time",
    label: "Opening Start Time",
    type: "time",
    description: "The time the opening checklist was started.",
  },
  {
    key: "opening_end_time",
    label: "Opening End Time",
    type: "time",
    description: "The time the opening checklist was finished.",
  },
  {
    key: "opening_time_submitted",
    label: "Opening Time Submitted",
    type: "time",
    description:
      "The time the signed opening checklist was submitted or confirmed complete.",
  },
];

const communicationSweepItems: ChecklistItem[] = [
  {
    checkKey: "opening_voicemails_checked",
    notesKey: "opening_voicemails_checked_notes",
    label: "Voicemails checked",
    description:
      "Confirm all voicemail messages were reviewed and urgent messages were identified.",
  },
  {
    checkKey: "opening_portal_messages_reviewed",
    notesKey: "opening_portal_messages_reviewed_notes",
    label: "Portal messages reviewed",
    description:
      "Confirm patient portal messages were reviewed for urgent needs, clinical issues, and follow-ups.",
  },
  {
    checkKey: "opening_emails_reviewed",
    notesKey: "opening_emails_reviewed_notes",
    label: "Emails reviewed",
    description:
      "Confirm relevant inboxes were checked and urgent emails were identified.",
  },
  {
    checkKey: "opening_urgent_patient_callbacks_identified",
    notesKey: "opening_urgent_patient_callbacks_identified_notes",
    label: "Urgent patient callbacks identified",
    description:
      "Confirm urgent callbacks were identified and routed to the right owner.",
  },
  {
    checkKey: "opening_escalations_logged",
    notesKey: "opening_escalations_logged_notes",
    label: "Escalations logged",
    description:
      "Confirm anything needing escalation was logged and not left informal or undocumented.",
  },
  {
    checkKey: "opening_overnight_cancellations_reviewed",
    notesKey: "opening_overnight_cancellations_reviewed_notes",
    label: "Overnight cancellations reviewed",
    description:
      "Confirm overnight cancellations were reviewed so the schedule can be adjusted early.",
  },
];

const scheduleIntegrityItems: ChecklistItem[] = [
  {
    checkKey: "opening_todays_schedule_reviewed",
    notesKey: "opening_todays_schedule_reviewed_notes",
    label: "Today’s schedule reviewed",
    description:
      "Review the day’s schedule for flow, gaps, risk points, and patient readiness.",
  },
  {
    checkKey: "opening_incomplete_patients_identified",
    notesKey: "opening_incomplete_patients_identified_notes",
    label: "Incomplete patients identified",
    description:
      "Identify patients missing information, forms, insurance details, or other needed items.",
  },
  {
    checkKey: "opening_insurance_verification_gaps_identified",
    notesKey: "opening_insurance_verification_gaps_identified_notes",
    label: "Insurance verification gaps identified",
    description:
      "Identify insurance verification problems before the patient arrives.",
  },
  {
    checkKey: "opening_missing_intake_forms_identified",
    notesKey: "opening_missing_intake_forms_identified_notes",
    label: "Missing intake forms identified",
    description:
      "Identify patients who are missing intake forms or required pre-visit paperwork.",
  },
  {
    checkKey: "opening_blocked_provider_time_confirmed",
    notesKey: "opening_blocked_provider_time_confirmed_notes",
    label: "Blocked provider time confirmed",
    description:
      "Confirm blocked provider time is intentional and not an accidental schedule gap.",
  },
  {
    checkKey: "opening_waitlist_move_up_opportunities_reviewed",
    notesKey: "opening_waitlist_move_up_opportunities_reviewed_notes",
    label: "Waitlist / move-up opportunities reviewed",
    description:
      "Review whether cancellations or gaps can be filled by moving patients up.",
  },
  {
    checkKey: "opening_double_bookings_identified",
    notesKey: "opening_double_bookings_identified_notes",
    label: "Double bookings identified",
    description:
      "Identify double bookings or possible provider-flow conflicts.",
  },
  {
    checkKey: "opening_high_complexity_patients_flagged",
    notesKey: "opening_high_complexity_patients_flagged_notes",
    label: "High-complexity patients flagged",
    description:
      "Flag patients who may need extra time, preparation, coordination, or provider awareness.",
  },
];

const operationalReadinessItems: ChecklistItem[] = [
  {
    checkKey: "opening_rooms_prepared",
    notesKey: "opening_rooms_prepared_notes",
    label: "Rooms prepared",
    description:
      "Confirm patient rooms are ready, clean, stocked, and usable before the day starts.",
  },
  {
    checkKey: "opening_equipment_functioning",
    notesKey: "opening_equipment_functioning_notes",
    label: "Equipment functioning",
    description:
      "Confirm required equipment is working and any issues are reported before patient care starts.",
  },
  {
    checkKey: "opening_labs_prepared",
    notesKey: "opening_labs_prepared_notes",
    label: "Labs prepared",
    description:
      "Confirm lab materials, supplies, orders, and workflows are ready for the day.",
  },
  {
    checkKey: "opening_supplies_checked",
    notesKey: "opening_supplies_checked_notes",
    label: "Supplies checked",
    description:
      "Confirm needed supplies are available and shortages are noted or escalated.",
  },
  {
    checkKey: "opening_staff_coverage_confirmed",
    notesKey: "opening_staff_coverage_confirmed_notes",
    label: "Staff coverage confirmed",
    description:
      "Confirm staffing coverage for the day and note absences, gaps, or backup plans.",
  },
  {
    checkKey: "opening_referral_backlog_reviewed",
    notesKey: "opening_referral_backlog_reviewed_notes",
    label: "Referral backlog reviewed",
    description:
      "Review referral backlog and identify urgent or overdue referral follow-up.",
  },
  {
    checkKey: "opening_billing_backlog_reviewed",
    notesKey: "opening_billing_backlog_reviewed_notes",
    label: "Billing backlog reviewed",
    description:
      "Review billing backlog and identify items that could affect money, claims, or collections.",
  },
  {
    checkKey: "opening_open_clinical_loops_reviewed",
    notesKey: "opening_open_clinical_loops_reviewed_notes",
    label: "Open clinical loops reviewed",
    description:
      "Review unresolved clinical items such as labs, referrals, callbacks, orders, and pending follow-ups.",
  },
];

const huddleHeaderFields: FieldConfig[] = [
  {
    key: "huddle_start_time",
    label: "Huddle Start Time",
    type: "time",
    description: "The time the standing daily huddle started.",
  },
  {
    key: "huddle_end_time",
    label: "Huddle End Time",
    type: "time",
    description:
      "The time the huddle ended. The packet notes this should be a short standing meeting.",
  },
  {
    key: "huddle_lead",
    label: "Huddle Lead",
    type: "employee",
    description: "The person who led the daily huddle.",
  },
  {
    key: "huddle_completed",
    label: "Huddle Completed",
    type: "select",
    description: "Mark Yes if the daily huddle was completed.",
    options: ["Yes", "No"],
  },
  {
    key: "huddle_present_other",
    label: "Other Present",
    type: "text",
    description:
      "Use this for anyone present at the huddle who is not listed as a standard attendee.",
  },
];

const huddleAttendanceItems: ChecklistItem[] = [
  {
    checkKey: "huddle_present_donna",
    notesKey: "huddle_present_donna_notes",
    label: "Donna present",
    description: "Confirm Donna attended the daily huddle.",
  },
  {
    checkKey: "huddle_present_raven",
    notesKey: "huddle_present_raven_notes",
    label: "Raven present",
    description: "Confirm Raven attended the daily huddle.",
  },
  {
    checkKey: "huddle_present_carla",
    notesKey: "huddle_present_carla_notes",
    label: "Carla present",
    description: "Confirm Carla attended the daily huddle.",
  },
  {
    checkKey: "huddle_present_mykeal",
    notesKey: "huddle_present_mykeal_notes",
    label: "Mykeal present",
    description: "Confirm Mykeal attended the daily huddle.",
  },
  {
    checkKey: "huddle_present_dr_akita",
    notesKey: "huddle_present_dr_akita_notes",
    label: "Dr. Akita present",
    description: "Confirm Dr. Akita attended or enforced the huddle.",
  },
];

const huddleTextFields: FieldConfig[] = [
  {
    key: "huddle_open_issues_review",
    label: "Open Issues Review",
    type: "textarea",
    description:
      "List open issues discussed in huddle, including owner, days open, action today, and whether it was escalated.",
  },
  {
    key: "huddle_action_today",
    label: "Action Today",
    type: "textarea",
    description:
      "Write the actions that need to happen today based on huddle discussion.",
  },
  {
    key: "huddle_escalated_items",
    label: "Escalated Items",
    type: "textarea",
    description:
      "List any huddle items escalated to leadership, provider, billing, or another owner.",
  },
  {
    key: "huddle_notes",
    label: "Huddle Notes",
    type: "textarea",
    description: "Additional notes from the daily huddle.",
  },
];

const yesterdayCloseReviewItems: ChecklistItem[] = [
  {
    checkKey: "huddle_yesterday_all_charts_closed_same_day",
    notesKey: "huddle_yesterday_all_charts_closed_same_day_notes",
    label: "All charts closed same day",
    description:
      "Confirm yesterday’s charts were closed the same day or note what remains open.",
  },
  {
    checkKey: "huddle_yesterday_all_claims_submitted_24_hrs",
    notesKey: "huddle_yesterday_all_claims_submitted_24_hrs_notes",
    label: "All claims submitted within 24 hrs",
    description:
      "Confirm claims from yesterday were submitted within 24 hours or note exceptions.",
  },
  {
    checkKey: "huddle_yesterday_all_referrals_updated",
    notesKey: "huddle_yesterday_all_referrals_updated_notes",
    label: "All referrals updated",
    description:
      "Confirm referrals were updated or note referral follow-up still needed.",
  },
  {
    checkKey: "huddle_yesterday_all_follow_ups_scheduled",
    notesKey: "huddle_yesterday_all_follow_ups_scheduled_notes",
    label: "All follow-ups scheduled",
    description:
      "Confirm follow-up visits or calls were scheduled or note what remains.",
  },
  {
    checkKey: "huddle_yesterday_all_balances_collected",
    notesKey: "huddle_yesterday_all_balances_collected_notes",
    label: "All balances collected",
    description:
      "Confirm balances were collected or note unresolved collection issues.",
  },
];

const huddleSignOffFields: FieldConfig[] = [
  {
    key: "huddle_all_issues_have_owners",
    label: "All Huddle Issues Have Owners",
    type: "select",
    description:
      "Mark Yes only if every issue discussed in the huddle has a clear owner.",
    options: ["Yes", "No"],
  },
  {
    key: "huddle_dr_akita_initials",
    label: "Dr. Akita Initials",
    type: "text",
    description:
      "Initials confirming huddle review or enforcement by Dr. Akita.",
  },
  {
    key: "huddle_signed_at",
    label: "Huddle Signed At",
    type: "datetime",
    description:
      "The date and time the huddle sheet was signed or confirmed.",
  },
];

const closeoutHeaderFields: FieldConfig[] = [
  {
    key: "closeout_completed",
    label: "Closeout Completed",
    type: "select",
    description:
      "Mark Yes only when the full end-of-day close checklist has been completed.",
    options: ["Yes", "No"],
  },
  {
    key: "closeout_start_time",
    label: "Closeout Start Time",
    type: "time",
    description: "The time the end-of-day closeout process started.",
  },
  {
    key: "closeout_end_time",
    label: "Closeout End Time",
    type: "time",
    description: "The time the end-of-day closeout process ended.",
  },
];

const providerCloseoutItems: ChecklistItem[] = [
  {
    checkKey: "closeout_provider_all_charts_closed",
    notesKey: "closeout_provider_all_charts_closed_notes",
    label: "All charts closed",
    description:
      "Confirm all provider charts are closed or note what remains open.",
  },
  {
    checkKey: "closeout_provider_documentation_complete",
    notesKey: "closeout_provider_documentation_complete_notes",
    label: "Documentation complete",
    description:
      "Confirm documentation is complete and ready for billing or follow-up.",
  },
  {
    checkKey: "closeout_provider_coding_clarified",
    notesKey: "closeout_provider_coding_clarified_notes",
    label: "Coding clarified",
    description:
      "Confirm coding questions were clarified or routed before the day is closed.",
  },
  {
    checkKey: "closeout_provider_orders_finalized",
    notesKey: "closeout_provider_orders_finalized_notes",
    label: "Orders finalized",
    description:
      "Confirm orders are finalized and unresolved order issues are noted.",
  },
];

const providerSignOffFields: FieldConfig[] = [
  {
    key: "closeout_provider_name",
    label: "Provider Name",
    type: "employee",
    description: "The provider signing off on provider closeout.",
  },
  {
    key: "closeout_provider_signed_time",
    label: "Provider Signed Time",
    type: "time",
    description: "The time provider closeout was signed or confirmed.",
  },
];

const frontDeskCloseoutItems: ChecklistItem[] = [
  {
    checkKey: "closeout_front_desk_payments_posted",
    notesKey: "closeout_front_desk_payments_posted_notes",
    label: "Payments posted",
    description:
      "Confirm payments were posted before the day was closed.",
  },
  {
    checkKey: "closeout_front_desk_follow_ups_scheduled",
    notesKey: "closeout_front_desk_follow_ups_scheduled_notes",
    label: "Follow-ups scheduled",
    description:
      "Confirm required patient follow-ups were scheduled.",
  },
  {
    checkKey: "closeout_front_desk_tomorrows_schedule_reviewed",
    notesKey: "closeout_front_desk_tomorrows_schedule_reviewed_notes",
    label: "Tomorrow’s schedule reviewed",
    description:
      "Confirm tomorrow’s schedule was reviewed for readiness, gaps, and blockers.",
  },
  {
    checkKey: "closeout_front_desk_intake_gaps_identified",
    notesKey: "closeout_front_desk_intake_gaps_identified_notes",
    label: "Intake gaps identified",
    description:
      "Confirm tomorrow’s missing intake items were identified.",
  },
  {
    checkKey: "closeout_front_desk_outstanding_balances_flagged",
    notesKey: "closeout_front_desk_outstanding_balances_flagged_notes",
    label: "Outstanding balances flagged",
    description:
      "Confirm outstanding balances were flagged for follow-up.",
  },
  {
    checkKey: "closeout_front_desk_daily_count_submitted",
    notesKey: "closeout_front_desk_daily_count_submitted_notes",
    label: "Daily count submitted",
    description:
      "Confirm the daily patient count or front-desk count was submitted.",
  },
];

const frontDeskSignOffFields: FieldConfig[] = [
  {
    key: "closeout_front_desk_daily_patient_count",
    label: "Daily Patient Count",
    type: "number",
    description:
      "The number of patients counted or submitted by the front desk.",
  },
  {
    key: "closeout_front_desk_name",
    label: "Front Desk Name",
    type: "employee",
    description: "The front desk team member signing off on closeout.",
  },
  {
    key: "closeout_front_desk_signed_time",
    label: "Front Desk Signed Time",
    type: "time",
    description: "The time front desk closeout was signed or confirmed.",
  },
];

const clinicalCloseoutItems: ChecklistItem[] = [
  {
    checkKey: "closeout_clinical_referrals_updated",
    notesKey: "closeout_clinical_referrals_updated_notes",
    label: "Referrals updated",
    description:
      "Confirm referrals were updated before the clinic was closed.",
  },
  {
    checkKey: "closeout_clinical_labs_tracked",
    notesKey: "closeout_clinical_labs_tracked_notes",
    label: "Labs tracked",
    description:
      "Confirm labs were tracked and any pending lab issues were noted.",
  },
  {
    checkKey: "closeout_clinical_patient_callbacks_completed",
    notesKey: "closeout_clinical_patient_callbacks_completed_notes",
    label: "Patient callbacks completed",
    description:
      "Confirm patient callbacks were completed or carried forward.",
  },
  {
    checkKey: "closeout_clinical_open_clinical_loops_identified",
    notesKey: "closeout_clinical_open_clinical_loops_identified_notes",
    label: "Open clinical loops identified",
    description:
      "Identify unresolved clinical items that need follow-up.",
  },
];

const clinicalSignOffFields: FieldConfig[] = [
  {
    key: "closeout_clinical_staff_name",
    label: "Clinical Staff Name",
    type: "employee",
    description: "The clinical staff member signing off on closeout.",
  },
  {
    key: "closeout_clinical_signed_time",
    label: "Clinical Signed Time",
    type: "time",
    description: "The time clinical closeout was signed or confirmed.",
  },
];

const tomorrowReadinessItems: ChecklistItem[] = [
  {
    checkKey: "closeout_tomorrow_schedule_reviewed",
    notesKey: "closeout_tomorrow_schedule_reviewed_notes",
    label: "Tomorrow’s schedule reviewed",
    description:
      "Confirm tomorrow’s schedule has been reviewed before clinic close.",
  },
  {
    checkKey: "closeout_tomorrow_staffing_coverage_confirmed",
    notesKey: "closeout_tomorrow_staffing_coverage_confirmed_notes",
    label: "Staffing coverage confirmed",
    description:
      "Confirm tomorrow’s staffing coverage and note gaps or backups.",
  },
  {
    checkKey: "closeout_tomorrow_high_risk_patients_identified",
    notesKey: "closeout_tomorrow_high_risk_patients_identified_notes",
    label: "High-risk patients identified",
    description:
      "Identify patients who need special attention tomorrow.",
  },
  {
    checkKey: "closeout_tomorrow_outstanding_blockers_identified",
    notesKey: "closeout_tomorrow_outstanding_blockers_identified_notes",
    label: "Outstanding blockers identified",
    description:
      "Identify unresolved blockers that could affect tomorrow’s operations.",
  },
];

const finalVerificationFields: FieldConfig[] = [
  {
    key: "final_verified_by",
    label: "Final Verified By",
    type: "employee",
    description:
      "The person who confirms the clinic is fully closed and verified.",
  },
  {
    key: "final_verified_at",
    label: "Final Verified At",
    type: "datetime",
    description:
      "The date and time final verification was completed.",
  },
  {
    key: "final_verification_notes",
    label: "Final Verification Notes",
    type: "textarea",
    description:
      "Final notes before the daily operations log is considered complete.",
  },
];

const allFields = [
  ...basicFields,
  ...openingHeaderFields,
  ...huddleHeaderFields,
  ...huddleTextFields,
  ...huddleSignOffFields,
  ...closeoutHeaderFields,
  ...providerSignOffFields,
  ...frontDeskSignOffFields,
  ...clinicalSignOffFields,
  ...finalVerificationFields,
];

const allChecklistItems = [
  ...communicationSweepItems,
  ...scheduleIntegrityItems,
  ...operationalReadinessItems,
  ...huddleAttendanceItems,
  ...yesterdayCloseReviewItems,
  ...providerCloseoutItems,
  ...frontDeskCloseoutItems,
  ...clinicalCloseoutItems,
  ...tomorrowReadinessItems,
];

export const dailyOperationsLogFieldKeys = [
  "id",
  "created_at",
  ...allFields.map((field) => field.key),
  ...allChecklistItems.flatMap((item) => [item.checkKey, item.notesKey]),
];

export function createDailyOperationsLogInitialForm(): FormState {
  const initial: FormState = {};

  allFields.forEach((field) => {
    if (field.key === "overall_status") {
      initial[field.key] = "In Progress";
      return;
    }

    initial[field.key] = "";
  });

  allChecklistItems.forEach((item) => {
    initial[item.checkKey] = "false";
    initial[item.notesKey] = "";
  });

  return initial;
}

function convertInitialDataToForm(initialData?: DailyOperationsLogData | null) {
  const form = createDailyOperationsLogInitialForm();

  if (!initialData) return form;

  Object.keys(form).forEach((key) => {
    const value = initialData[key];

    if (typeof value === "boolean") {
      form[key] = value ? "true" : "false";
      return;
    }

    if (value === null || value === undefined) {
      form[key] = "";
      return;
    }

    if (String(value).includes("T") && key.endsWith("_at")) {
      form[key] = String(value).slice(0, 16);
      return;
    }

    form[key] = String(value);
  });

  return form;
}

export function buildDailyOperationsPayload(form: FormState) {
  const payload: Record<string, string | number | boolean | null> = {};

  allFields.forEach((field) => {
    const value = form[field.key] || "";

    if (field.type === "employee" || field.type === "number") {
      payload[field.key] = value ? Number(value) : null;
      return;
    }

    if (field.type === "select" && field.options?.includes("Yes")) {
      payload[field.key] = value === "Yes" || value === "true";
      return;
    }

    payload[field.key] = value || null;
  });

  allChecklistItems.forEach((item) => {
    payload[item.checkKey] = form[item.checkKey] === "true";
    payload[item.notesKey] = form[item.notesKey] || null;
  });

  return payload;
}

export default function DailyOperationsLogForm({
  mode,
  initialData,
  submitLabel,
  cancelLabel = "Cancel",
  onCancel,
  onSaved,
}: DailyOperationsLogFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    convertInitialDataToForm(initialData)
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const completionCounts = useMemo(() => {
    const checkedItems = allChecklistItems.filter(
      (item) => form[item.checkKey] === "true"
    ).length;

    return {
      checkedItems,
      totalItems: allChecklistItems.length,
      percent:
        allChecklistItems.length === 0
          ? 0
          : Math.round((checkedItems / allChecklistItems.length) * 100),
    };
  }, [form]);

  useEffect(() => {
    setForm(convertInitialDataToForm(initialData));
  }, [initialData]);

  useEffect(() => {
    loadEmployees();
  }, []);

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

  function updateField(key: string, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleCheck(key: string, checked: boolean) {
    updateField(key, checked ? "true" : "false");
  }

  async function submitLog() {
    setMessage("");
    setErrorMessage("");

    if (!form.log_date) {
      setErrorMessage("Log Date is required.");
      return;
    }

    setSaving(true);

    const supabase = createClient();
    const payload = buildDailyOperationsPayload(form);

    const response =
      mode === "edit" && initialData?.id
        ? await supabase
            .from("daily_operations_logs")
            .update(payload)
            .eq("id", initialData.id)
        : await supabase.from("daily_operations_logs").insert(payload);

    setSaving(false);

    if (response.error) {
      setErrorMessage(response.error.message);
      return;
    }

    setMessage(mode === "edit" ? "Daily operations log updated." : "Daily operations log saved.");

    if (mode === "create") {
      setForm(createDailyOperationsLogInitialForm());
    }

    if (onSaved) {
      onSaved();
    }
  }

  function renderField(field: FieldConfig) {
    const value = form[field.key] || "";

    return (
      <label key={field.key} style={fieldStyle}>
        <span style={labelRowStyle}>
          {field.label}
          {field.required ? <strong style={requiredStyle}>*</strong> : null}
          <span title={field.description} style={infoIconStyle}>
            i
          </span>
        </span>

        <small style={helpTextStyle}>{field.description}</small>

        {field.type === "textarea" ? (
          <textarea
            value={value}
            onChange={(event) => updateField(field.key, event.target.value)}
            style={textareaStyle}
          />
        ) : null}

        {field.type === "select" ? (
          <select
            value={value}
            onChange={(event) => updateField(field.key, event.target.value)}
            style={inputStyle}
          >
            <option value="">Select {field.label}</option>
            {(field.options || []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : null}

        {field.type === "employee" ? (
          <select
            value={value}
            onChange={(event) => updateField(field.key, event.target.value)}
            style={inputStyle}
          >
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name || `Employee #${employee.id}`}
              </option>
            ))}
          </select>
        ) : null}

        {field.type === "date" ? (
          <input
            type="date"
            value={value}
            onChange={(event) => updateField(field.key, event.target.value)}
            style={inputStyle}
          />
        ) : null}

        {field.type === "time" ? (
          <input
            type="time"
            value={value}
            onChange={(event) => updateField(field.key, event.target.value)}
            style={inputStyle}
          />
        ) : null}

        {field.type === "datetime" ? (
          <input
            type="datetime-local"
            value={value}
            onChange={(event) => updateField(field.key, event.target.value)}
            style={inputStyle}
          />
        ) : null}

        {field.type === "number" ? (
          <input
            type="number"
            value={value}
            onChange={(event) => updateField(field.key, event.target.value)}
            style={inputStyle}
          />
        ) : null}

        {field.type === "text" ? (
          <input
            type="text"
            value={value}
            onChange={(event) => updateField(field.key, event.target.value)}
            style={inputStyle}
          />
        ) : null}
      </label>
    );
  }

  function renderFieldGrid(fields: FieldConfig[]) {
    return <div style={fieldGridStyle}>{fields.map(renderField)}</div>;
  }

  function renderChecklist(title: string, instruction: string, items: ChecklistItem[]) {
    return (
      <div style={checklistBoxStyle}>
        <div style={checklistHeaderStyle}>
          <h4 style={checklistTitleStyle}>{title}</h4>
          <p style={checklistInstructionStyle}>{instruction}</p>
        </div>

        <div style={checklistTableStyle}>
          <div style={checklistTableHeaderStyle}>Task</div>
          <div style={checklistTableHeaderStyle}>Done</div>
          <div style={checklistTableHeaderStyle}>Notes</div>

          {items.map((item) => (
            <div key={item.checkKey} style={checklistRowStyle}>
              <div style={taskCellStyle}>
                <strong>{item.label}</strong>
                <small style={helpTextStyle}>{item.description}</small>
              </div>

              <div style={centerStyle}>
                <input
                  type="checkbox"
                  checked={form[item.checkKey] === "true"}
                  onChange={(event) =>
                    toggleCheck(item.checkKey, event.target.checked)
                  }
                />
              </div>

              <textarea
                value={form[item.notesKey] || ""}
                onChange={(event) => updateField(item.notesKey, event.target.value)}
                placeholder="Notes, blockers, owner, or follow-up"
                style={smallTextareaStyle}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={formShellStyle}>
      <section style={progressGridStyle}>
        <div style={progressCardStyle}>
          <div style={summaryLabelStyle}>Checklist Completion</div>
          <div style={summaryValueStyle}>{completionCounts.percent}%</div>
          <p style={summaryDescriptionStyle}>
            {completionCounts.checkedItems} of {completionCounts.totalItems} checklist
            items marked done.
          </p>
        </div>

        <div style={progressCardStyle}>
          <div style={summaryLabelStyle}>Opening</div>
          <div style={summaryValueStyle}>
            {form.opening_time_submitted ? "Submitted" : "In Progress"}
          </div>
          <p style={summaryDescriptionStyle}>
            The opening checklist is not complete until it is signed and submitted.
          </p>
        </div>

        <div style={progressCardStyle}>
          <div style={summaryLabelStyle}>Huddle</div>
          <div style={summaryValueStyle}>
            {form.huddle_completed === "Yes" || form.huddle_completed === "true"
              ? "Completed"
              : "Pending"}
          </div>
          <p style={summaryDescriptionStyle}>
            Use this section for open issues, owners, action today, and yesterday’s close review.
          </p>
        </div>

        <div style={progressCardStyle}>
          <div style={summaryLabelStyle}>Closeout</div>
          <div style={summaryValueStyle}>
            {form.closeout_completed === "Yes" || form.closeout_completed === "true"
              ? "Completed"
              : "Pending"}
          </div>
          <p style={summaryDescriptionStyle}>
            The clinic is not considered closed until closeout is complete and verified.
          </p>
        </div>
      </section>

      {message ? <div style={successStyle}>{message}</div> : null}
      {errorMessage ? <div style={errorStyle}>{errorMessage}</div> : null}

      <section style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <div style={sectionEyebrowStyle}>START HERE</div>
            <h2 style={sectionTitleStyle}>Basic Log Info</h2>
          </div>
          <p style={sectionHelpStyle}>
            Complete this first so the record has the correct date, owner, and status.
          </p>
        </div>
        {renderFieldGrid(basicFields)}
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <div style={sectionEyebrowStyle}>PART 1</div>
            <h2 style={sectionTitleStyle}>Daily Opening Checklist</h2>
          </div>
          <p style={sectionHelpStyle}>
            Complete before the first patient. This confirms communication, schedule integrity, and readiness.
          </p>
        </div>

        {renderFieldGrid(openingHeaderFields)}

        {renderChecklist(
          "Section 1 — Communication Sweep",
          "Review all incoming communication channels and identify urgent follow-up.",
          communicationSweepItems
        )}

        {renderChecklist(
          "Section 2 — Schedule Integrity",
          "Review today’s schedule for gaps, risks, incomplete patients, and flow problems.",
          scheduleIntegrityItems
        )}

        {renderChecklist(
          "Section 3 — Operational Readiness",
          "Confirm rooms, supplies, staffing, referrals, billing, and clinical loops are ready.",
          operationalReadinessItems
        )}
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <div style={sectionEyebrowStyle}>PART 2</div>
            <h2 style={sectionTitleStyle}>Daily Huddle Sheet</h2>
          </div>
          <p style={sectionHelpStyle}>
            Use this during the standing daily huddle. Keep the meeting short, assign owners, and confirm action today.
          </p>
        </div>

        {renderFieldGrid(huddleHeaderFields)}

        {renderChecklist(
          "Huddle Attendance",
          "Confirm who was present for the daily huddle.",
          huddleAttendanceItems
        )}

        <div style={subsectionBoxStyle}>
          <h4 style={checklistTitleStyle}>Section 1 — Open Issues Review</h4>
          <p style={checklistInstructionStyle}>
            Capture issue, owner, days open, action today, and whether the issue was escalated.
          </p>
          {renderFieldGrid(huddleTextFields)}
        </div>

        {renderChecklist(
          "Section 2 — Yesterday’s Close Review",
          "Review whether yesterday’s closeout responsibilities were completed.",
          yesterdayCloseReviewItems
        )}

        {renderFieldGrid(huddleSignOffFields)}
      </section>

      <section style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <div style={sectionEyebrowStyle}>PART 3</div>
            <h2 style={sectionTitleStyle}>End-of-Day Close Checklist</h2>
          </div>
          <p style={sectionHelpStyle}>
            Complete before the clinic is considered closed. Verify provider, front desk, clinical, tomorrow readiness, and final verification.
          </p>
        </div>

        {renderFieldGrid(closeoutHeaderFields)}

        {renderChecklist(
          "Section 1 — Provider Closeout",
          "Confirm charts, documentation, coding, and orders are closed or carried forward.",
          providerCloseoutItems
        )}

        {renderFieldGrid(providerSignOffFields)}

        {renderChecklist(
          "Section 2 — Front Desk Closeout",
          "Confirm payments, follow-ups, tomorrow’s schedule, intake gaps, balances, and daily count.",
          frontDeskCloseoutItems
        )}

        {renderFieldGrid(frontDeskSignOffFields)}

        {renderChecklist(
          "Section 3 — Clinical Closeout",
          "Confirm referrals, labs, callbacks, and open clinical loops have been reviewed.",
          clinicalCloseoutItems
        )}

        {renderFieldGrid(clinicalSignOffFields)}

        {renderChecklist(
          "Section 4 — Tomorrow Readiness",
          "Confirm tomorrow’s schedule, staffing, high-risk patients, and blockers are reviewed.",
          tomorrowReadinessItems
        )}

        <div style={subsectionBoxStyle}>
          <h4 style={checklistTitleStyle}>Final Verification</h4>
          <p style={checklistInstructionStyle}>
            The clinic is not considered closed until this section is completed and verified.
          </p>
          {renderFieldGrid(finalVerificationFields)}
        </div>
      </section>

      <section style={submitBarStyle}>
        <button
          type="button"
          onClick={submitLog}
          disabled={saving}
          style={saveButtonStyle}
        >
          {saving ? "Saving..." : submitLabel || (mode === "edit" ? "Save Daily Operations Log" : "Create Daily Operations Log")}
        </button>

        {onCancel ? (
          <button type="button" onClick={onCancel} style={secondaryButtonStyle}>
            {cancelLabel}
          </button>
        ) : null}
      </section>
    </div>
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
};

const formShellStyle: CSSProperties = {
  display: "grid",
  gap: "18px",
};

const progressGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "14px",
};

const progressCardStyle: CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "18px",
};

const summaryLabelStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "10px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
};

const summaryValueStyle: CSSProperties = {
  marginTop: "8px",
  fontSize: "22px",
  fontWeight: 900,
};

const summaryDescriptionStyle: CSSProperties = {
  color: colors.slate,
  fontSize: "12px",
  lineHeight: 1.4,
};

const successStyle: CSSProperties = {
  background: "#ecfdf5",
  color: colors.green,
  border: "1px solid #bbf7d0",
  padding: "14px",
};

const errorStyle: CSSProperties = {
  background: "#fff1f2",
  color: colors.red,
  border: "1px solid #fecdd3",
  padding: "14px",
};

const sectionCardStyle: CSSProperties = {
  background: colors.white,
  border: `1px solid ${colors.border}`,
  padding: "22px",
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
  maxWidth: "480px",
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
  display: "block",
  color: colors.slate,
  fontSize: "12px",
  lineHeight: 1.4,
  fontWeight: 500,
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

const inputStyle: CSSProperties = {
  height: "42px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "0 10px",
  color: colors.navy,
  background: colors.white,
};

const textareaStyle: CSSProperties = {
  minHeight: "110px",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "10px",
  color: colors.navy,
  background: colors.white,
  fontFamily: "var(--font-dm-sans), Arial, sans-serif",
};

const checklistBoxStyle: CSSProperties = {
  border: `1px solid ${colors.border}`,
  background: colors.cream,
  marginBottom: "18px",
};

const subsectionBoxStyle: CSSProperties = {
  border: `1px solid ${colors.border}`,
  background: colors.cream,
  padding: "16px",
  marginBottom: "18px",
};

const checklistHeaderStyle: CSSProperties = {
  padding: "14px 16px",
  borderBottom: `1px solid ${colors.border}`,
};

const checklistTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "17px",
  fontWeight: 900,
};

const checklistInstructionStyle: CSSProperties = {
  margin: "6px 0 0",
  color: colors.slate,
  fontSize: "13px",
  lineHeight: 1.5,
};

const checklistTableStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.4fr 80px 1.4fr",
};

const checklistTableHeaderStyle: CSSProperties = {
  background: colors.navy,
  color: colors.white,
  padding: "10px",
  fontWeight: 900,
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const checklistRowStyle: CSSProperties = {
  display: "contents",
};

const taskCellStyle: CSSProperties = {
  padding: "10px",
  background: colors.white,
  borderBottom: `1px solid ${colors.border}`,
};

const centerStyle: CSSProperties = {
  display: "grid",
  placeItems: "center",
  borderBottom: `1px solid ${colors.border}`,
  padding: "10px",
  background: colors.white,
};

const smallTextareaStyle: CSSProperties = {
  minHeight: "74px",
  border: "none",
  borderBottom: `1px solid ${colors.border}`,
  padding: "10px",
  resize: "vertical",
  fontFamily: "var(--font-dm-sans), Arial, sans-serif",
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

const secondaryButtonStyle: CSSProperties = {
  background: colors.goldPale,
  color: colors.navy,
  border: "none",
  borderRadius: "8px",
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
};