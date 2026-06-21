const fs = require("fs");

const path = "app/daily-physician-tracker-list/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Fix the extra closing brace after the role_impacted_id linkedRecord block.
  The broken area looks like:
      },
    },
    },
 
    {
      key: "notes",
*/
text = text.replace(
  /(\s*linkedRecord:\s*{[\s\S]*?managerPath:\s*"\/roles-list",\s*}\s*,?\s*}\s*,?)\s*}\s*,\s*(\n\s*{\s*key:\s*"notes")/,
  "$1$2"
);

/*
  More direct fallback: remove one extra object closer before notes.
*/
text = text.replace(
  /(\n\s*}\s*,\s*)\n\s*}\s*,\s*(\n\s*{\s*key:\s*"notes")/,
  "$1$2"
);

fs.writeFileSync(path, text);

console.log("Daily Physician extra brace cleaned.");