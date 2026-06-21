const fs = require("fs");

const path = "app/tasks-list/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

if (!text.includes("type LinkedPopupState")) {
  text = text.replace(
    `type ModalMode = "add" | "open" | "edit";`,
    `type ModalMode = "add" | "open" | "edit";

type LinkedPopupState =
  | {
      type: "deliverable";
      title: string;
      record: LinkedDeliverable;
    }
  | {
      type: "issue";
      title: string;
      record: LinkedIssue;
    };`
  );
}

if (!text.includes("const [linkedPopup, setLinkedPopup]")) {
  text = text.replace(
    `const [bulkUpdateFieldKey, setBulkUpdateFieldKey] = useState("status");
  const [bulkUpdateValue, setBulkUpdateValue] = useState("Complete");`,
    `const [bulkUpdateFieldKey, setBulkUpdateFieldKey] = useState("status");
  const [bulkUpdateValue, setBulkUpdateValue] = useState("Complete");

  const [linkedPopup, setLinkedPopup] = useState<LinkedPopupState | null>(null);`
  );
}

const oldDeliverableBlock = `linkedDeliverableRecords.map((deliverable) => (
                      <a
                        key={deliverable.id}
                        href="/deliverables-list"
                        style={linkedItemStyle}
                      >
                        {deliverable.deliverable_name ||
                          \`Deliverable #\${deliverable.id}\`}
                      </a>
                    ))`;

const newDeliverableBlock = `linkedDeliverableRecords.map((deliverable) => (
                      <button
                        key={deliverable.id}
                        type="button"
                        onClick={() =>
                          setLinkedPopup({
                            type: "deliverable",
                            title:
                              deliverable.deliverable_name ||
                              \`Deliverable #\${deliverable.id}\`,
                            record: deliverable,
                          })
                        }
                        style={linkedItemButtonStyle}
                      >
                        {deliverable.deliverable_name ||
                          \`Deliverable #\${deliverable.id}\`}
                      </button>
                    ))`;

text = text.replace(oldDeliverableBlock, newDeliverableBlock);

const oldIssueBlock = `linkedIssueRecords.map((issue) => (
                      <a key={issue.id} href="/issues-list" style={linkedItemStyle}>
                        {issue.issue_name || \`Issue #\${issue.id}\`}
                      </a>
                    ))`;

const newIssueBlock = `linkedIssueRecords.map((issue) => (
                      <button
                        key={issue.id}
                        type="button"
                        onClick={() =>
                          setLinkedPopup({
                            type: "issue",
                            title: issue.issue_name || \`Issue #\${issue.id}\`,
                            record: issue,
                          })
                        }
                        style={linkedItemButtonStyle}
                      >
                        {issue.issue_name || \`Issue #\${issue.id}\`}
                      </button>
                    ))`;

text = text.replace(oldIssueBlock, newIssueBlock);

if (!text.includes("{linkedPopup ? (")) {
  text = text.replace(
    `      {renderModal()}
    </main>
  );`,
    `      {renderModal()}

      {linkedPopup ? (
        <div style={modalBackdropStyle}>
          <section style={linkedPopupModalStyle}>
            <header style={modalHeaderStyle}>
              <div>
                <div style={eyebrowStyle}>
                  {linkedPopup.type === "deliverable"
                    ? "LINKED DELIVERABLE"
                    : "LINKED ISSUE"}
                </div>

                <h2 style={modalTitleStyle}>{linkedPopup.title}</h2>

                <p style={modalIntroStyle}>
                  This record is linked to the current task. Use Open Manager if
                  you need to edit the full linked record.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setLinkedPopup(null)}
                style={closeButtonStyle}
              >
                Close
              </button>
            </header>

            <div style={linkedPopupContentStyle}>
              <div style={infoBoxStyle}>
                <div style={infoLabelStyle}>Record ID</div>
                <div style={infoValueStyle}>{linkedPopup.record.id}</div>
              </div>

              <div style={infoBoxStyle}>
                <div style={infoLabelStyle}>Linked Task</div>
                <div style={infoValueStyle}>
                  {linkedPopup.record.linked_task || "-"}
                </div>
              </div>

              <div style={infoBoxStyle}>
                <div style={infoLabelStyle}>
                  {linkedPopup.type === "deliverable"
                    ? "Deliverable Name"
                    : "Issue Name"}
                </div>

                <div style={infoValueStyle}>
                  {linkedPopup.type === "deliverable"
                    ? linkedPopup.record.deliverable_name ||
                      \`Deliverable #\${linkedPopup.record.id}\`
                    : linkedPopup.record.issue_name ||
                      \`Issue #\${linkedPopup.record.id}\`}
                </div>
              </div>
            </div>

            <footer style={modalFooterStyle}>
              <a
                href={
                  linkedPopup.type === "deliverable"
                    ? "/deliverables-list"
                    : "/issues-list"
                }
                style={linkedPopupManagerLinkStyle}
              >
                Open Manager
              </a>

              <button
                type="button"
                onClick={() => setLinkedPopup(null)}
                style={secondaryButtonStyle}
              >
                Close
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </main>
  );`
  );
}

if (!text.includes("const linkedItemButtonStyle")) {
  text = text.replace(
    `const linkedItemStyle: CSSProperties = {
  display: "block",
  color: colors.navy,
  fontWeight: 800,
  marginTop: "8px",
  textDecoration: "underline",
  textDecorationColor: colors.gold,
  textUnderlineOffset: "4px",
};`,
    `const linkedItemStyle: CSSProperties = {
  display: "block",
  color: colors.navy,
  fontWeight: 800,
  marginTop: "8px",
  textDecoration: "underline",
  textDecorationColor: colors.gold,
  textUnderlineOffset: "4px",
};

const linkedItemButtonStyle: CSSProperties = {
  ...linkedItemStyle,
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  textAlign: "left",
};

const linkedPopupModalStyle: CSSProperties = {
  width: "min(760px, 96vw)",
  maxHeight: "90vh",
  overflowY: "auto",
  background: colors.cream,
  border: \`1px solid \${colors.border}\`,
  boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
  padding: "24px",
};

const linkedPopupContentStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
  marginBottom: "16px",
};

const linkedPopupManagerLinkStyle: CSSProperties = {
  background: colors.gold,
  color: colors.navy,
  border: "none",
  borderRadius: "8px",
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
  textDecoration: "none",
};`
  );
}

fs.writeFileSync(path, text);

console.log("Task linked Deliverables and Issues now open in popups.");