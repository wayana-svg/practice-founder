const fs = require("fs");

function ensureDir(path) {
  fs.mkdirSync(path, { recursive: true });
}

function writeFile(path, content) {
  fs.writeFileSync(path, content);
  console.log("Wrote:", path);
}

ensureDir("app/schedule");
ensureDir("app/calendar-settings");
ensureDir("app/schedule-calendar");

writeFile(
  "app/schedule/page.tsx",
  `"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function SchedulePage() {
  const [calendars, setCalendars] = useState<CalendarEmbed[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarEmbed | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadCalendars() {
    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("app_embeds")
      .select("*")
      .eq("embed_type", "google_calendar")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("embed_name", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setCalendars(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadCalendars();
  }, []);

  const activeCalendars = useMemo(() => {
    return calendars.filter((calendar) =>
      Boolean(
        calendar.embed_url &&
          calendar.embed_url.startsWith("https://calendar.google.com/calendar/embed")
      )
    );
  }, [calendars]);

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <a href="/?table=schedule_calendar" style={backLinkStyle}>
            ← Back to Business HQ
          </a>

          <div style={eyebrowStyle}>PRACTICE FOUNDER · BUSINESS HQ</div>

          <h1 style={titleStyle}>Schedule</h1>

          <p style={descriptionStyle}>
            View team calendars, time-off calendars, provider schedules, coverage calendars,
            and other shared scheduling views in one place.
          </p>
        </div>

        <div style={heroActionsStyle}>
          <a href="/calendar-settings" style={primaryButtonStyle}>
            + Add Calendar
          </a>

          <a href="/calendar-settings" style={secondaryButtonStyle}>
            Manage Calendars
          </a>
        </div>
      </section>

      {errorMessage ? <div style={errorBoxStyle}>{errorMessage}</div> : null}

      {loading ? <div style={infoBoxStyle}>Loading calendars...</div> : null}

      {!loading && activeCalendars.length === 0 ? (
        <section style={emptyStateStyle}>
          <div style={emptyEyebrowStyle}>NO CALENDARS YET</div>
          <h2 style={emptyTitleStyle}>Add your first schedule calendar</h2>
          <p style={emptyDescriptionStyle}>
            Paste a Google Calendar embed code in Calendar Settings. After saving,
            the calendar will appear here as a clickable block.
          </p>

          <a href="/calendar-settings" style={primaryButtonStyle}>
            Open Calendar Settings
          </a>
        </section>
      ) : null}

      {!loading && activeCalendars.length > 0 ? (
        <section style={calendarGridStyle}>
          {activeCalendars.map((calendar) => (
            <button
              key={calendar.id}
              type="button"
              onClick={() => setSelectedCalendar(calendar)}
              style={calendarCardStyle}
              title="Click to open this calendar."
            >
              <div style={cardTopRowStyle}>
                <div style={cardIconStyle}>📅</div>
                <div style={cardStatusStyle}>Active</div>
              </div>

              <h2 style={cardTitleStyle}>{calendar.embed_name}</h2>

              <p style={cardDescriptionStyle}>
                {calendar.notes ||
                  "Click to preview this Google Calendar inside Practice Founder."}
              </p>

              <div style={cardFooterStyle}>Open Calendar →</div>
            </button>
          ))}
        </section>
      ) : null}

      {selectedCalendar ? (
        <div style={modalOverlayStyle}>
          <section style={modalStyle}>
            <header style={modalHeaderStyle}>
              <div>
                <div style={eyebrowStyle}>SCHEDULE PREVIEW</div>
                <h2 style={modalTitleStyle}>{selectedCalendar.embed_name}</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCalendar(null)}
                style={closeButtonStyle}
              >
                Close
              </button>
            </header>

            <iframe
              src={selectedCalendar.embed_url || ""}
              title={selectedCalendar.embed_name}
              style={calendarFrameStyle}
              frameBorder="0"
              scrolling="no"
            />
          </section>
        </div>
      ) : null}
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
  red: "#9F1239",
};

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: colors.cream,
  color: colors.navy,
  padding: "34px",
  fontFamily: "DM Sans, Arial, sans-serif",
};

const heroStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "24px",
  alignItems: "flex-start",
  marginBottom: "26px",
};

const heroActionsStyle: CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
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
  fontSize: "48px",
  fontWeight: 600,
};

const descriptionStyle: CSSProperties = {
  color: colors.slate,
  fontSize: "16px",
  maxWidth: "820px",
  lineHeight: 1.6,
};

const primaryButtonStyle: CSSProperties = {
  background: colors.gold,
  color: colors.navy,
  textDecoration: "none",
  borderRadius: "10px",
  padding: "12px 16px",
  fontWeight: 900,
  border: "none",
  cursor: "pointer",
};

const secondaryButtonStyle: CSSProperties = {
  background: colors.goldPale,
  color: colors.navy,
  textDecoration: "none",
  borderRadius: "10px",
  padding: "12px 16px",
  fontWeight: 900,
};

const calendarGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "16px",
};

const calendarCardStyle: CSSProperties = {
  background: colors.white,
  border: "1px solid " + colors.border,
  padding: "18px",
  minHeight: "210px",
  textAlign: "left",
  cursor: "pointer",
  color: colors.navy,
  display: "grid",
  gap: "12px",
  alignContent: "space-between",
  boxShadow: "0 18px 40px rgba(28,35,51,0.08)",
};

const cardTopRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const cardIconStyle: CSSProperties = {
  width: "42px",
  height: "42px",
  borderRadius: "999px",
  background: colors.goldPale,
  display: "grid",
  placeItems: "center",
  fontSize: "20px",
};

const cardStatusStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "DM Mono, monospace",
  fontSize: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontWeight: 900,
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "24px",
  fontFamily: "Playfair Display, Georgia, serif",
};

const cardDescriptionStyle: CSSProperties = {
  margin: 0,
  color: colors.slate,
  lineHeight: 1.5,
  fontSize: "14px",
};

const cardFooterStyle: CSSProperties = {
  color: colors.navy,
  fontWeight: 900,
};

const modalOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(28,35,51,0.72)",
  padding: "28px",
  display: "grid",
  placeItems: "center",
  zIndex: 50,
};

const modalStyle: CSSProperties = {
  width: "min(1180px, 96vw)",
  height: "min(860px, 92vh)",
  background: colors.white,
  border: "1px solid " + colors.border,
  display: "grid",
  gridTemplateRows: "auto 1fr",
  boxShadow: "0 30px 80px rgba(0,0,0,0.3)",
};

const modalHeaderStyle: CSSProperties = {
  padding: "18px",
  borderBottom: "1px solid " + colors.border,
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "center",
};

const modalTitleStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: "26px",
};

const closeButtonStyle: CSSProperties = {
  background: colors.goldPale,
  color: colors.navy,
  border: "none",
  borderRadius: "8px",
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

const calendarFrameStyle: CSSProperties = {
  border: 0,
  width: "100%",
  height: "100%",
};

const emptyStateStyle: CSSProperties = {
  background: colors.white,
  border: "1px solid " + colors.border,
  padding: "28px",
  maxWidth: "760px",
  display: "grid",
  gap: "12px",
};

const emptyEyebrowStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "DM Mono, monospace",
  fontSize: "10px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  fontWeight: 900,
};

const emptyTitleStyle: CSSProperties = {
  margin: 0,
  color: colors.navy,
  fontSize: "24px",
};

const emptyDescriptionStyle: CSSProperties = {
  margin: 0,
  color: colors.slate,
  lineHeight: 1.5,
};

const infoBoxStyle: CSSProperties = {
  background: colors.goldPale,
  border: "1px solid " + colors.gold,
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
`
);

