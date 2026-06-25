const fs = require("fs");

const path = "app/form-links/page.tsx";

fs.mkdirSync("app/form-links", { recursive: true });

fs.writeFileSync(
  path,
  `"use client";

import { useMemo, useState } from "react";

const forms = [
  {
    name: "Daily Receptionist Tracker",
    description: "Use this link for receptionist daily submissions.",
    path: "/daily-receptionist-tracker",
  },
  {
    name: "Daily Physician Tracker",
    description: "Use this link for physician daily submissions.",
    path: "/daily-physician-tracker",
  },
  {
    name: "Weekly Financial Report",
    description: "Use this link for weekly financial report submissions.",
    path: "/weekly-financial-report",
  },
  {
    name: "Membership Tracker",
    description: "Use this link for membership submissions.",
    path: "/membership-tracker",
  },
  {
    name: "Tasks",
    description: "Use this link to submit a task.",
    path: "/tasks",
  },
  {
    name: "Deliverables",
    description: "Use this link to submit a deliverable.",
    path: "/deliverables",
  },
  {
    name: "Issues / Breakdowns",
    description: "Use this link to submit an issue or breakdown.",
    path: "/issues-breakdowns",
  },
  {
    name: "AR Report Submissions",
    description: "Use this link for AR report submissions.",
    path: "/ar-report-submissions",
  },
  {
    name: "Charge Lag",
    description: "Use this link for charge lag submissions.",
    path: "/charge-lag",
  },
  {
    name: "Daily Billing Claims",
    description: "Use this link for daily billing claims submissions.",
    path: "/daily-billing-claims",
  },
  {
    name: "Daily Operations Logs",
    description: "Use this link for daily operations log submissions.",
    path: "/daily-operations-logs",
  },
  {
    name: "Weekly Claims Summary",
    description: "Use this link for weekly claims summary submissions.",
    path: "/weekly-claims-summary",
  },
];

const colors = {
  navy: "#1C2333",
  gold: "#C9A84C",
  cream: "#F8F5EE",
  white: "#FFFFFF",
  border: "rgba(28,35,51,0.14)",
};

export default function FormLinksPage() {
  const [copied, setCopied] = useState("");

  const origin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  async function copyLink(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    window.setTimeout(() => setCopied(""), 1800);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: colors.cream,
        padding: "40px",
        color: colors.navy,
        fontFamily: "DM Sans, Arial, sans-serif",
      }}
    >
      <section style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <a
          href="/"
          style={{
            color: colors.navy,
            fontWeight: 900,
            textDecoration: "none",
          }}
        >
          ← Back to app
        </a>

        <p
          style={{
            margin: "28px 0 8px",
            color: colors.gold,
            fontWeight: 900,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontSize: "12px",
          }}
        >
          Practice Founder
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: "54px",
            lineHeight: 1,
            fontFamily: "Playfair Display, Georgia, serif",
          }}
        >
          Public Form Links
        </h1>

        <p style={{ maxWidth: "760px", lineHeight: 1.7, marginTop: "14px" }}>
          Copy and share these links with staff when you want them to submit a form
          without opening the full app. Manager pages remain private.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
            marginTop: "28px",
          }}
        >
          {forms.map((form) => {
            const url = \`\${origin}\${form.path}\`;

            return (
              <article
                key={form.path}
                style={{
                  background: colors.white,
                  border: \`1px solid \${colors.border}\`,
                  padding: "20px",
                  boxShadow: "0 12px 32px rgba(28,35,51,0.08)",
                }}
              >
                <h2 style={{ margin: "0 0 8px", fontSize: "20px" }}>
                  {form.name}
                </h2>

                <p style={{ margin: "0 0 14px", lineHeight: 1.55 }}>
                  {form.description}
                </p>

                <input
                  readOnly
                  value={url}
                  style={{
                    width: "100%",
                    border: \`1px solid \${colors.border}\`,
                    padding: "11px",
                    marginBottom: "12px",
                    fontSize: "13px",
                  }}
                />

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => copyLink(url)}
                    style={{
                      border: "none",
                      background: colors.navy,
                      color: colors.white,
                      padding: "10px 13px",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    {copied === url ? "Copied" : "Copy Link"}
                  </button>

                  <a
                    href={form.path}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      border: \`1px solid \${colors.border}\`,
                      color: colors.navy,
                      padding: "10px 13px",
                      fontWeight: 900,
                      textDecoration: "none",
                    }}
                  >
                    Open
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
`
);

console.log("Form Links page created at /form-links.");