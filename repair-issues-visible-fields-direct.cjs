const fs = require("fs");

const file = "app/issues-list/page.tsx";

if (!fs.existsSync(file)) {
  throw new Error("Cannot find app/issues-list/page.tsx");
}

let code = fs.readFileSync(file, "utf8");

const insertBlock = `  const visibleTableFields = issueTableFields.filter((field) =>
    visibleFieldKeys.includes(field.key)
  );

  const availableTableFields = issueTableFields.filter(
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

`;

if (!code.includes("const visibleTableFields = issueTableFields.filter")) {
  code = code.replace(`  const metrics = [`, `${insertBlock}  const metrics = [`);
}

fs.writeFileSync(file, code);

console.log("Done. Direct visibleTableFields repair added.");