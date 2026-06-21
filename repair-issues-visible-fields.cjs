const fs = require("fs");

const file = "app/issues-list/page.tsx";

if (!fs.existsSync(file)) {
  throw new Error("Cannot find app/issues-list/page.tsx");
}

let code = fs.readFileSync(file, "utf8");

if (!code.includes("const visibleTableFields = useMemo")) {
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
}

fs.writeFileSync(file, code);

console.log("Done. Issues visible fields, available fields, and filter options are repaired.");