const fs = require("fs");

const files = [
  "app/daily-receptionist-tracker/page.tsx",
  "app/daily-physician-tracker/page.tsx",
  "app/weekly-financial-report/page.tsx",
  "app/membership-tracker/page.tsx",
  "app/deliverables/page.tsx",
  "app/tasks/page.tsx",
  "app/issues-breakdowns/page.tsx",
  "app/roles/page.tsx",
  "app/employees/page.tsx",
  "app/ar-report-submissions/page.tsx",
  "app/charge-lag/page.tsx",
  "app/daily-billing-claims/page.tsx",
  "app/daily-operations-logs/page.tsx",
  "app/weekly-claims-summary/page.tsx",
];

for (const path of files) {
  if (!fs.existsSync(path)) {
    console.log("Skipped missing " + path);
    continue;
  }

  let text = fs.readFileSync(path, "utf8");
  const original = text;

  /*
    Replace common back links with homepage.
  */
  text = text.replace(/href="\/[^"]*-list"/g, 'href="/"');
  text = text.replace(/href=\{`\/[^`]*-list[^`]*`\}/g, 'href="/"');
  text = text.replace(/href=\{'\/[^']*-list'\}/g, 'href="/"');
  text = text.replace(/href=\{"\/[^"]*-list"\}/g, 'href="/"');

  /*
    Replace router back patterns with homepage push.
  */
  text = text.replace(/router\.back\(\)/g, 'router.push("/")');
  text = text.replace(/window\.history\.back\(\)/g, 'window.location.href = "/"');

  /*
    Replace common button text if it says Back to manager/list.
  */
  text = text.replace(/Back to Manager/g, "Back to Home");
  text = text.replace(/Back to List/g, "Back to Home");
  text = text.replace(/Back to Tracker/g, "Back to Home");
  text = text.replace(/Back to Dashboard/g, "Back to Home");

  if (text !== original) {
    fs.writeFileSync(path, text);
    console.log("Updated " + path);
  }
}

console.log("Add Record back buttons now point to homepage.");