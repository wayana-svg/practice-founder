const fs = require("fs");

const path = "app/issues-list/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Add missing IssueTableField type before issueTableFields.
*/
if (!text.includes("type IssueTableField =")) {
  text = text.replace(
    /const issueTableFields: IssueTableField\[\] = \[/,
    `type IssueTableField = {
  key: string;
  label: string;
  type?: string;
  description?: string;
};

const issueTableFields: IssueTableField[] = [`
  );
}

fs.writeFileSync(path, text);

console.log("Missing IssueTableField type added.");