writeFile(
  "app/calendar-settings/page.tsx",
  `"use client";

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
`
);

writeFile(
  "app/schedule-calendar/page.tsx",
  `import { redirect } from "next/navigation";

export default function ScheduleCalendarRedirectPage() {
  redirect("/schedule");
}
`
);

const homepagePath = "app/page.tsx";

if (fs.existsSync(homepagePath)) {
  let text = fs.readFileSync(homepagePath, "utf8");

  const scheduleBlock = `{
        key: "schedule_calendar",
        label: "Schedule",
        description:
          "Open the Schedule dashboard to view and manage shared Google Calendar blocks.",
        tableName: "app_embeds",
        managerPath: "/schedule",
        addPath: "/calendar-settings",
        columns: [
          {
            key: "embed_name",
            label: "Calendar",
            type: "text",
          },
          {
            key: "embed_type",
            label: "Type",
            type: "text",
          },
          {
            key: "is_active",
            label: "Active",
            type: "boolean",
          },
        ],
        defaultColumns: ["embed_name", "embed_type", "is_active"],
      }`;

  if (text.includes('key: "schedule_calendar"')) {
    const keyIndex = text.indexOf('key: "schedule_calendar"');
    let start = text.lastIndexOf("{", keyIndex);
    let depth = 0;
    let end = -1;

    for (let i = start; i < text.length; i++) {
      if (text[i] === "{") depth += 1;
      if (text[i] === "}") depth -= 1;

      if (depth === 0) {
        end = i + 1;
        break;
      }
    }

    if (start !== -1 && end !== -1) {
      text = text.slice(0, start) + scheduleBlock + text.slice(end);
      console.log("Updated existing Schedule homepage block.");
    }
  } else {
    const businessHqIndex = text.indexOf('title: "Business HQ"');
    const tablesIndex = text.indexOf("tables: [", businessHqIndex);
    const insertPoint = text.indexOf("[", tablesIndex) + 1;

    if (businessHqIndex !== -1 && tablesIndex !== -1 && insertPoint !== -1) {
      text = text.slice(0, insertPoint) + "\\n      " + scheduleBlock + "," + text.slice(insertPoint);
      console.log("Inserted Schedule homepage block under Business HQ.");
    } else {
      console.log("Could not find Business HQ tables array.");
    }
  }

  fs.writeFileSync(homepagePath, text);
} else {
  console.log("Could not find app/page.tsx");
}

console.log("Schedule interface upgrade complete.");