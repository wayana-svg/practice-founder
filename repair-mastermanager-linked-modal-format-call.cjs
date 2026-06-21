const fs = require("fs");

const path = "components/MasterManager.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

const startNeedle = "{formatLinkedRecordValue(";
const recordNeedle = "linkedRecordModal.record?.[field.key]";

let start = text.indexOf(startNeedle);

while (start !== -1) {
  const searchWindow = text.slice(start, start + 800);

  if (searchWindow.includes(recordNeedle)) {
    const end = text.indexOf(")}", start);

    if (end === -1) {
      console.log("Could not find the end of the formatLinkedRecordValue call.");
      process.exit(1);
    }

    const replacement = `{formatLinkedRecordValue(
                        linkedRecordModal.record?.[field.key] ?? null,
                        "text"
                      )}`;

    text = text.slice(0, start) + replacement + text.slice(end + 2);
    break;
  }

  start = text.indexOf(startNeedle, start + startNeedle.length);
}

fs.writeFileSync(path, text);

console.log("MasterManager linked modal format call repaired.");