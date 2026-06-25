const fs = require("fs");

const path = "middleware.ts";

if (!fs.existsSync(path)) {
  console.log("Could not find middleware.ts");
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

const publicFormsBlock = `const PUBLIC_FORM_PATHS = [
  "/daily-receptionist-tracker",
  "/daily-physician-tracker",
  "/weekly-financial-report",
  "/membership-tracker",
  "/deliverables",
  "/tasks",
  "/issues-breakdowns",
  "/roles",
  "/employees",
  "/ar-report-submissions",
  "/charge-lag",
  "/daily-billing-claims",
  "/daily-operations-logs",
  "/weekly-claims-summary",
];`;

if (!text.includes("PUBLIC_FORM_PATHS")) {
  text = text.replace(
    /const PUBLIC_FILE = \/\\\\\.\(\.\*\)\$\/;/,
    `const PUBLIC_FILE = /\\\\.(.*)$/;

${publicFormsBlock}`
  );
}

if (!text.includes("PUBLIC_FORM_PATHS.includes(pathname)")) {
  text = text.replace(
    /pathname === "\/login" \|\|/,
    `PUBLIC_FORM_PATHS.includes(pathname) ||
    pathname === "/login" ||`
  );
}

fs.writeFileSync(path, text);

console.log("Public Add Record form links allowed.");