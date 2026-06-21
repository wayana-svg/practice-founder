const fs = require("fs");

const path = "app/issues-list/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Expand IssueTableField so it supports the fields already used by issueTableFields.
*/
text = text.replace(
  /type IssueTableField = {\s*key: string;\s*label: string;\s*type\?: string;\s*description\?: string;\s*};/,
  `type IssueTableField = {
  key: string;
  label: string;
  type?: string;
  description?: string;
  options?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
};`
);

fs.writeFileSync(path, text);

console.log("IssueTableField options type fixed.");