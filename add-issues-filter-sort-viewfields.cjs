const fs = require("fs");

const file = "app/issues-list/page.tsx";

if (!fs.existsSync(file)) {
  throw new Error("Cannot find app/issues-list/page.tsx");
}

let code = fs.readFileSync(file, "utf8");

if (code.includes("issueTableFields")) {
  console.log("Issues filter/sort/view fields already appears to be installed.");
  process.exit(0);
}

code = code.replace(
  `type BulkUpdateField = {
  key: string;
  label: string;
  type: "select" | "date" | "employee" | "task" | "daily_huddle";
  description: string;
  options?: OptionDefinition[];
};`,
  `type BulkUpdateField = {
  key: string;
  label: string;
  type: "select" | "date" | "employee" | "task" | "daily_huddle";
  description: string;
  options?: OptionDefinition[];
};

type IssueTableField = {
  key: string;
  label: string;
  description: string;
  type: "text" | "date" | "select" | "employee" | "task" | "daily_huddle";
  options?: OptionDefinition[];
};`
);

code = code.replace(
  `const initialDraft: RowData = {`,
  `const issueTableFields: IssueTableField[] = [
  {
    key: "issue_name",
    label: "Issue",
    type: "text",
    description:
      "The short name of the issue or breakdown.",
  },
  {
    key: "date_identified",
    label: "Date Identified",
    type: "date",
    description:
      "The date the issue was first noticed, reported, or confirmed.",
  },
  {
    key: "impact_level",
    label: "Impact",
    type: "select",
    description:
      "How much the issue affects operations, patients, money, deadlines, team flow, or leadership priorities.",
    options: impactOptions,
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    description:
      "Where the issue currently sits in the resolution process.",
    options: statusOptions,
  },
  {
    key: "priority",
    label: "Priority",
    type: "select",
    description:
      "How soon the issue needs attention compared with other work.",
    options: priorityOptions,
  },
  {
    key: "submitted_by",
    label: "Submitted By",
    type: "employee",
    description:
      "The team member who logged or submitted the issue.",
  },
  {
    key: "linked_task",
    label: "Linked Task",
    type: "task",
    description:
      "The task connected to this issue.",
  },
  {
    key: "link_to_daily_huddle",
    label: "Daily Huddle",
    type: "daily_huddle",
    description:
      "The daily huddle record connected to this issue.",
  },
  {
    key: "resolve_close_date",
    label: "Resolve / Close",
    type: "date",
    description:
      "The date the issue was resolved or fully closed.",
  },
  {
    key: "description",
    label: "Description",
    type: "text",
    description:
      "What happened, what is broken, who or what is affected, and why this issue matters.",
  },
  {
    key: "resolution_description",
    label: "Resolution",
    type: "text",
    description:
      "What was done to fix or address the issue.",
  },
  {
    key: "ending_notes",
    label: "Ending Notes",
    type: "text",
    description:
      "Final notes, remaining follow-up, lessons learned, or anything the team should remember.",
  },
];

const defaultIssueFieldKeys = [
  "issue_name",
  "date_identified",
  "impact_level",
  "status",
  "priority",
  "submitted_by",
  "linked_task",
  "link_to_daily_huddle",
  "resolve_close_date",
];

const initialDraft: RowData = {`
);

code = code.replace(
  `  const [searchText, setSearchText] = useState("");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);`,
  `  const [searchText, setSearchText] = useState("");
  const [activeMenu, setActiveMenu] = useState<
    "" | "filter" | "sort" | "viewFields"
  >("");
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [visibleFieldKeys, setVisibleFieldKeys] =
    useState<string[]>(defaultIssueFieldKeys);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);`
);

