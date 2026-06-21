"use client";

import MasterManager from "../../components/MasterManager";
import type { MasterManagerConfig } from "../../components/MasterManager";

const dailyReceptionistTrackerConfig: MasterManagerConfig = {
  title: "Daily Receptionist Tracker Manager",
  eyebrow: "PRACTICE FOUNDER · DAILY TRACKER",
  description:
    "Manage daily receptionist submissions, visit counts, service activity, collections, referrals, no-shows, reschedules, and front desk notes.",
  tableName: "daily_receptionist_tracker",
  primaryKey: "id",
  backPath: "/?table=daily_receptionist_tracker",
  addButtonLabel: "+ Add Daily Receptionist Tracker",
  addPath: "/daily-receptionist-tracker",
  defaultSortField: "tracker_date",
  fields: [
    {
      key: "tracker_date",
      label: "Tracker Date",
      type: "date",
      required: true,
    },
    {
      key: "submitted_by",
      label: "Submitted By",
      type: "employee",
    },

    {
      key: "annual_wellness_visits",
      label: "Annual Wellness Visits",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "comprehensive_physical_exam",
      label: "Comprehensive Physical Exam",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "new_cpe",
      label: "New Comprehensive Physical Exam",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "well_woman_check",
      label: "Well Woman Check",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "well_woman_exam",
      label: "Well Woman Exam",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "immigration_physical",
      label: "Immigration Physical",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "new_patient_evaluation",
      label: "New Patient Evaluation",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "follow_up_visits",
      label: "Follow-Up Visits",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "six_visits",
      label: "Sick Visits",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "nurse_visits",
      label: "Nurse Visits",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "chronic_care_management",
      label: "Chronic Care Management",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "telehealth_telemedicine",
      label: "Telehealth / Telemedicine",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "wellness_evaluation",
      label: "Wellness Evaluation",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "wellness_follow_up",
      label: "Wellness Follow-Up",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "wellness_shots",
      label: "Wellness Shots",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "iv_therapy",
      label: "IV Therapy",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "pellet_insertion",
      label: "Pellet Insertion",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "joint_injection",
      label: "Joint Injection",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "home_mobile_visits",
      label: "Home / Mobile Visits",
      type: "number",
      defaultValue: "0",
    },

    {
      key: "same_day_add_ons",
      label: "Same-Day Add-Ons",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "no_shows",
      label: "No-Shows",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "reschedules",
      label: "Reschedules",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "non_billable_phone_calls",
      label: "Non-Billable Phone Calls",
      type: "number",
      defaultValue: "0",
    },
    {
      key: "referrals",
      label: "Referrals",
      type: "number",
      defaultValue: "0",
    },

    {
      key: "cash_collected",
      label: "Cash Collected",
      type: "currency",
      defaultValue: "0",
    },
    {
      key: "credit_card_collected",
      label: "Credit Card Collected",
      type: "currency",
      defaultValue: "0",
    },
    {
      key: "check_collected",
      label: "Check Collected",
      type: "currency",
      defaultValue: "0",
    },
    {
      key: "total_collections",
      label: "Total Collections",
      type: "currency",
      defaultValue: "0",
    },

    {
      key: "collection_rate",
      label: "Collection Rate",
      type: "number",
      showInAddForm: false,
      showInEditForm: false,
    },
    {
      key: "referral_completion_rate",
      label: "Referral Completion Rate",
      type: "number",
      showInAddForm: false,
      showInEditForm: false,
    },

    {
      key: "notes",
      label: "Notes",
      type: "textarea",
    },
  ],
  defaultVisibleFields: [
    "tracker_date",
    "submitted_by",
    "annual_wellness_visits",
    "comprehensive_physical_exam",
    "new_patient_evaluation",
    "follow_up_visits",
    "six_visits",
    "same_day_add_ons",
    "no_shows",
    "reschedules",
    "referrals",
    "total_collections",
  ],
};

export default function DailyReceptionistTrackerListPage() {
  return <MasterManager config={dailyReceptionistTrackerConfig} />;
}