"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { createClient } from "../../lib/supabase/client";

type CalendarEmbed = {
  id: number;
  embed_key: string;
  embed_name: string;
  embed_type: string;
  embed_url: string | null;
  embed_html: string | null;
  is_active: boolean;
  display_order: number | null;
  notes: string | null;
};

type FormState = {
  id: number | null;
  embed_name: string;
  embed_key: string;
  embed_input: string;
  display_order: string;
  notes: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  id: null,
  embed_name: "",
  embed_key: "",
  embed_input: "",
  display_order: "0",
  notes: "",
  is_active: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function extractGoogleCalendarUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return "";

  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const possibleUrl = iframeSrcMatch ? iframeSrcMatch[1] : trimmed;

  if (!possibleUrl.startsWith("https://calendar.google.com/calendar/embed")) {
    return "";
  }

  return possibleUrl.replaceAll("&amp;", "&");
}

export default function CalendarSettingsPage() {
  const [calendars, setCalendars] = useState<CalendarEmbed[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const extractedUrl = useMemo(
    () => extractGoogleCalendarUrl(form.embed_input),
    [form.embed_input]
  );

  async function loadCalendars() {
    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("app_embeds")
      .select("*")
      .eq("embed_type", "google_calendar")
      .order("display_order", { ascending: true })
      .order("embed_name", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setCalendars(data || []);
  }

  useEffect(() => {
    loadCalendars();
  }, []);

  function updateForm(field: keyof FormState, value: string | boolean | number | null) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startEdit(calendar: CalendarEmbed) {
    setForm({
      id: calendar.id,
      embed_name: calendar.embed_name || "",
      embed_key: calendar.embed_key || "",
      embed_input: calendar.embed_html || calendar.embed_url || "",
      display_order: String(calendar.display_order || 0),
      notes: calendar.notes || "",
      is_active: Boolean(calendar.is_active),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(emptyForm);
    setMessage("");
    setErrorMessage("");
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    const safeUrl = extractGoogleCalendarUrl(form.embed_input);

    if (!form.embed_name.trim()) {
      setErrorMessage("Calendar name is required.");
      return;
    }

    if (!safeUrl) {
      setErrorMessage("Please paste a valid Google Calendar embed link or iframe code.");
      return;
    }

    const finalEmbedKey = form.embed_key.trim() || slugify(form.embed_name);

    if (!finalEmbedKey) {
      setErrorMessage("Calendar key could not be created. Please use a clearer calendar name.");
      return;
    }

    const supabase = createClient();

    const payload = {
      embed_key: finalEmbedKey,
      embed_name: form.embed_name.trim(),
      embed_type: "google_calendar",
      embed_url: safeUrl,
      embed_html: form.embed_input.trim(),
      is_active: form.is_active,
      display_order: Number(form.display_order || 0),
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = form.id
      ? await supabase.from("app_embeds").update(payload).eq("id", form.id)
      : await supabase.from("app_embeds").insert(payload);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(form.id ? "Calendar updated." : "Calendar added.");
    setForm(emptyForm);
    await loadCalendars();
  }

  return (
    <main style={pageStyle}>
      <section style={headerStyle}>
        <div>
          <a href="/schedule" style={backLinkStyle}>
            ← Back to Schedule
          </a>

          <div style={eyebrowStyle}>PRACTICE FOUNDER · SCHEDULE</div>

          <h1 style={titleStyle}>Calendar Settings</h1>

          <p style={descriptionStyle}>
            Add and manage the Google Calendars that appear as clickable blocks on the Schedule page.
          </p>
        </div>

        <a href="/schedule" style={secondaryButtonStyle}>
          Open Schedule
        </a>
      </section>

      {message ? <div style={successBoxStyle}>{message}</div> : null}
      {errorMessage ? <div style={errorBoxStyle}>{errorMessage}</div> : null}

      <form onSubmit={handleSave} style={formShellStyle}>
        <section style={formSectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={sectionEyebrowStyle}>
              {form.id ? "EDIT CALENDAR" : "ADD CALENDAR"}
            </div>

            <h2 style={sectionTitleStyle}>
              {form.id ? "Update Calendar Block" : "Create Calendar Block"}
            </h2>

            <p style={sectionDescriptionStyle}>
              Name the calendar, paste the Google Calendar embed code, and choose whether it should show on the Schedule page.
            </p>
          </div>

          <div style={formGridStyle}>
            <label style={labelStyle} title="This is the name that appears on the Schedule calendar card.">
              Calendar Name
              <input
                value={form.embed_name}
                onChange={(event) => {
                  updateForm("embed_name", event.target.value);
                  if (!form.id) {
                    updateForm("embed_key", slugify(event.target.value));
                  }
                }}
                style={inputStyle}
                placeholder="Example: Team Schedule"
                title="This is the name that appears on the Schedule calendar card."
              />
            </label>

            <label style={labelStyle} title="This controls the display order on the Schedule page. Lower numbers show first.">
              Display Order
              <input
                type="number"
                value={form.display_order}
                onChange={(event) => updateForm("display_order", event.target.value)}
                style={inputStyle}
                title="This controls the display order on the Schedule page. Lower numbers show first."
              />
            </label>

            <label style={wideLabelStyle} title="Paste the full Google Calendar iframe code or just the embed link.">
              Google Calendar Embed Code or Link
              <textarea
                value={form.embed_input}
                onChange={(event) => updateForm("embed_input", event.target.value)}
                style={textareaStyle}
                placeholder={'<iframe src="https://calendar.google.com/calendar/embed?src=..." ...></iframe>'}
                title="Paste the full Google Calendar iframe code or just the embed link."
              />
            </label>

            <label style={wideLabelStyle} title="Optional note that appears on the Schedule card.">
              Notes
              <textarea
                value={form.notes}
                onChange={(event) => updateForm("notes", event.target.value)}
                style={smallTextareaStyle}
                placeholder="Example: Main calendar for approved PTO, coverage, and weekly schedule planning."
                title="Optional note that appears on the Schedule card."
              />
            </label>

            <label style={checkboxLabelStyle} title="When active, this calendar appears on the Schedule page.">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => updateForm("is_active", event.target.checked)}
              />
              Active calendar block
            </label>
          </div>
        </section>

        <section style={previewSectionStyle}>
          <div style={sectionHeaderStyle}>
            <div style={sectionEyebrowStyle}>PREVIEW CHECK</div>
            <h2 style={sectionTitleStyle}>Detected Calendar Link</h2>
            <p style={sectionDescriptionStyle}>
              This is the safe calendar link the app will store and display.
            </p>
          </div>

          <div style={detectedUrlStyle}>
            {extractedUrl || "No valid Google Calendar embed link detected yet."}
          </div>
        </section>

        <div style={buttonRowStyle}>
          <button type="button" onClick={resetForm} style={secondaryButtonStyle}>
            Clear Form
          </button>

          <a href="/schedule" style={secondaryLinkButtonStyle}>
            Cancel
          </a>

          <button type="submit" style={primaryButtonStyle}>
            {form.id ? "Save Calendar" : "Add Calendar"}
          </button>
        </div>
      </form>

      <section style={managerSectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={sectionEyebrowStyle}>SAVED CALENDARS</div>
          <h2 style={sectionTitleStyle}>Calendar Blocks</h2>
          <p style={sectionDescriptionStyle}>
            These are the calendars available from the Schedule page.
          </p>
        </div>

        <div style={savedGridStyle}>
          {calendars.map((calendar) => (
            <article key={calendar.id} style={savedCardStyle}>
              <div>
                <h3 style={savedTitleStyle}>{calendar.embed_name}</h3>
                <p style={savedDescriptionStyle}>
                  {calendar.notes || "No notes added."}
                </p>
              </div>

              <div style={savedMetaStyle}>
                {calendar.is_active ? "Active" : "Inactive"} · Order {calendar.display_order || 0}
              </div>

              <button type="button" onClick={() => startEdit(calendar)} style={secondaryButtonStyle}>
                Edit
              </button>
            </article>
          ))}

          {calendars.length === 0 ? (
            <div style={emptySavedStyle}>No calendars saved yet.</div>
          ) : null}
        </div>
      </section>
    </main>
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
  green: "#166534",
  red: "#9F1239",
};

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: colors.cream,
  color: colors.navy,
  padding: "34px",
  fontFamily: "DM Sans, Arial, sans-serif",
};

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "24px",
  alignItems: "flex-start",
  marginBottom: "24px",
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
  fontFamily: "DM Mono, monospace",
  fontSize: "11px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  fontWeight: 900,
};

const titleStyle: CSSProperties = {
  margin: "8px 0 0",
  fontFamily: "Playfair Display, Georgia, serif",
  fontSize: "42px",
  fontWeight: 600,
};

const descriptionStyle: CSSProperties = {
  color: colors.slate,
  fontSize: "16px",
  maxWidth: "780px",
  lineHeight: 1.6,
};

const formShellStyle: CSSProperties = {
  display: "grid",
  gap: "16px",
  maxWidth: "1040px",
};

const formSectionStyle: CSSProperties = {
  background: colors.white,
  border: "1px solid " + colors.border,
  padding: "18px",
  display: "grid",
  gap: "16px",
};

const previewSectionStyle: CSSProperties = {
  ...formSectionStyle,
  background: colors.goldPale,
};

const sectionHeaderStyle: CSSProperties = {
  display: "grid",
  gap: "4px",
};

const sectionEyebrowStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "DM Mono, monospace",
  fontSize: "10px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  fontWeight: 900,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  color: colors.navy,
  fontSize: "22px",
};

const sectionDescriptionStyle: CSSProperties = {
  margin: 0,
  color: colors.slate,
  fontSize: "13px",
  lineHeight: 1.45,
  fontWeight: 600,
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "14px",
};

const labelStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
  background: colors.cream,
  border: "1px solid " + colors.border,
  padding: "14px",
  fontWeight: 900,
};

const wideLabelStyle: CSSProperties = {
  ...labelStyle,
  gridColumn: "1 / -1",
};

const inputStyle: CSSProperties = {
  height: "42px",
  border: "1px solid " + colors.border,
  borderRadius: "8px",
  padding: "0 10px",
  color: colors.navy,
  background: colors.white,
};

const textareaStyle: CSSProperties = {
  minHeight: "150px",
  border: "1px solid " + colors.border,
  borderRadius: "8px",
  padding: "10px",
  color: colors.navy,
  background: colors.white,
  fontFamily: "DM Mono, monospace",
  fontSize: "13px",
};

const smallTextareaStyle: CSSProperties = {
  ...textareaStyle,
  minHeight: "90px",
  fontFamily: "DM Sans, Arial, sans-serif",
};

const checkboxLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  color: colors.navy,
  fontWeight: 900,
};

const detectedUrlStyle: CSSProperties = {
  background: colors.white,
  border: "1px solid " + colors.border,
  padding: "12px",
  fontFamily: "DM Mono, monospace",
  fontSize: "12px",
  overflowWrap: "anywhere",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  flexWrap: "wrap",
};

const secondaryButtonStyle: CSSProperties = {
  background: colors.goldPale,
  color: colors.navy,
  border: "none",
  borderRadius: "8px",
  padding: "12px 16px",
  fontWeight: 900,
  cursor: "pointer",
};

const secondaryLinkButtonStyle: CSSProperties = {
  ...secondaryButtonStyle,
  textDecoration: "none",
};

const primaryButtonStyle: CSSProperties = {
  background: colors.gold,
  color: colors.navy,
  border: "none",
  borderRadius: "8px",
  padding: "12px 18px",
  fontWeight: 900,
  cursor: "pointer",
  textDecoration: "none",
};

const successBoxStyle: CSSProperties = {
  background: "#ecfdf5",
  color: colors.green,
  border: "1px solid #bbf7d0",
  padding: "14px",
  marginBottom: "16px",
  fontWeight: 800,
};

const errorBoxStyle: CSSProperties = {
  background: "#fff1f2",
  color: colors.red,
  border: "1px solid #fecdd3",
  padding: "14px",
  marginBottom: "16px",
  fontWeight: 800,
};

const managerSectionStyle: CSSProperties = {
  marginTop: "26px",
  display: "grid",
  gap: "14px",
};

const savedGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "14px",
};

const savedCardStyle: CSSProperties = {
  background: colors.white,
  border: "1px solid " + colors.border,
  padding: "16px",
  display: "grid",
  gap: "12px",
};

const savedTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "20px",
  color: colors.navy,
};

const savedDescriptionStyle: CSSProperties = {
  margin: "6px 0 0",
  color: colors.slate,
  lineHeight: 1.45,
};

const savedMetaStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "DM Mono, monospace",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  fontWeight: 900,
};

const emptySavedStyle: CSSProperties = {
  background: colors.white,
  border: "1px solid " + colors.border,
  padding: "18px",
  color: colors.slate,
  fontWeight: 700,
};
