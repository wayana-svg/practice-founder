const fs = require("fs");

const path = "components/MasterManager.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Cast the linked modal fallback type so TypeScript accepts it.
*/
text = text.replaceAll(
  'field.type || "text"',
  '((field.type || "text") as ManagerField["type"])'
);

fs.writeFileSync(path, text);

console.log("MasterManager linked modal type cast fixed.");