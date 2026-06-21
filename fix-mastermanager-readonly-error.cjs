const fs = require("fs");

const path = "components/MasterManager.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  The linked-record dropdown was added inside renderInput,
  but renderInput does not have a readOnly variable.
  Remove the bad disabled line.
*/
text = text.replace(/\s*disabled={readOnly}/g, "");

fs.writeFileSync(path, text);

console.log("Removed bad readOnly reference from MasterManager.");