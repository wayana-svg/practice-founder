import Link from "next/link";

export default function WeeklyFinancialReportsHomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F8F5EE",
        padding: "36px",
        color: "#1C2333",
        fontFamily: "DM Sans, Arial, sans-serif",
      }}
    >
      <Link
        href="/"
        style={{
          color: "#1C2333",
          textDecoration: "none",
          fontWeight: 700,
          fontSize: "18px",
        }}
      >
        ← Back
      </Link>

      <section
        style={{
          marginTop: "34px",
          border: "1px solid rgba(201, 168, 76, 0.35)",
          background: "#FFFFFF",
          padding: "34px",
          boxShadow: "0 18px 40px rgba(28, 35, 51, 0.08)",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#C9A84C",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontSize: "13px",
            fontWeight: 700,
          }}
        >
          Practice Founder · Trackers
        </p>

        <h1
          style={{
            margin: "14px 0 12px",
            fontSize: "52px",
            lineHeight: 1,
            color: "#1C2333",
            fontFamily: "Playfair Display, Georgia, serif",
          }}
        >
          Weekly Financial Reports
        </h1>

        <p
          style={{
            maxWidth: "780px",
            fontSize: "20px",
            lineHeight: 1.55,
            color: "rgba(28, 35, 51, 0.78)",
            margin: 0,
          }}
        >
          Submit and review weekly financial activity, including revenue,
          payroll, contractor payments, owner pay, money blocks, staffing gaps,
          and the highest-priority fix for next week.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "18px",
            marginTop: "34px",
          }}
        >
          <Link
            href="/weekly-financial-reports-list"
            style={{
              display: "block",
              background: "#1C2333",
              color: "#FFFFFF",
              padding: "26px",
              textDecoration: "none",
              border: "1px solid #1C2333",
              minHeight: "150px",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#C9A84C",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              Manager
            </p>

            <h2 style={{ margin: "14px 0 8px", fontSize: "28px" }}>
              Open Manager
            </h2>

            <p style={{ margin: 0, color: "rgba(255,255,255,0.78)" }}>
              View, search, filter, sort, group, edit, and manage weekly
              financial reports.
            </p>
          </Link>

          <Link
            href="/weekly-financial-reports-list?add=1"
            style={{
              display: "block",
              background: "#C9A84C",
              color: "#1C2333",
              padding: "26px",
              textDecoration: "none",
              border: "1px solid #C9A84C",
              minHeight: "150px",
              fontWeight: 800,
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#1C2333",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontSize: "12px",
                fontWeight: 800,
              }}
            >
              Add Record
            </p>

            <h2 style={{ margin: "14px 0 8px", fontSize: "28px" }}>
              Add Weekly Report
            </h2>

            <p style={{ margin: 0, color: "rgba(28,35,51,0.78)" }}>
              Open the weekly financial report add-record panel.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}