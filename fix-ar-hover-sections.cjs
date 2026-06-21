const fs = require("fs");

const path = "components/ARReportSubmissionsManagerPage.tsx";
let text = fs.readFileSync(path, "utf8");

const start = text.indexOf("          <div style={styles.formGrid}>");
const end = text.indexOf("          <div style={styles.buttonRow}>");

if (start === -1 || end === -1) {
  console.log("Could not find the AR form section. No changes made.");
  process.exit(1);
}

const newForm = `          <div style={styles.sectionBlock}>
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

`;

text = text.slice(0, start) + newForm + text.slice(end);

if (!text.includes("sectionBlock:")) {
  text = text.replace(
    `  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },`,
    `  sectionBlock: {
    border: "1px solid rgba(28,35,51,0.12)",
    background: "#FFFFFF",
    padding: "18px",
    marginBottom: "18px",
  },
  sectionHeader: {
    marginBottom: "16px",
  },
  sectionLabel: {
    margin: "0 0 6px",
    color: "#C9A84C",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontSize: "11px",
    fontWeight: 900,
  },
  sectionTitle: {
    margin: "0 0 6px",
    fontSize: "22px",
    color: "#1C2333",
  },
  sectionDescription: {
    margin: 0,
    maxWidth: "760px",
    color: "rgba(28,35,51,0.68)",
    fontSize: "14px",
    lineHeight: 1.45,
    fontWeight: 600,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  compactFormGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    alignItems: "start",
  },`
  );
}

fs.writeFileSync(path, text);
console.log("AR form now uses hover descriptions and clean sections.");