"use client";

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
