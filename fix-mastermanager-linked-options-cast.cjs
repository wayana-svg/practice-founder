const fs = require("fs");

const path = "components/MasterManager.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Fix strict TypeScript cast for linked-record dropdown options.
*/
text = text.replaceAll(
  "((data || []) as RowData[]).map",
  "((data || []) as unknown as RowData[]).map"
);

fs.writeFileSync(path, text);

console.log("MasterManager linked options cast fixed.");