code = code.replace(
  `  const filteredRows = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    if (!search) return rows;

    return rows.filter((row) =>
      [
        row.id,
        row.issue_name,
        row.status,
        row.priority,
        row.impact_level,
        row.description,
        row.resolution_description,
        row.ending_notes,
      ]
        .map((value) => String(value || "").toLowerCase())
        .some((value) => value.includes(search))
    );
  }, [rows, searchText]);`,
  `  const filteredRows = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let nextRows = [...rows];

    if (search) {
      nextRows = nextRows.filter((row) =>
        [
          row.id,
          row.issue_name,
          row.status,
          row.priority,
          row.impact_level,
          row.description,
          row.resolution_description,
          row.ending_notes,
          row.submitted_by,
          row.linked_task,
          row.link_to_daily_huddle,
        ]
          .map((value) => String(value || "").toLowerCase())
          .some((value) => value.includes(search))
      );
    }

    if (filterField && filterValue) {
      nextRows = nextRows.filter(
        (row) => String(row[filterField] || "") === filterValue
      );
    }

    if (sortBy) {
      const sortField = issueTableFields.find((field) => field.key === sortBy);

      nextRows.sort((firstRow, secondRow) => {
        const firstValue = firstRow[sortBy];
        const secondValue = secondRow[sortBy];

        if (sortBy === "id") {
          return Number(secondValue || 0) - Number(firstValue || 0);
        }

        if (sortField?.type === "date") {
          return String(secondValue || "").localeCompare(String(firstValue || ""));
        }

        return String(firstValue || "").localeCompare(String(secondValue || ""));
      });
    }

    return nextRows;
  }, [rows, searchText, filterField, filterValue, sortBy]);`
);

code = code.replace(
  `  const selectedBulkField =
    bulkUpdateFields.find((field) => field.key === bulkUpdateFieldKey) ||
    bulkUpdateFields[0];`,
  `  const selectedBulkField =
    bulkUpdateFields.find((field) => field.key === bulkUpdateFieldKey) ||
    bulkUpdateFields[0];

  const visibleTableFields = useMemo(() => {
    return visibleFieldKeys
      .map((fieldKey) =>
        issueTableFields.find((field) => field.key === fieldKey)
      )
      .filter(Boolean) as IssueTableField[];
  }, [visibleFieldKeys]);

  const availableTableFields = useMemo(() => {
    return issueTableFields.filter(
      (field) => !visibleFieldKeys.includes(field.key)
    );
  }, [visibleFieldKeys]);

  const filterOptions = useMemo(() => {
    if (!filterField) return [];

    const values = new Set<string>();

    rows.forEach((row) => {
      const value = row[filterField];

      if (value !== null && value !== undefined && String(value).trim() !== "") {
        values.add(String(value));
      }
    });

    return Array.from(values).sort();
  }, [rows, filterField]);`
);

