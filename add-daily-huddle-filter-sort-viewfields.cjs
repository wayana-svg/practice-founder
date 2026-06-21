const fs = require("fs");

const file = "app/daily-operations-logs-list/page.tsx";

if (!fs.existsSync(file)) {
  throw new Error("Cannot find app/daily-operations-logs-list/page.tsx");
}

let code = fs.readFileSync(file, "utf8");

function insertBefore(marker, text) {
  if (!code.includes(marker)) {
    throw new Error("Could not find marker: " + marker);
  }

  code = code.replace(marker, text + marker);
}

function replaceBetween(startText, endText, replacement) {
  const start = code.indexOf(startText);
  const end = code.indexOf(endText, start);

  if (start === -1 || end === -1) {
    throw new Error("Could not find block between markers.");
  }

  code = code.slice(0, start) + replacement + code.slice(end);
}

if (!code.includes("type DailyOperationsTableField")) {
  code = code.replace(
    `type ActiveCell = {
  rowId: string;
  fieldKey: string;
} | null;`,
    `type ActiveCell = {
  rowId: string;
  fieldKey: string;
} | null;

type DailyOperationsTableField = {
  key: string;
  label: string;
  description: string;
  type: "text" | "date" | "time" | "datetime" | "select" | "boolean";
};`
  );
}

if (!code.includes("const defaultDailyOperationsFieldKeys")) {
  insertBefore(
    `const booleanFields = new Set([`,
    `const defaultDailyOperationsFieldKeys = [
  "log_date",
  "overall_status",
  "opening_time_submitted",
  "huddle_completed",
  "closeout_completed",
  "final_verified_at",
];

function humanizeFieldKey(key: string) {
  return key
    .replace(/^opening_/, "Opening ")
    .replace(/^huddle_/, "Huddle ")
    .replace(/^closeout_/, "Closeout ")
    .replace(/_/g, " ")
    .replace(/\\b\\w/g, (letter) => letter.toUpperCase());
}

function getDailyOperationsFieldDescription(key: string) {
  if (key === "log_date") return "The date this daily huddle / operations log belongs to.";
  if (key === "overall_status") return "The overall status of the daily operations log.";
  if (key === "opening_time_submitted") return "The time the opening checklist was submitted.";
  if (key === "huddle_completed") return "Whether the daily huddle section was completed.";
  if (key === "closeout_completed") return "Whether the end-of-day closeout was completed.";
  if (key === "final_verified_at") return "The date and time the record was finally verified.";
  if (key.includes("notes")) return "Notes recorded for this daily operations log.";
  if (key.includes("issue")) return "Issue, blocker, or concern captured during the daily huddle.";
  if (key.includes("action")) return "Action item or follow-up captured during the daily huddle.";
  if (key.includes("present")) return "Whether this person was present for the huddle.";
  if (key.includes("completed")) return "Whether this checklist item was completed.";
  if (key.includes("reviewed")) return "Whether this item was reviewed.";
  if (key.includes("identified")) return "Whether this item was identified.";
  if (key.includes("confirmed")) return "Whether this item was confirmed.";
  return "Daily huddle / daily operations field.";
}

`
  );
}

