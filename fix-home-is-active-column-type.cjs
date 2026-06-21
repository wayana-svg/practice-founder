const fs = require("fs");

const path = "app/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Homepage ColumnConfig does not allow boolean.
  Use text for is_active on the homepage preview.
*/
text = text.replace(
  /key:\s*"is_active",\s*\n\s*label:\s*"Active",\s*\n\s*type:\s*"boolean",/g,
  `key: "is_active",
            label: "Active",
            type: "text",`
);

fs.writeFileSync(path, text);

console.log("Homepage is_active column type fixed.");