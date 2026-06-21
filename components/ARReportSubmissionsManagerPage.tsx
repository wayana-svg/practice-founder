"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/supabase/client";

type Employee = {
  id: number;
  name: string | null;
};

type ARRow = {
  id: number;
  created_at?: string | null;
  submitted_by: number | null;
  week_start_date: string | null;
  week_end_date: string | null;
  batch_name: string | null;
  payer_name: string | null;
  charges: number | null;
  payments: number | null;
  refunds: number | null;
  adjustments: number | null;
  write_offs: number | null;
  transfers: number | null;
  ar_balance: number | null;
  days_in_ar: number | null;
  notes: string | null;
};

type Draft = {
  submitted_by: string;
  week_start_date: string;
  week_end_date: string;
  batch_name: string;
  payer_name: string;
  charges: string;
  payments: string;
  refunds: string;
  adjustments: string;
  write_offs: string;
  transfers: string;
  ar_balance: string;
  days_in_ar: string;
  notes: string;
};

const emptyDraft: Draft = {
  submitted_by: "",
  week_start_date: "",
  week_end_date: "",
  batch_name: "",
  payer_name: "",
  charges: "0",
  payments: "0",
  refunds: "0",
  adjustments: "0",
  write_offs: "0",
  transfers: "0",
  ar_balance: "0",
  days_in_ar: "",
  notes: "",
};

const fields = [
  { key: "week_start_date", label: "Week Start Date" },
  { key: "week_end_date", label: "Week End Date" },
  { key: "batch_name", label: "Batch Name" },
  { key: "submitted_by", label: "Submitted By" },
  { key: "payer_name", label: "Payer Name" },
  { key: "charges", label: "Charges" },
  { key: "payments", label: "Payments" },
  { key: "refunds", label: "Refunds" },
  { key: "adjustments", label: "Adjustments" },
  { key: "write_offs", label: "Write-Offs" },
  { key: "transfers", label: "Transfers" },
  { key: "ar_balance", label: "AR Balance" },
  { key: "days_in_ar", label: "Days in AR" },
  { key: "notes", label: "Notes" },
] as const;

type FieldKey = (typeof fields)[number]["key"];

const fieldDescriptions: Record<FieldKey, string> = {
  submitted_by:
    "Choose the employee who prepared, entered, or submitted this AR report record. Each employee option represents the staff member responsible for this entry.",
  week_start_date:
    "The first date included in this AR reporting period. This is usually the first day of the week being reported.",
  week_end_date:
    "The last date included in this AR reporting period. This should be the same week or reporting period as the Week Start Date.",
  batch_name:
    "A short name that helps identify this report batch. Example: Week of June 10, 2026 or June AR Review.",
  payer_name:
    "The insurance payer, plan, or payment source connected to this AR row. Example: Medicare, Aetna, BCBS, UnitedHealthcare, Self Pay, or All Payers.",
  charges:
    "The total dollar amount billed during this reporting period before payments, refunds, adjustments, or write-offs are applied.",
  payments:
    "The total dollar amount received and posted from payers or patients during this reporting period.",
  refunds:
    "The total dollar amount returned to payers or patients. Use 0 when there were no refunds.",
  adjustments:
    "The total dollar amount adjusted for contract rules, corrections, reclassifications, or billing changes.",
  write_offs:
    "The total dollar amount removed from collectible AR because it is no longer expected to be collected.",
  transfers:
    "The total dollar amount moved to another payer, patient responsibility, another account, or another billing category.",
  ar_balance:
    "The remaining accounts receivable balance after payments, refunds, adjustments, write-offs, and transfers.",
  days_in_ar:
    "The age of the AR balance in days. Leave this blank if the billing system leaves it blank. Do not enter 0 unless the actual value is zero.",
  notes:
    "Use this for helpful context, follow-up needs, payer issues, unusual balances, cleanup notes, or anything the next reviewer should know.",
};

