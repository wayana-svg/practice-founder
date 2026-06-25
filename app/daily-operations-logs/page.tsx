"use client";

import type { CSSProperties } from "react";
import DailyOperationsLogForm from "../../components/DailyOperationsLogForm";

export default function DailyOperationsLogsPage() {
  return (
    <main style={pageStyle}>
      <section style={headerStyle}>
        <div>
          <a href="/?table=daily_operations_logs" style={backLinkStyle}>
            ← Back to Daily Operations Logs
          </a>

          <div style={eyebrowStyle}>PRACTICE FOUNDER · DAILY OPERATIONS</div>
          <h1 style={titleStyle}>Add Daily Operations Log</h1>
          <p style={descriptionStyle}>
            Use this as a working packet throughout the day. Complete the opening
            checklist before the first patient, use the huddle section during the
            standing meeting, and finish the closeout before the clinic is considered
            closed.
          </p>
        </div>

        <a href="/" style={managerLinkStyle}>
          Open Manager
        </a>
      </section>

      <DailyOperationsLogForm
        mode="create"
        submitLabel="Save Daily Operations Log"
        cancelLabel="Cancel"
        onCancel={() => {
          window.location.href = "/?table=daily_operations_logs";
        }}
      />
    </main>
  );
}

const colors = {
  navy: "#1C2333",
  gold: "#C9A84C",
  cream: "#F8F5EE",
  slate: "#5F6673",
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