code = code.replace(
  `  function renderEditableCell(row: RowData, fieldKey: string, displayValue: string) {`,
  `  function renderIssueTableCell(row: RowData, field: IssueTableField) {
    const linkedTask = getLinkedTask(row.linked_task);
    const linkedHuddle = getLinkedHuddle(row.link_to_daily_huddle);

    if (field.key === "issue_name") {
      return renderEditableCell(
        row,
        "issue_name",
        String(row.issue_name || "Untitled issue")
      );
    }

    if (field.key === "date_identified") {
      return formatDate(row.date_identified);
    }

    if (field.key === "impact_level") {
      return (
        <>
          {renderEditableCell(row, "impact_level", String(row.impact_level || "—"))}
          <small style={tableHelpStyle}>
            {getOptionDescription(impactOptions, row.impact_level)}
          </small>
        </>
      );
    }

    if (field.key === "status") {
      return (
        <>
          {renderEditableCell(row, "status", String(row.status || "Open"))}
          <small style={tableHelpStyle}>
            {getOptionDescription(statusOptions, row.status)}
          </small>
        </>
      );
    }

    if (field.key === "priority") {
      return (
        <>
          {renderEditableCell(row, "priority", String(row.priority || "Important"))}
          <small style={tableHelpStyle}>
            {getOptionDescription(priorityOptions, row.priority)}
          </small>
        </>
      );
    }

    if (field.key === "submitted_by") {
      return renderEditableCell(row, "submitted_by", getEmployeeName(row.submitted_by));
    }

    if (field.key === "linked_task") {
      return (
        <div style={linkedCellStackStyle}>
          {renderEditableCell(row, "linked_task", getTaskLabel(row.linked_task))}

          {linkedTask ? (
            <button
              type="button"
              onClick={() => setLinkedTaskModal(linkedTask)}
              style={linkedOpenButtonStyle}
            >
              Open task
            </button>
          ) : null}
        </div>
      );
    }

    if (field.key === "link_to_daily_huddle") {
      return (
        <div style={linkedCellStackStyle}>
          {renderEditableCell(
            row,
            "link_to_daily_huddle",
            getDailyHuddleLabel(row.link_to_daily_huddle)
          )}

          {linkedHuddle ? (
            <button
              type="button"
              onClick={() => setLinkedHuddleModal(linkedHuddle)}
              style={linkedOpenButtonStyle}
            >
              Open huddle
            </button>
          ) : null}
        </div>
      );
    }

    if (field.key === "resolve_close_date") {
      return renderEditableCell(
        row,
        "resolve_close_date",
        formatDate(row.resolve_close_date)
      );
    }

    const value = row[field.key];

    if (value === null || value === undefined || value === "") {
      return "—";
    }

    return String(value);
  }

  function renderEditableCell(row: RowData, fieldKey: string, displayValue: string) {`
);