export default function ARReportSubmissionsManagerPage() {
  const [rows, setRows] = useState<ARRow[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [addOpen, setAddOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
    loadRows();

    const params = new URLSearchParams(window.location.search);
    if (params.get("add") === "1") {
      setAddOpen(true);
      window.history.replaceState(null, "", "/ar-report-submissions-list");
    }
  }, []);

  async function loadEmployees() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("employees")
      .select("id, name")
      .order("name", { ascending: true });

    if (!error) {
      setEmployees((data as Employee[]) || []);
    }
  }

  async function loadRows() {
    setLoading(true);
    setErrorMessage("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("ar_report_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(250);

    if (error) {
      setErrorMessage(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data as ARRow[]) || []);
    setLoading(false);
  }

  function getEmployeeName(id: number | null) {
    if (!id) return "—";

    const employee = employees.find((item) => item.id === Number(id));
    return employee?.name || `Employee #${id}`;
  }

  function updateDraft(key: keyof Draft, value: string) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function money(value: number | null) {
    const amount = Number(value || 0);
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  function toPayload(source: Draft) {
    return {
      submitted_by: source.submitted_by ? Number(source.submitted_by) : null,
      week_start_date: source.week_start_date || null,
      week_end_date: source.week_end_date || null,
      batch_name: source.batch_name || null,
      payer_name: source.payer_name || null,
      charges: Number(source.charges || 0),
      payments: Number(source.payments || 0),
      refunds: Number(source.refunds || 0),
      adjustments: Number(source.adjustments || 0),
      write_offs: Number(source.write_offs || 0),
      transfers: Number(source.transfers || 0),
      ar_balance: Number(source.ar_balance || 0),
      days_in_ar: source.days_in_ar === "" ? null : Number(source.days_in_ar),
      notes: source.notes || null,
    };
  }

  async function addRecord() {
    setMessage("");
    setErrorMessage("");

    if (!draft.submitted_by) {
      setErrorMessage("Submitted By is required.");
      return;
    }

    if (!draft.week_start_date || !draft.week_end_date || !draft.batch_name) {
      setErrorMessage("Week Start Date, Week End Date, and Batch Name are required.");
      return;
    }

    if (draft.week_end_date < draft.week_start_date) {
      setErrorMessage("Week End Date must be after Week Start Date.");
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("ar_report_submissions")
      .insert(toPayload(draft));

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("AR report record added.");
    setDraft(emptyDraft);
    setAddOpen(false);
    await loadRows();
  }

  function toggleSelected(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function selectAllVisible() {
    setSelectedIds(filteredRows.map((row) => row.id));
  }

  function clearSelected() {
    setSelectedIds([]);
  }

  async function bulkDelete() {
    if (selectedIds.length === 0) {
      setErrorMessage("Select at least one record first.");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedIds.length} selected record(s)? This cannot be undone.`
    );

    if (!confirmed) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("ar_report_submissions")
      .delete()
      .in("id", selectedIds);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`${selectedIds.length} record(s) deleted.`);
    setSelectedIds([]);
    await loadRows();
  }

  async function duplicateSelected() {
    if (selectedIds.length === 0) {
      setErrorMessage("Select at least one record first.");
      return;
    }

    const selectedRows = rows.filter((row) => selectedIds.includes(row.id));

    const duplicatePayload = selectedRows.map((row) => ({
      submitted_by: row.submitted_by,
      week_start_date: row.week_start_date,
      week_end_date: row.week_end_date,
      batch_name: row.batch_name ? `${row.batch_name} Copy` : "Copy",
      payer_name: row.payer_name,
      charges: row.charges,
      payments: row.payments,
      refunds: row.refunds,
      adjustments: row.adjustments,
      write_offs: row.write_offs,
      transfers: row.transfers,
      ar_balance: row.ar_balance,
      days_in_ar: row.days_in_ar,
      notes: row.notes,
    }));

    const supabase = createClient();

    const { error } = await supabase
      .from("ar_report_submissions")
      .insert(duplicatePayload);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage(`${selectedIds.length} record(s) duplicated.`);
    setSelectedIds([]);
    await loadRows();
  }

  const filteredRows = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    if (!search) return rows;

    return rows.filter((row) => {
      const values = [
        row.week_start_date,
        row.week_end_date,
        row.batch_name,
        row.payer_name,
        row.charges,
        row.payments,
        row.refunds,
        row.adjustments,
        row.write_offs,
        row.transfers,
        row.ar_balance,
        row.days_in_ar,
        row.notes,
        getEmployeeName(row.submitted_by),
      ];

      return values.some((value) =>
        String(value || "").toLowerCase().includes(search)
      );
    });
  }, [rows, searchText, employees]);

  const ar90Balance = filteredRows.reduce((sum, row) => {
    if (row.days_in_ar !== null && Number(row.days_in_ar) >= 90) {
      return sum + Number(row.ar_balance || 0);
    }

    return sum;
  }, 0);

  const weightedRows = filteredRows.filter(
    (row) => row.days_in_ar !== null && row.days_in_ar !== undefined
  );

  const weightedNumerator = weightedRows.reduce(
    (sum, row) => sum + Number(row.days_in_ar || 0) * Number(row.ar_balance || 0),
    0
  );

  const weightedDenominator = weightedRows.reduce(
    (sum, row) => sum + Number(row.ar_balance || 0),
    0
  );

  const averageDaysInAR =
    weightedDenominator === 0
      ? "N/A"
      : Math.round(weightedNumerator / weightedDenominator).toString();

  function renderValue(row: ARRow, key: FieldKey) {
    if (key === "submitted_by") return getEmployeeName(row.submitted_by);

    if (
      key === "charges" ||
      key === "payments" ||
      key === "refunds" ||
      key === "adjustments" ||
      key === "write_offs" ||
      key === "transfers" ||
      key === "ar_balance"
    ) {
      return money(row[key]);
    }

    const value = row[key];

    if (value === null || value === undefined || value === "") return "—";

    return String(value);
  }

  function renderHelp(key: FieldKey) {
    return <span style={styles.helpText}>{fieldDescriptions[key]}</span>;
  }

  return (
    <main style={styles.page}>
      <section style={styles.header}>
        <div>
          <a href="/?table=ar_report_submissions" style={styles.backLink}>
            ← Back
          </a>

          <p style={styles.eyebrow}>Practice Founder · Billing Activities · Internal</p>

          <h1 style={styles.title}>AR Report Submissions</h1>

          <p style={styles.description}>
            Manage AR report rows by payer. Use bulk select to delete or duplicate records.
            Blank Days in AR should stay blank, not zero.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          style={styles.primaryButton}
        >
          + Add AR Report Record
        </button>
      </section>

      <section style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Records Loaded</p>
          <strong style={styles.summaryValue}>{rows.length}</strong>
        </div>

        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Filtered Results</p>
          <strong style={styles.summaryValue}>{filteredRows.length}</strong>
        </div>

        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>Average Days in AR</p>
          <strong style={styles.summaryValue}>{averageDaysInAR}</strong>
        </div>

        <div style={styles.summaryCard}>
          <p style={styles.summaryLabel}>AR 90+ Balance</p>
          <strong style={styles.summaryValue}>{money(ar90Balance)}</strong>
        </div>
      </section>

      {message ? <div style={styles.successBox}>{message}</div> : null}
      {errorMessage ? <div style={styles.errorBox}>{errorMessage}</div> : null}

      {addOpen ? (
        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <p style={styles.panelLabel}>ADD RECORD</p>
              <h2 style={styles.panelTitle}>Add AR Report Record</h2>
            </div>

            <button
              type="button"
              onClick={() => setAddOpen(false)}
              style={styles.secondaryButton}
            >
              Close
            </button>
          </div>

          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <p style={styles.sectionLabel}>SECTION 1</p>
              <h3 style={styles.sectionTitle}>Report Details</h3>
              <p style={styles.sectionDescription}>
                Identify who submitted the report, the reporting week, the batch, and the payer.
              </p>
            </div>

            <div style={styles.compactFormGrid}>
              <label style={styles.label} title={fieldDescriptions.submitted_by}>
                Submitted By *
                <select
                  value={draft.submitted_by}
                  onChange={(event) => updateDraft("submitted_by", event.target.value)}
                  style={styles.input}
                  title={fieldDescriptions.submitted_by}
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={styles.label} title={fieldDescriptions.week_start_date}>
                Week Start Date *
                <input
                  type="date"
                  value={draft.week_start_date}
                  onChange={(event) => updateDraft("week_start_date", event.target.value)}
                  style={styles.input}
                  title={fieldDescriptions.week_start_date}
                />
              </label>

              <label style={styles.label} title={fieldDescriptions.week_end_date}>
                Week End Date *
                <input
                  type="date"
                  value={draft.week_end_date}
                  onChange={(event) => updateDraft("week_end_date", event.target.value)}
                  style={styles.input}
                  title={fieldDescriptions.week_end_date}
                />
              </label>

              <label style={styles.label} title={fieldDescriptions.batch_name}>
                Batch Name *
                <input
                  value={draft.batch_name}
                  onChange={(event) => updateDraft("batch_name", event.target.value)}
                  style={styles.input}
                  placeholder="Week of June 10, 2026"
                  title={fieldDescriptions.batch_name}
                />
              </label>

              <label style={styles.label} title={fieldDescriptions.payer_name}>
                Payer Name
                <input
                  value={draft.payer_name}
                  onChange={(event) => updateDraft("payer_name", event.target.value)}
                  style={styles.input}
                  placeholder="Aetna, BCBS, Medicare..."
                  title={fieldDescriptions.payer_name}
                />
              </label>
            </div>
          </div>

          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <p style={styles.sectionLabel}>SECTION 2</p>
              <h3 style={styles.sectionTitle}>Financial Activity</h3>
              <p style={styles.sectionDescription}>
                Enter the money movement for this payer or reporting batch.
              </p>
            </div>

            <div style={styles.compactFormGrid}>
              <label style={styles.label} title={fieldDescriptions.charges}>
                Charges
                <input
                  type="number"
                  step="0.01"
                  value={draft.charges}
                  onChange={(event) => updateDraft("charges", event.target.value)}
                  style={styles.input}
                  title={fieldDescriptions.charges}
                />
              </label>

              <label style={styles.label} title={fieldDescriptions.payments}>
                Payments
                <input
                  type="number"
                  step="0.01"
                  value={draft.payments}
                  onChange={(event) => updateDraft("payments", event.target.value)}
                  style={styles.input}
                  title={fieldDescriptions.payments}
                />
              </label>

              <label style={styles.label} title={fieldDescriptions.refunds}>
                Refunds
                <input
                  type="number"
                  step="0.01"
                  value={draft.refunds}
                  onChange={(event) => updateDraft("refunds", event.target.value)}
                  style={styles.input}
                  title={fieldDescriptions.refunds}
                />
              </label>

              <label style={styles.label} title={fieldDescriptions.adjustments}>
                Adjustments
                <input
                  type="number"
                  step="0.01"
                  value={draft.adjustments}
                  onChange={(event) => updateDraft("adjustments", event.target.value)}
                  style={styles.input}
                  title={fieldDescriptions.adjustments}
                />
              </label>

              <label style={styles.label} title={fieldDescriptions.write_offs}>
                Write-Offs
                <input
                  type="number"
                  step="0.01"
                  value={draft.write_offs}
                  onChange={(event) => updateDraft("write_offs", event.target.value)}
                  style={styles.input}
                  title={fieldDescriptions.write_offs}
                />
              </label>

              <label style={styles.label} title={fieldDescriptions.transfers}>
                Transfers
                <input
                  type="number"
                  step="0.01"
                  value={draft.transfers}
                  onChange={(event) => updateDraft("transfers", event.target.value)}
                  style={styles.input}
                  title={fieldDescriptions.transfers}
                />
              </label>
            </div>
          </div>

          <div style={styles.sectionBlock}>
            <div style={styles.sectionHeader}>
              <p style={styles.sectionLabel}>SECTION 3</p>
              <h3 style={styles.sectionTitle}>AR Aging & Notes</h3>
              <p style={styles.sectionDescription}>
                Record the remaining AR balance, aging, and any follow-up context.
              </p>
            </div>

            <div style={styles.compactFormGrid}>
              <label style={styles.label} title={fieldDescriptions.ar_balance}>
                AR Balance
                <input
                  type="number"
                  step="0.01"
                  value={draft.ar_balance}
                  onChange={(event) => updateDraft("ar_balance", event.target.value)}
                  style={styles.input}
                  title={fieldDescriptions.ar_balance}
                />
              </label>

              <label style={styles.label} title={fieldDescriptions.days_in_ar}>
                Days in AR
                <input
                  type="number"
                  value={draft.days_in_ar}
                  onChange={(event) => updateDraft("days_in_ar", event.target.value)}
                  style={styles.input}
                  placeholder="Leave blank if billing software is blank"
                  title={fieldDescriptions.days_in_ar}
                />
              </label>

              <label style={{ ...styles.label, gridColumn: "1 / -1" }} title={fieldDescriptions.notes}>
                Notes
                <textarea
                  value={draft.notes}
                  onChange={(event) => updateDraft("notes", event.target.value)}
                  style={styles.textarea}
                  title={fieldDescriptions.notes}
                />
              </label>
            </div>
          </div>

          <div style={styles.buttonRow}>
            <button type="button" onClick={addRecord} style={styles.saveButton}>
              Save Record
            </button>

            <button
              type="button"
              onClick={() => {
                setDraft(emptyDraft);
                setAddOpen(false);
              }}
              style={styles.secondaryButton}
            >
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      <section style={styles.tableCard}>
        <div style={styles.toolbar}>
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search AR records..."
            style={styles.search}
          />

          <button type="button" onClick={loadRows} style={styles.secondaryButton}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div style={styles.bulkBar}>
          <strong>{selectedIds.length} selected</strong>

          <button type="button" onClick={selectAllVisible} style={styles.secondaryButton}>
            Select Visible
          </button>

          <button type="button" onClick={clearSelected} style={styles.secondaryButton}>
            Clear Selection
          </button>

          <button type="button" onClick={duplicateSelected} style={styles.goldButton}>
            Duplicate Selected
          </button>

          <button type="button" onClick={bulkDelete} style={styles.dangerButton}>
            Delete Selected
          </button>
        </div>

        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  <input
                    type="checkbox"
                    checked={
                      filteredRows.length > 0 &&
                      filteredRows.every((row) => selectedIds.includes(row.id))
                    }
                    onChange={(event) =>
                      event.target.checked ? selectAllVisible() : clearSelected()
                    }
                  />
                </th>

                {fields.map((field) => (
                  <th key={field.key} style={styles.th} title={fieldDescriptions[field.key]}>
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} style={styles.tr}>
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleSelected(row.id)}
                    />
                  </td>

                  {fields.map((field) => (
                    <td key={field.key} style={styles.td} title={fieldDescriptions[field.key]}>
                      {renderValue(row, field.key)}
                    </td>
                  ))}
                </tr>
              ))}

              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={fields.length + 1} style={styles.emptyCell}>
                    No AR report records yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#F8F5EE",
    padding: "34px",
    color: "#1C2333",
    fontFamily: "DM Sans, Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    alignItems: "flex-start",
    marginBottom: "28px",
  },
  backLink: {
    color: "#1C2333",
    fontWeight: 800,
    textDecoration: "none",
    fontSize: "18px",
  },
  eyebrow: {
    margin: "28px 0 12px",
    color: "#C9A84C",
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    fontSize: "13px",
    fontWeight: 800,
  },
  title: {
    margin: 0,
    fontFamily: "Playfair Display, Georgia, serif",
    fontSize: "56px",
    lineHeight: 1,
  },
  description: {
    maxWidth: "780px",
    fontSize: "19px",
    lineHeight: 1.55,
    color: "rgba(28,35,51,0.75)",
  },
  primaryButton: {
    background: "#C9A84C",
    color: "#1C2333",
    border: "none",
    padding: "18px 26px",
    fontWeight: 900,
    fontSize: "18px",
    cursor: "pointer",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },
  summaryCard: {
    background: "#FFFFFF",
    border: "1px solid rgba(28,35,51,0.14)",
    padding: "22px",
  },
  summaryLabel: {
    margin: "0 0 12px",
    color: "#C9A84C",
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    fontSize: "12px",
    fontWeight: 800,
  },
  summaryValue: {
    fontSize: "28px",
  },
  successBox: {
    background: "#FFFFFF",
    borderLeft: "6px solid #C9A84C",
    padding: "14px 18px",
    marginBottom: "18px",
    fontWeight: 800,
  },
  errorBox: {
    background: "#FFFFFF",
    borderLeft: "6px solid #C43B3B",
    padding: "14px 18px",
    marginBottom: "18px",
    fontWeight: 800,
  },
  panel: {
    background: "#FFFFFF",
    border: "1px solid rgba(201,168,76,0.45)",
    padding: "26px",
    marginBottom: "24px",
    boxShadow: "0 18px 40px rgba(28,35,51,0.08)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "18px",
    marginBottom: "20px",
  },
  panelLabel: {
    margin: 0,
    color: "#C9A84C",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontSize: "12px",
    fontWeight: 900,
  },
  panelTitle: {
    margin: "8px 0 0",
    fontSize: "30px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  label: {
    display: "grid",
    gap: "8px",
    fontWeight: 900,
  },
  helpText: {
    display: "block",
    color: "rgba(28,35,51,0.68)",
    fontSize: "13px",
    lineHeight: 1.4,
    fontWeight: 600,
  },
  input: {
    border: "1px solid rgba(28,35,51,0.18)",
    padding: "12px",
    fontSize: "16px",
    background: "#F8F5EE",
  },
  textarea: {
    border: "1px solid rgba(28,35,51,0.18)",
    padding: "12px",
    fontSize: "16px",
    minHeight: "110px",
    background: "#F8F5EE",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "18px",
  },
  saveButton: {
    background: "#1C2333",
    color: "#FFFFFF",
    border: "none",
    padding: "14px 20px",
    fontWeight: 900,
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#FFFFFF",
    color: "#1C2333",
    border: "1px solid rgba(28,35,51,0.18)",
    padding: "12px 16px",
    fontWeight: 900,
    cursor: "pointer",
  },
  goldButton: {
    background: "#C9A84C",
    color: "#1C2333",
    border: "none",
    padding: "12px 16px",
    fontWeight: 900,
    cursor: "pointer",
  },
  dangerButton: {
    background: "#C43B3B",
    color: "#FFFFFF",
    border: "none",
    padding: "12px 16px",
    fontWeight: 900,
    cursor: "pointer",
  },
  tableCard: {
    background: "#FFFFFF",
    border: "1px solid rgba(28,35,51,0.14)",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    padding: "18px",
    borderBottom: "1px solid rgba(28,35,51,0.14)",
  },
  search: {
    flex: 1,
    maxWidth: "520px",
    border: "1px solid rgba(28,35,51,0.18)",
    padding: "12px 14px",
    fontSize: "16px",
    background: "#F8F5EE",
  },
  bulkBar: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    padding: "16px 18px",
    borderBottom: "1px solid rgba(28,35,51,0.14)",
    background: "#F8F5EE",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1500px",
  },
  th: {
    textAlign: "left",
    padding: "16px",
    borderBottom: "1px solid rgba(28,35,51,0.18)",
    background: "#F8F5EE",
    color: "#1C2333",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: "12px",
    fontWeight: 900,
  },
  tr: {
    borderBottom: "1px solid rgba(28,35,51,0.1)",
  },
  td: {
    padding: "14px 16px",
    verticalAlign: "top",
    fontSize: "15px",
  },
  emptyCell: {
    padding: "28px",
    textAlign: "center",
    color: "rgba(28,35,51,0.65)",
    fontWeight: 800,
  },
};