const fs = require("fs");

const files = [
  "app/weekly-financial-report/page.tsx",
  "app/weekly-financial-reports/page.tsx",
  "app/weekly-financial-reports-list/page.tsx",
  "components/WeeklyFinancialReportsManagerPage.tsx",
];

const fieldBlock = `{
      key: "revenue_collected",
      label: "Revenue Collected",
      type: "currency",
      description:
        "Enter the amount of revenue actually collected for this week. This is typed manually.",
    },`;

for (const path of files) {
  if (!fs.existsSync(path)) continue;

  let text = fs.readFileSync(path, "utf8");
  const original = text;

  if (text.includes("type FormState") && !text.includes("revenue_collected: string")) {
    text = text.replace(
      /type FormState = {\s*/,
      `type FormState = {
  revenue_collected: string;
`
    );
  }

  if (text.includes("const emptyForm: FormState = {") && !text.includes('revenue_collected: "",')) {
    text = text.replace(
      /const emptyForm: FormState = {\s*/,
      `const emptyForm: FormState = {
  revenue_collected: "",
`
    );
  }

  if (text.includes("useState<FormState>") && !text.includes('revenue_collected: ""')) {
    text = text.replace(
      /useState<FormState>\(\{\s*/,
      `useState<FormState>({
    revenue_collected: "",
`
    );
  }

  if (text.includes("const payload = {") && !text.includes("revenue_collected: form.revenue_collected")) {
    text = text.replace(
      /const payload = {\s*/,
      `const payload = {
      revenue_collected: form.revenue_collected ? Number(form.revenue_collected) : null,
`
    );
  }

  if (text.includes("fields: [") && !text.includes('key: "revenue_collected"')) {
    if (text.includes('key: "revenue"')) {
      text = text.replace(
        /({\s*key:\s*"revenue"[\s\S]*?\n\s*},)/,
        `$1
    ${fieldBlock}`
      );
    } else {
      text = text.replace(
        /fields:\s*\[/,
        `fields: [
    ${fieldBlock}
`
      );
    }
  }

  if (text.includes("defaultVisibleFields") && !text.includes('"revenue_collected"')) {
    if (text.includes('"revenue"')) {
      text = text.replace(
        /"revenue",/,
        `"revenue",
    "revenue_collected",`
      );
    } else {
      text = text.replace(
        /defaultVisibleFields:\s*\[/,
        `defaultVisibleFields: [
    "revenue_collected",
`
      );
    }
  }

  if (text.includes("defaultColumns") && !text.includes('"revenue_collected"')) {
    if (text.includes('"revenue"')) {
      text = text.replace(
        /"revenue",/,
        `"revenue",
    "revenue_collected",`
      );
    } else {
      text = text.replace(
        /defaultColumns:\s*\[/,
        `defaultColumns: [
    "revenue_collected",
`
      );
    }
  }

  if (text !== original) {
    fs.writeFileSync(path, text);
    console.log("Updated " + path);
  }
}

console.log("Weekly Financial revenue_collected field update complete.");