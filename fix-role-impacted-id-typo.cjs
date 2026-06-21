const fs = require("fs");

const path = "app/daily-physician-tracker/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Fix accidental double _id typo.
*/
text = text.replaceAll("role_impacted_id_id", "role_impacted_id");

fs.writeFileSync(path, text);

console.log("role_impacted_id typo fixed.");