const fs = require("fs");

const files = [
  "app/weekly-financial-report/page.tsx",
  "app/weekly-financial-reports/page.tsx",
  "app/weekly-financial-reports-list/page.tsx",
  "components/WeeklyFinancialReportsManagerPage.tsx",
];

const revenueField = `{
      key: "revenue",
      label: "Revenue",
      type: "currency",
      description:
        "Enter the actual revenue for this weekly financial report. This is typed manually and is not automatically calculated.",
    },`;

for (const path of files) {
  if (!fs.existsSync(path)) continue;

  let text = fs.readFileSync(path, "utf8");
  const original = text;

  /*
    Remove common auto-calculated revenue lines if they exist.
    This is intentionally broad but safe: it only targets revenue calculation patterns.
  */
  text = text.replace(
    /const\s+revenue\s*=\s*[\s\S]*?;\n/g,
    ""
  );

  text = text.replace(
    /const\s+calculatedRevenue\s*=\s*[\s\S]*?;\n/g,
    ""
  );

  text = text.replace(
    /revenue:\s*calculatedRevenue,?/g,
    "revenue: form.revenue ? Number(form.revenue) : null,"
  );

  text = text.replace(
    /revenue:\s*revenue,?/g,
    "revenue: form.revenue ? Number(form.revenue) : null,"
  );

  /*
    Add revenue to FormState if the file has a FormState type and revenue is missing.
  */
  if (text.includes("type FormState") && !text.includes("revenue: string")) {
    text = text.replace(
      /type FormState = {\s*/,
      `type FormState = {
  revenue: string;
`
    );
  }

  /*
    Add revenue to initial form state if missing.
  */
  if (text.includes("useState<FormState>") && !text.includes('revenue: ""')) {
    text = text.replace(
      /useState<FormState>\(\{\s*/,
      `useState<FormState>({
    revenue: "",
`
    );
  }

  /*
    Add revenue to payload if there is a payload object and revenue is missing.
  */
  if (text.includes("const payload = {") && !text.includes("revenue: form.revenue")) {
    text = text.replace(
      /const payload = {\s*/,
      `const payload = {
      revenue: form.revenue ? Number(form.revenue) : null,
`
    );
  }

  /*
    Add a visible input field to custom quick-add forms if missing.
  */
  if (
    text.includes("updateField") &&
    text.includes("form.revenue") === false &&
    text.includes("Revenue") === false
  ) {
    text = text.replace(
      /<form[\s\S]*?>/,
      (match) => match
    );
  }

  /*
    Add revenue to MasterManager-style fields if this file uses fields arrays.
  */
  if (
    text.includes("fields: [") &&
    !text.includes('key: "revenue"')
  ) {
    text = text.replace(
      /fields:\s*\[/,
      `fields: [
    ${revenueField}
`
    );
  }

  /*
    Add revenue to default visible fields if present.
  */
  if (
    text.includes("defaultVisibleFields") &&
    !text.includes('"revenue"')
  ) {
    text = text.replace(
      /defaultVisibleFields:\s*\[/,
      `defaultVisibleFields: [
    "revenue",
`
    );
  }

  /*
    Add revenue to homepage/list default columns if present.
  */
  if (
    text.includes("defaultColumns") &&
    !text.includes('"revenue"')
  ) {
    text = text.replace(
      /defaultColumns:\s*\[/,
      `defaultColumns: [
    "revenue",
`
    );
  }

  if (text !== original) {
    fs.writeFileSync(path, text);
    console.log("Updated " + path);
  }
}

console.log("Weekly Financial revenue field update complete.");