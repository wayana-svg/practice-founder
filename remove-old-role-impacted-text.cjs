const fs = require("fs");

const path = "app/daily-physician-tracker-list/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let lines = fs.readFileSync(path, "utf8").split(/\r?\n/);

const cleaned = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes('label: "Old Role Impacted Text"')) {
    while (
      i < lines.length &&
      !lines[i].includes("showInEditForm")
    ) {
      i++;
    }

    if (i < lines.length && lines[i].includes("showInEditForm")) {
      i++;
    }

    if (i < lines.length && lines[i].trim().startsWith("},")) {
      continue;
    }

    if (i < lines.length && lines[i].trim() === "}") {
      continue;
    }

    i--;
    continue;
  }

  cleaned.push(line);
}

let text = cleaned.join("\n");

/* Fix missing comma after staffing issue field if needed */
text = text.replace(
  /("Choose Yes if a staffing issue affected patient flow, coverage, or physician availability\."\s*\n\s*})\s*\n\s*{/,
  '$1,\n    {'
);

/* Fix accidental double comma */
text = text.replace(/},\s*,/g, "},");

fs.writeFileSync(path, text);

console.log("Old Role Impacted Text leftovers removed.");