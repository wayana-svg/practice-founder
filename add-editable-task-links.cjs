const fs = require("fs");

const path = "app/tasks-list/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/* Add selected linked-record states */
if (!text.includes("const [newLinkedDeliverableId, setNewLinkedDeliverableId]")) {
  text = text.replace(
    /const \[bulkUpdateValue, setBulkUpdateValue\] = useState\("Complete"\);/,
    `const [bulkUpdateValue, setBulkUpdateValue] = useState("Complete");

  const [newLinkedDeliverableId, setNewLinkedDeliverableId] = useState("");
  const [newLinkedIssueId, setNewLinkedIssueId] = useState("");`
  );
}

/* If popup state was already added, keep it. If not, add it too. */
if (!text.includes("const [linkedPopup, setLinkedPopup]")) {
  text = text.replace(
    /const \[newLinkedIssueId, setNewLinkedIssueId\] = useState\(""\);/,
    `const [newLinkedIssueId, setNewLinkedIssueId] = useState("");

  const [linkedPopup, setLinkedPopup] = useState<LinkedPopupState | null>(null);`
  );
}

/* Add editable link functions before renderModal */
if (!text.includes("async function linkDeliverableToActiveTask")) {
  text = text.replace(
    /  function renderModal\(\) \{/,
    `  async function linkDeliverableToActiveTask() {
    setMessage("");
    setErrorMessage("");

    if (!activeRecord?.id) {
      setErrorMessage("Save or open a task before linking a deliverable.");
      return;
    }

    if (!newLinkedDeliverableId) {
      setErrorMessage("Choose a deliverable to link.");
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("deliverables")
      .update({ linked_task: Number(activeRecord.id) })
      .eq("id", Number(newLinkedDeliverableId));

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Deliverable linked to task.");
    setNewLinkedDeliverableId("");
    await loadEverything();
  }

  async function unlinkDeliverableFromTask(deliverableId: number) {
    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("deliverables")
      .update({ linked_task: null })
      .eq("id", deliverableId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Deliverable unlinked from task.");
    await loadEverything();
  }

  async function linkIssueToActiveTask() {
    setMessage("");
    setErrorMessage("");

    if (!activeRecord?.id) {
      setErrorMessage("Save or open a task before linking an issue.");
      return;
    }

    if (!newLinkedIssueId) {
      setErrorMessage("Choose an issue to link.");
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("issues_breakdowns")
      .update({ linked_task: Number(activeRecord.id) })
      .eq("id", Number(newLinkedIssueId));

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Issue linked to task.");
    setNewLinkedIssueId("");
    await loadEverything();
  }

  async function unlinkIssueFromTask(issueId: number) {
    setMessage("");
    setErrorMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("issues_breakdowns")
      .update({ linked_task: null })
      .eq("id", issueId);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage("Issue unlinked from task.");
    await loadEverything();
  }

  function renderModal() {`
  );
}

/* Replace Linked Records section with editable controls */
const linkedRecordsSectionRegex = /<FormSection\s+number="3"\s+title="Linked Records"[\s\S]*?<\/FormSection>/;

const newLinkedRecordsSection = `<FormSection
              number="3"
              title="Linked Records"
              help="These records are connected to this task. In Edit mode, you can link or unlink deliverables and issues."
            >
              <div style={linkedGridStyle}>
                <div style={infoBoxStyle}>
                  <div style={infoLabelStyle}>Linked Deliverables</div>

                  {linkedDeliverableRecords.length === 0 ? (
                    <div style={infoValueStyle}>No linked deliverables.</div>
                  ) : (
                    linkedDeliverableRecords.map((deliverable) => (
                      <div key={deliverable.id} style={linkedEditableRowStyle}>
                        <button
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

                        {!readOnly ? (
                          <button
                            type="button"
                            onClick={() =>
                              unlinkDeliverableFromTask(deliverable.id)
                            }
                            style={tinyDangerButtonStyle}
                          >
                            Unlink
                          </button>
                        ) : null}
                      </div>
                    ))
                  )}

                  {!readOnly && activeRecord?.id ? (
                    <div style={linkEditorBoxStyle}>
                      <label style={fieldStyle}>
                        Add Existing Deliverable
                        <small style={helpTextStyle}>
                          Choose an existing deliverable and link it to this task.
                        </small>

                        <select
                          value={newLinkedDeliverableId}
                          onChange={(event) =>
                            setNewLinkedDeliverableId(event.target.value)
                          }
                          style={inputStyle}
                        >
                          <option value="">Select deliverable</option>
                          {deliverables
                            .filter(
                              (deliverable) =>
                                !deliverable.linked_task ||
                                Number(deliverable.linked_task) ===
                                  Number(activeRecord.id)
                            )
                            .map((deliverable) => (
                              <option key={deliverable.id} value={deliverable.id}>
                                {deliverable.deliverable_name ||
                                  \`Deliverable #\${deliverable.id}\`}
                              </option>
                            ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        onClick={linkDeliverableToActiveTask}
                        style={primaryButtonStyle}
                      >
                        Link Deliverable
                      </button>

                      <a href="/deliverables" style={linkedPopupManagerLinkStyle}>
                        + Add New Deliverable
                      </a>
                    </div>
                  ) : null}
                </div>

                <div style={infoBoxStyle}>
                  <div style={infoLabelStyle}>Linked Issues</div>

                  {linkedIssueRecords.length === 0 ? (
                    <div style={infoValueStyle}>No linked issues.</div>
                  ) : (
                    linkedIssueRecords.map((issue) => (
                      <div key={issue.id} style={linkedEditableRowStyle}>
                        <button
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

                        {!readOnly ? (
                          <button
                            type="button"
                            onClick={() => unlinkIssueFromTask(issue.id)}
                            style={tinyDangerButtonStyle}
                          >
                            Unlink
                          </button>
                        ) : null}
                      </div>
                    ))
                  )}

                  {!readOnly && activeRecord?.id ? (
                    <div style={linkEditorBoxStyle}>
                      <label style={fieldStyle}>
                        Add Existing Issue
                        <small style={helpTextStyle}>
                          Choose an existing issue and link it to this task.
                        </small>

                        <select
                          value={newLinkedIssueId}
                          onChange={(event) =>
                            setNewLinkedIssueId(event.target.value)
                          }
                          style={inputStyle}
                        >
                          <option value="">Select issue</option>
                          {issues
                            .filter(
                              (issue) =>
                                !issue.linked_task ||
                                Number(issue.linked_task) ===
                                  Number(activeRecord.id)
                            )
                            .map((issue) => (
                              <option key={issue.id} value={issue.id}>
                                {issue.issue_name || \`Issue #\${issue.id}\`}
                              </option>
                            ))}
                        </select>
                      </label>

                      <button
                        type="button"
                        onClick={linkIssueToActiveTask}
                        style={primaryButtonStyle}
                      >
                        Link Issue
                      </button>

                      <a
                        href="/issues-breakdowns"
                        style={linkedPopupManagerLinkStyle}
                      >
                        + Add New Issue
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </FormSection>`;

if (linkedRecordsSectionRegex.test(text)) {
  text = text.replace(linkedRecordsSectionRegex, newLinkedRecordsSection);
} else {
  console.log("Could not find Linked Records section.");
}

/* Add missing linked popup renderer if it is not present */
if (!text.includes("linkedPopupBackdropStyle")) {
  text = text.replace(
    /(\s*{renderModal\(\)}\s*)\n\s*<\/main>/,
    `$1

      {linkedPopup ? (
        <div style={linkedPopupBackdropStyle}>
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
                  This record is linked to the current task.
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

                <div style={infoValueStyle}>{linkedPopup.title}</div>
              </div>
            </div>

            <footer style={modalFooterStyle}>
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
    </main>`
  );
}

/* Add styles if missing */
if (!text.includes("const linkedItemButtonStyle")) {
  text = text.replace(
    /const linkedItemStyle: CSSProperties = {[\s\S]*?};/,
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

const linkedEditableRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  borderBottom: \`1px solid \${colors.border}\`,
  padding: "8px 0",
};

const linkEditorBoxStyle: CSSProperties = {
  display: "grid",
  gap: "10px",
  marginTop: "14px",
  padding: "12px",
  background: colors.white,
  border: \`1px solid \${colors.border}\`,
};

const linkedPopupBackdropStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 300,
  background: "rgba(28,35,51,0.66)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "28px",
};

const linkedPopupModalStyle: CSSProperties = {
  width: "min(760px, 96vw)",
  maxHeight: "90vh",
  overflowY: "auto",
  background: colors.cream,
  border: \`1px solid \${colors.border}\`,
  boxShadow: "0 30px 80px rgba(0,0,0,0.32)",
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
  textAlign: "center",
};`
  );
}

fs.writeFileSync(path, text);

console.log("Editable Task linked fields added.");