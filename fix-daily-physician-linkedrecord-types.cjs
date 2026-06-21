const fs = require("fs");

const path = "app/daily-physician-tracker-list/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  MasterManager uses labelField, not titleField.
  Also remove subtitleField if this MasterManager type does not support it.
*/
text = text.replace(/titleField:\s*"role_name",/g, 'labelField: "role_name",');
text = text.replace(/\s*subtitleField:\s*"department",\n/g, "");

fs.writeFileSync(path, text);

console.log("Daily Physician linkedRecord type names fixed.");