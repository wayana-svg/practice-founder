const fs = require("fs");

const path = "app/daily-physician-tracker-list/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Remove broken leftover legacy role field lines.
  This targets the orphaned description shown on the red error screen.
*/
text = text.replace(
  /\s*description:\s*\n\s*"Legacy text field from the old dropdown[\s\S]*?},?\s*/g,
  "\n"
);

/*
  Also remove any remaining old role text field if it still exists.
*/
text = text.replace(
  /\s*{\s*key:\s*"role_impacted"[\s\S]*?Legacy text field from the old dropdown[\s\S]*?},?\s*/g,
  "\n"
);

/*
  Make sure there is a comma between field objects when one object ends and the next starts.
*/
text = text.replace(/(\n\s*})\s*\n(\s*{)/g, "$1,\n$2");

/*
  Clean accidental double commas.
*/
text = text.replace(/,\s*,/g, ",");

fs.writeFileSync(path, text);

console.log("Legacy role description cleanup complete.");