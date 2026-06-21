const fs = require("fs");

const path = "app/tasks-list/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Fix TypeScript issue where activeRecord.id can be typed as boolean.
  Convert it safely before passing to linked record helpers.
*/
text = text.replace(
  /const linkedDeliverableRecords = activeRecord\s*\?\s*linkedDeliverablesForTask\(activeRecord\.id\)\s*:\s*\[\];\s*const linkedIssueRecords = activeRecord\s*\?\s*linkedIssuesForTask\(activeRecord\.id\)\s*:\s*\[\];/,
  `const activeTaskId =
      activeRecord && activeRecord.id !== null && activeRecord.id !== undefined
        ? Number(activeRecord.id)
        : null;

    const linkedDeliverableRecords = activeTaskId
      ? linkedDeliverablesForTask(activeTaskId)
      : [];

    const linkedIssueRecords = activeTaskId
      ? linkedIssuesForTask(activeTaskId)
      : [];`
);

/*
  Fallback for slightly different spacing.
*/
text = text.replace(
  /const linkedDeliverableRecords = activeRecord[\s\S]*?\? linkedDeliverablesForTask\(activeRecord\.id\)[\s\S]*?: \[\];\s*const linkedIssueRecords = activeRecord[\s\S]*?\? linkedIssuesForTask\(activeRecord\.id\)[\s\S]*?: \[\];/,
  `const activeTaskId =
      activeRecord && activeRecord.id !== null && activeRecord.id !== undefined
        ? Number(activeRecord.id)
        : null;

    const linkedDeliverableRecords = activeTaskId
      ? linkedDeliverablesForTask(activeTaskId)
      : [];

    const linkedIssueRecords = activeTaskId
      ? linkedIssuesForTask(activeTaskId)
      : [];`
);

fs.writeFileSync(path, text);

console.log("Tasks activeRecord.id type fixed.");