if (!code.includes("const [activeMenu, setActiveMenu]")) {
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
  const [visibleFieldKeys, setVisibleFieldKeys] = useState<string[]>(
    defaultDailyOperationsFieldKeys
  );
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);`
  );
}

if (!code.includes("const tableFields = useMemo")) {
  const startText = `  const filteredRows = useMemo(() => {`;
  const endText = `  const allVisibleSelected =`;

  const replacement = `  const tableFields = useMemo(() => {
    return dailyOperationsLogFieldKeys
      .filter((key) => key !== "id" && key !== "created_at")
      .map((key) => {
        const editableField = editableCellFields.find((field) => field.key === key);

        let type: DailyOperationsTableField["type"] = "text";

        if (booleanFields.has(key)) {
          type = "boolean";
        }

        if (editableField?.type === "date") {
          type = "date";
        }

        if (editableField?.type === "time") {
          type = "time";
        }

        if (editableField?.type === "datetime") {
          type = "datetime";
        }

        if (editableField?.type === "select") {
          type = booleanFields.has(key) ? "boolean" : "select";
        }

        return {
          key,
          label: humanizeFieldKey(key),
          description: getDailyOperationsFieldDescription(key),
          type,
        };
      });
  }, []);

  const visibleTableFields = tableFields.filter((field) =>
    visibleFieldKeys.includes(field.key)
  );

  const availableTableFields = tableFields.filter(
    (field) => !visibleFieldKeys.includes(field.key)
  );

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
  }, [rows, filterField]);

  const filteredRows = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    let nextRows = [...rows];

    if (search) {
      nextRows = nextRows.filter((row) =>
        dailyOperationsLogFieldKeys
          .map((key) => String(row[key] || "").toLowerCase())
          .some((value) => value.includes(search))
      );
    }

    if (filterField && filterValue) {
      nextRows = nextRows.filter(
        (row) => String(row[filterField] || "") === filterValue
      );
    }

    if (sortBy) {
      const sortField = tableFields.find((field) => field.key === sortBy);

      nextRows.sort((firstRow, secondRow) => {
        const firstValue = firstRow[sortBy];
        const secondValue = secondRow[sortBy];

        if (sortBy === "id") {
          return Number(secondValue || 0) - Number(firstValue || 0);
        }

        if (
          sortField?.type === "date" ||
          sortField?.type === "time" ||
          sortField?.type === "datetime"
        ) {
          return String(secondValue || "").localeCompare(String(firstValue || ""));
        }

        return String(firstValue || "").localeCompare(String(secondValue || ""));
      });
    }

    return nextRows;
  }, [rows, searchText, filterField, filterValue, sortBy, tableFields]);