code = code.replace(
  `        <div style={toolbarStyle}>
          <div style={searchBoxStyle}>
            <span>⌕</span>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Find issues"
              style={searchInputStyle}
            />
          </div>

          <button type="button" onClick={loadEverything} style={refreshButtonStyle}>
            Refresh
          </button>
        </div>`,
  `        <div style={toolbarStyle}>
          <div style={searchBoxStyle}>
            <span>⌕</span>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Find issues"
              style={searchInputStyle}
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setActiveMenu((current) => (current === "filter" ? "" : "filter"))
            }
            style={{
              ...toolbarMenuButtonStyle,
              ...(activeMenu === "filter" ? activeToolbarMenuButtonStyle : {}),
            }}
          >
            Filter
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveMenu((current) => (current === "sort" ? "" : "sort"))
            }
            style={{
              ...toolbarMenuButtonStyle,
              ...(activeMenu === "sort" ? activeToolbarMenuButtonStyle : {}),
            }}
          >
            Sort
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveMenu((current) =>
                current === "viewFields" ? "" : "viewFields"
              )
            }
            style={{
              ...toolbarMenuButtonStyle,
              ...(activeMenu === "viewFields"
                ? activeToolbarMenuButtonStyle
                : {}),
            }}
          >
            View Fields
          </button>

          <button type="button" onClick={loadEverything} style={refreshButtonStyle}>
            Refresh
          </button>
        </div>

        {activeMenu === "filter" ? (
          <div style={managerPanelStyle}>
            <div style={panelTitleStyle}>Filter Issues</div>

            <div style={compactPanelGridStyle}>
              <label style={panelLabelStyle}>
                Field
                <select
                  value={filterField}
                  onChange={(event) => {
                    setFilterField(event.target.value);
                    setFilterValue("");
                  }}
                  style={panelInputStyle}
                >
                  <option value="">Choose field</option>
                  {issueTableFields.map((field) => (
                    <option key={field.key} value={field.key}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </label>

              <label style={panelLabelStyle}>
                Value
                <select
                  value={filterValue}
                  onChange={(event) => setFilterValue(event.target.value)}
                  style={panelInputStyle}
                  disabled={!filterField}
                >
                  <option value="">All values</option>
                  {filterOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => {
                  setFilterField("");
                  setFilterValue("");
                }}
                style={secondaryButtonStyle}
              >
                Clear Filter
              </button>
            </div>
          </div>
        ) : null}

        {activeMenu === "sort" ? (
          <div style={managerPanelStyle}>
            <div style={panelTitleStyle}>Sort Issues</div>

            <div style={fieldListStyle}>
              <button
                type="button"
                onClick={() => {
                  setSortBy("id");
                  setActiveMenu("");
                }}
                style={{
                  ...availableFieldButtonStyle,
                  ...(sortBy === "id" ? selectedSortButtonStyle : {}),
                }}
              >
                <span>
                  <strong>Newest First</strong>
                  <small style={fieldMetaStyle}>Sort by record ID, newest first.</small>
                </span>
              </button>

              {issueTableFields.map((field) => (
                <button
                  key={field.key}
                  type="button"
                  title={field.description}
                  onClick={() => {
                    setSortBy(field.key);
                    setActiveMenu("");
                  }}
                  style={{
                    ...availableFieldButtonStyle,
                    ...(sortBy === field.key ? selectedSortButtonStyle : {}),
                  }}
                >
                  <span>
                    <strong>{field.label}</strong>
                    <small style={fieldMetaStyle}>{field.description}</small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {activeMenu === "viewFields" ? (
          <div style={managerPanelStyle}>
            <div style={viewFieldsHeaderStyle}>
              <div>
                <div style={panelEyebrowStyle}>FIELDS TO DISPLAY</div>
                <div style={panelTitleStyle}>Build This View</div>
              </div>

              <div style={buttonRowStyle}>
                <button
                  type="button"
                  onClick={() =>
                    setVisibleFieldKeys(issueTableFields.map((field) => field.key))
                  }
                  style={secondaryButtonStyle}
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={() => setVisibleFieldKeys(defaultIssueFieldKeys)}
                  style={secondaryButtonStyle}
                >
                  Default View
                </button>
              </div>
            </div>

            <div style={viewFieldsGridStyle}>
              <div style={viewFieldsColumnStyle}>
                <div style={panelEyebrowStyle}>AVAILABLE FIELDS</div>

                <div style={fieldListStyle}>
                  {availableTableFields.map((field) => (
                    <button
                      type="button"
                      key={field.key}
                      title={field.description}
                      onClick={() =>
                        setVisibleFieldKeys((current) => [...current, field.key])
                      }
                      style={availableFieldButtonStyle}
                    >
                      <span>
                        <strong>{field.label}</strong>
                        <small style={fieldMetaStyle}>{field.description}</small>
                      </span>

                      <span style={addFieldCircleStyle}>+</span>
                    </button>
                  ))}

                  {availableTableFields.length === 0 ? (
                    <div style={emptyFieldBoxStyle}>All fields are selected.</div>
                  ) : null}
                </div>
              </div>

              <div style={viewFieldsColumnStyle}>
                <div style={panelEyebrowStyle}>
                  SELECTED FIELDS · {visibleFieldKeys.length}
                </div>

                <div style={fieldListStyle}>
                  {visibleTableFields.map((field) => (
                    <div key={field.key} title={field.description} style={selectedFieldItemStyle}>
                      <div style={{ flex: 1 }}>
                        <strong>{field.label}</strong>
                        <small style={fieldMetaStyle}>{field.description}</small>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setVisibleFieldKeys((current) =>
                            current.length === 1
                              ? current
                              : current.filter((fieldKey) => fieldKey !== field.key)
                          )
                        }
                        style={tinyRemoveButtonStyle}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}`
);

const headerOld = `                  <th style={thStyle}>Issue</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Impact</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Priority</th>
                  <th style={thStyle}>Submitted By</th>
                  <th style={thStyle}>Linked Task</th>
                  <th style={thStyle}>Daily Huddle</th>
                  <th style={thStyle}>Resolve / Close</th>`;

const headerNew = `                  {visibleTableFields.map((field) => (
                    <th key={field.key} style={thStyle} title={field.description}>
                      {field.label}
                    </th>
                  ))}`;

code = code.replace(headerOld, headerNew);

