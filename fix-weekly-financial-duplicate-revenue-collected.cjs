const fs = require("fs");

const path = "app/weekly-financial-report/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Remove old auto-calculated revenueCollected helper if it exists.
*/
text = text.replace(/const revenueCollected\s*=\s*[\s\S]*?;\n/g, "");

/*
  Replace any payload line using revenueCollected with the manual form value.
*/
text = text.replace(
  /revenue_collected:\s*revenueCollected,?/g,
  "revenue_collected: form.revenue_collected ? Number(form.revenue_collected) : null,"
);

/*
  If the payload now has duplicate revenue_collected lines,
  keep only the first one.
*/
const lines = text.split(/\r?\n/);
let seenPayloadRevenueCollected = false;
const cleaned = [];

for (const line of lines) {
  if (line.includes("revenue_collected:")) {
    if (seenPayloadRevenueCollected) {
      continue;
    }
    seenPayloadRevenueCollected = true;
  }

  cleaned.push(line);
}

fs.writeFileSync(path, cleaned.join("\n"));

console.log("Duplicate revenue_collected payload line fixed.");