`;

  replaceBetween(startText, endText, replacement);
}

if (!code.includes("function renderTableCell")) {
  code = code.replace(
    `  function renderEditableCell(row: RowData, fieldKey: string, displayValue: string) {`,
    `  function renderTableCell(row: RowData, field: DailyOperationsTableField) {
    const value = row[field.key];

    if (field.key === "log_date") {
      return renderEditableCell(row, "log_date", formatDate(value));
    }

    if (field.key === "overall_status") {
      return renderEditableCell(
        row,
        "overall_status",
        String(value || "In Progress")
      );
    }

    if (field.key === "opening_time_submitted") {
      return renderEditableCell(
        row,
        "opening_time_submitted",
        value ? "Submitted " + formatTime(value) : "In Progress"
      );
    }

    if (field.key === "huddle_completed") {
      return renderEditableCell(
        row,
        "huddle_completed",
        valueIsTrue(value) ? "Yes" : "No"
      );
    }

    if (field.key === "closeout_completed") {
      return renderEditableCell(
        row,
        "closeout_completed",
        valueIsTrue(value) ? "Yes" : "No"
      );
    }

    if (field.key === "final_verified_at") {
      return renderEditableCell(
        row,
        "final_verified_at",
        value ? formatDate(value) : "—"
      );
    }

    if (field.type === "boolean") {
      return valueIsTrue(value) ? "Yes" : "No";
    }

    if (field.type === "date") {
      return formatDate(value);
    }

    if (field.type === "time") {
      return formatTime(value);
    }

    if (field.type === "datetime") {
      return value ? String(value).replace("T", " ").slice(0, 16) : "—";
    }

    if (value === null || value === undefined || value === "") {
      return "—";
    }

    return String(value);
  }

  function renderEditableCell(row: RowData, fieldKey: string, displayValue: string) {`
  );
}

code = code.replace(
  `          <button
            type="button"
            onClick={() => setAddOpen(true)}
            style={primaryButtonStyle}
          >
            + Add Daily Operations Log
          </button>`,
  `          <a href="/daily-operations-logs" style={primaryButtonStyle}>
            + Add Daily Operations Log
          </a>`
);

if (!code.includes("Filter Daily Huddle Logs")) {
  const toolbarStart = `        <div style={toolbarStyle}>`;
  const toolbarEnd = `        {selectedRowIds.length > 0 ? (`;

  const toolbarReplacement = `        <div style={toolbarStyle}>
          <div style={searchBoxStyle}>
            <span>⌕</span>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Find daily operations logs"
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

          <button type="button" onClick={loadRows} style={refreshButtonStyle}>
            Refresh
          </button>
        </div>

        {activeMenu === "filter" ? (
          <div style={managerPanelStyle}>
            <div style={panelTitleStyle}>Filter Daily Huddle Logs</div>

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
                  {tableFields.map((field) => (
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
            <div style={panelTitleStyle}>Sort Daily Huddle Logs</div>

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
                  <small style={fieldMetaStyle}>Sort by newest record first.</small>
                </span>
              </button>

              {tableFields.map((field) => (
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
                    setVisibleFieldKeys(tableFields.map((field) => field.key))
                  }
                  style={secondaryButtonStyle}
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setVisibleFieldKeys(defaultDailyOperationsFieldKeys)
                  }
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
                    <div
                      key={field.key}
                      title={field.description}
                      style={selectedFieldItemStyle}
                    >
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
        ) : null}

`;

  replaceBetween(toolbarStart, toolbarEnd, toolbarReplacement);
}

code = code.replace(
  `                  <th style={thStyle}>Log Date</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Opening</th>
                  <th style={thStyle}>Huddle</th>
                  <th style={thStyle}>Closeout</th>
                  <th style={thStyle}>Final Verified</th>`,
  `                  {visibleTableFields.map((field) => (
                    <th key={field.key} style={thStyle} title={field.description}>
                      {field.label}
                    </th>
                  ))}`
);

if (!code.includes("renderTableCell(row, field)")) {
  const cellStart = code.indexOf(`                      <td style={tdStyle}>
                        {renderEditableCell(row, "log_date"`);
  const cellEnd = code.indexOf(`                      <td style={tdStyle}>
                        <div
                          style={actionMenuWrapStyle}`, cellStart);

  if (cellStart === -1 || cellEnd === -1) {
    throw new Error("Could not find the Daily Huddle table cell block.");
  }

  code =
    code.slice(0, cellStart) +
    `                      {visibleTableFields.map((field) => (
                        <td key={field.key} style={tdStyle} title={field.description}>
                          {renderTableCell(row, field)}
                        </td>
                      ))}

` +
    code.slice(cellEnd);
}

if (!code.includes("const toolbarMenuButtonStyle")) {
  code = code.replace(
    `const refreshButtonStyle: CSSProperties = {`,
    `const toolbarMenuButtonStyle: CSSProperties = {
  height: "34px",
  border: "1px solid " + colors.border,
  background: colors.white,
  color: colors.navy,
  borderRadius: "8px",
  padding: "0 12px",
  fontWeight: 800,
  cursor: "pointer",
};

const activeToolbarMenuButtonStyle: CSSProperties = {
  background: colors.goldPale,
  border: "1px solid " + colors.gold,
};

const managerPanelStyle: CSSProperties = {
  background: colors.white,
  borderBottom: "1px solid " + colors.border,
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
  border: "1px solid " + colors.border,
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
  border: "1px solid " + colors.border,
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
  border: "1px solid " + colors.gold,
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
  border: "1px solid " + colors.border,
  padding: "12px",
  display: "grid",
  gap: "10px",
};

const selectedFieldItemStyle: CSSProperties = {
  background: colors.goldPale,
  border: "1px solid " + colors.gold,
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
  border: "1px dashed " + colors.border,
  color: colors.slate,
  padding: "14px",
};

const refreshButtonStyle: CSSProperties = {`
  );
}

code = code.replace(
  `const primaryButtonStyle: CSSProperties = {
  background: colors.gold,
  color: colors.navy,
  border: "none",
  borderRadius: "10px",
  padding: "12px 16px",
  fontWeight: 900,
  cursor: "pointer",
};`,
  `const primaryButtonStyle: CSSProperties = {
  background: colors.gold,
  color: colors.navy,
  border: "none",
  borderRadius: "10px",
  padding: "12px 16px",
  fontWeight: 900,
  cursor: "pointer",
  textDecoration: "none",
};`
);

fs.writeFileSync(file, code);

console.log("Done. Daily Huddle manager now has Add routing, Filter, Sort, and View Fields.");