const rowStart = code.indexOf(`                      <td style={tdStyle}>
                        {renderEditableCell(row, "issue_name"`);
const rowEnd = code.indexOf(`                      <td style={tdStyle}>
                        <div style={actionMenuWrapStyle}`, rowStart);

if (rowStart === -1 || rowEnd === -1) {
  throw new Error("Could not find the fixed Issues table cell block.");
}

const dynamicCells = `                      {visibleTableFields.map((field) => (
                        <td key={field.key} style={tdStyle} title={field.description}>
                          {renderIssueTableCell(row, field)}
                        </td>
                      ))}

`;

code = code.slice(0, rowStart) + dynamicCells + code.slice(rowEnd);

code = code.replace(
  `const refreshButtonStyle: CSSProperties = {`,
  `const toolbarMenuButtonStyle: CSSProperties = {
  height: "34px",
  border: \`1px solid \${colors.border}\`,
  background: colors.white,
  color: colors.navy,
  borderRadius: "8px",
  padding: "0 12px",
  fontWeight: 800,
  cursor: "pointer",
};

const activeToolbarMenuButtonStyle: CSSProperties = {
  background: colors.goldPale,
  border: \`1px solid \${colors.gold}\`,
};

const managerPanelStyle: CSSProperties = {
  background: colors.white,
  borderBottom: \`1px solid \${colors.border}\`,
  padding: "14px",
  display: "grid",
  gap: "12px",
};

const panelTitleStyle: CSSProperties = {
  fontWeight: 900,
  fontSize: "16px",
};

const panelEyebrowStyle: CSSProperties = {
  color: colors.gold,
  fontFamily: "var(--font-dm-mono), monospace",
  fontSize: "10px",
  letterSpacing: "0.16em",
};

const compactPanelGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr auto",
  gap: "12px",
  alignItems: "end",
};

const panelLabelStyle: CSSProperties = {
  display: "grid",
  gap: "6px",
  fontWeight: 800,
  color: colors.navy,
};

const panelInputStyle: CSSProperties = {
  height: "42px",
  border: \`1px solid \${colors.border}\`,
  borderRadius: "8px",
  padding: "0 10px",
  color: colors.navy,
  background: colors.white,
};

const fieldListStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
};

const availableFieldButtonStyle: CSSProperties = {
  background: colors.cream,
  border: \`1px solid \${colors.border}\`,
  color: colors.navy,
  padding: "12px",
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  textAlign: "left",
  cursor: "pointer",
};

const selectedSortButtonStyle: CSSProperties = {
  background: colors.goldPale,
  border: \`1px solid \${colors.gold}\`,
};

const viewFieldsHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
};

const viewFieldsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
};

const viewFieldsColumnStyle: CSSProperties = {
  background: colors.cream,
  border: \`1px solid \${colors.border}\`,
  padding: "12px",
  display: "grid",
  gap: "10px",
};

const selectedFieldItemStyle: CSSProperties = {
  background: colors.goldPale,
  border: \`1px solid \${colors.gold}\`,
  padding: "12px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const fieldMetaStyle: CSSProperties = {
  display: "block",
  marginTop: "3px",
  color: colors.slate,
  fontSize: "12px",
  fontWeight: 500,
};

const addFieldCircleStyle: CSSProperties = {
  width: "24px",
  height: "24px",
  borderRadius: "999px",
  background: colors.goldPale,
  color: colors.navy,
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
};

const tinyRemoveButtonStyle: CSSProperties = {
  border: "none",
  background: colors.white,
  color: colors.navy,
  borderRadius: "8px",
  padding: "8px 10px",
  fontWeight: 800,
  cursor: "pointer",
};

const emptyFieldBoxStyle: CSSProperties = {
  background: colors.white,
  border: \`1px dashed \${colors.border}\`,
  color: colors.slate,
  padding: "14px",
};

const refreshButtonStyle: CSSProperties = {`
);

fs.writeFileSync(file, code);

console.log("Done. Issues Manager now has Filter, Sort, and View Fields.");