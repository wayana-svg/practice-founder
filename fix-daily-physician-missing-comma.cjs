const fs = require("fs");

const path = "app/daily-physician-tracker-list/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  The role_impacted_id field is missing its closing comma before notes.
*/
text = text.replace(
  /managerPath:\s*"\/roles-list",\s*\n\s*},\s*\n\s*{\s*\n\s*key:\s*"notes"/,
  `managerPath: "/roles-list",
      },
    },
    {
      key: "notes"`
);

fs.writeFileSync(path, text);

console.log("Daily Physician missing comma before Notes fixed.");