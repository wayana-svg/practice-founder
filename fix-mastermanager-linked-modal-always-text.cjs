const fs = require("fs");

const path = "components/MasterManager.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  For linked record popup display, always format as text.
  This avoids unsupported field types like number, select, textarea, url, smart_due_date.
*/
text = text.replace(
  /formatLinkedRecordValue\(\s*linkedRecordModal\.record\?\.\[field\.key\] \?\? null,\s*[\s\S]*?\)/,
  `formatLinkedRecordValue(
                        linkedRecordModal.record?.[field.key] ?? null,
                        "text"
                      )`
);

fs.writeFileSync(path, text);

console.log("MasterManager linked modal now formats values as text.");