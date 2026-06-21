const fs = require("fs");

const path = "app/charge-lag-list/page.tsx";
let text = fs.readFileSync(path, "utf8");

const start = text.indexOf("  function renderForm(mode: \"create\" | \"edit\") {");
const end = text.indexOf("\n  return (\n    <main", start);

if (start === -1 || end === -1) {
  console.log("Could not find renderForm. No changes made.");
  process.exit(1);
}

const newRenderForm = `  function renderForm(mode: "create" | "edit") {
    const batchField = tableFields.find((field) => field.key === "batch_name")!;
    const submittedByField = tableFields.find((field) => field.key === "submitted_by")!;
    const serviceDateField = tableFields.find((field) => field.key === "date_of_service")!;
    const submissionDateField = tableFields.find((field) => field.key === "claim_submission_date")!;
    const lagField = tableFields.find((field) => field.key === "lag_in_days")!;
    const notesField = tableFields.find((field) => field.key === "notes")!;

    return (
      <div style={sectionedFormStyle}>
        <section style={formSectionStyle}>
          <div style={formSectionHeaderStyle}>
            <div style={formSectionEyebrowStyle}>SECTION 1</div>
            <h3 style={formSectionTitleStyle}>Record Details</h3>
            <p style={formSectionDescriptionStyle}>
              Identify the batch and the person responsible for submitting this charge lag record.
            </p>
          </div>

          <div style={formGridStyle}>
            <label style={formLabelStyle} title={batchField.description}>
              Batch Name
              <input
                value={form.batch_name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    batch_name: event.target.value,
                  }))
                }
                style={formInputStyle}
                title={batchField.description}
              />
            </label>

            <label style={formLabelStyle} title={submittedByField.description}>
              Submitted By
              <select
                value={form.submitted_by}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    submitted_by: event.target.value,
                  }))
                }
                style={formInputStyle}
                title={submittedByField.description}
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name || employee.email || employee.id}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section style={formSectionStyle}>
          <div style={formSectionHeaderStyle}>
            <div style={formSectionEyebrowStyle}>SECTION 2</div>
            <h3 style={formSectionTitleStyle}>Service & Submission Dates</h3>
            <p style={formSectionDescriptionStyle}>
              Enter the service date and claim submission date. The lag is calculated automatically.
            </p>
          </div>

          <div style={formGridStyle}>
            <label style={formLabelStyle} title={serviceDateField.description}>
              Date of Service
              <input
                type="date"
                value={form.date_of_service}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    date_of_service: event.target.value,
                  }))
                }
                style={formInputStyle}
                title={serviceDateField.description}
              />
            </label>

            <label style={formLabelStyle} title={submissionDateField.description}>
              Claim Submission Date
              <input
                type="date"
                value={form.claim_submission_date}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    claim_submission_date: event.target.value,
                  }))
                }
                style={formInputStyle}
                title={submissionDateField.description}
              />
            </label>

            <div style={calculatedBoxStyle} title={lagField.description}>
              <div style={metricLabelStyle}>CALCULATED LAG</div>
              <strong>
                {calculateLagInDays(
                  form.date_of_service,
                  form.claim_submission_date
                )}{" "}
                day(s)
              </strong>
            </div>
          </div>
        </section>

        <section style={formSectionStyle}>
          <div style={formSectionHeaderStyle}>
            <div style={formSectionEyebrowStyle}>SECTION 3</div>
            <h3 style={formSectionTitleStyle}>Notes & Follow-Up</h3>
            <p style={formSectionDescriptionStyle}>
              Add context about delays, missing documentation, payer issues, or follow-up needed.
            </p>
          </div>

          <div style={formGridStyle}>
            <label style={formLabelWideStyle} title={notesField.description}>
              Notes
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                style={formTextareaStyle}
                title={notesField.description}
              />
            </label>
          </div>
        </section>

        <div style={formActionsStyle}>
          <button
            type="button"
            onClick={() => {
              if (mode === "create") {
                setAddOpen(false);
              } else {
                setEditRecord(null);
              }

              resetForm();
            }}
            style={secondaryButtonStyle}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => saveForm(mode)}
            style={primaryButtonStyle}
          >
            {mode === "create" ? "Create Charge Lag Record" : "Save Charge Lag Record"}
          </button>
        </div>
      </div>
    );
  }

`;

text = text.slice(0, start) + newRenderForm + text.slice(end);

if (!text.includes("const sectionedFormStyle")) {
  const insertBefore = text.indexOf("const formGridStyle: CSSProperties = {");

  const sectionStyles = `const sectionedFormStyle: CSSProperties = {
  display: "grid",
  gap: "16px",
};

const formSectionStyle: CSSProperties = {
  background: colors.white,
  border: \`1px solid \${colors.border}\`,
  padding: "16px",
  display: "grid",
  gap: "14px",
};

const formSectionHeaderStyle: CSSProperties = {
  display: "grid",
  gap: "4px",
};

const formSectionEyebrowStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "10px",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  fontWeight: 900,
};

const formSectionTitleStyle: CSSProperties = {
  margin: 0,
  color: colors.navy,
  fontSize: "20px",
  fontWeight: 900,
};

const formSectionDescriptionStyle: CSSProperties = {
  margin: 0,
  color: colors.slate,
  fontSize: "13px",
  lineHeight: 1.45,
  fontWeight: 600,
};

`;

  if (insertBefore !== -1) {
    text = text.slice(0, insertBefore) + sectionStyles + text.slice(insertBefore);
  }
}

fs.writeFileSync(path, text);
console.log("Charge Lag form now uses hover descriptions and clean sections.");