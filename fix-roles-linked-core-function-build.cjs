const fs = require("fs");

const path = "app/roles/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  The linked_core_function field was removed from FormState,
  but old helper code still references it.
  Remove the leftover memo block.
*/
text = text.replace(
  /\s*const coreFunctionDescription = useMemo\([\s\S]*?\);\s*/g,
  "\n"
);

/*
  Remove any leftover JSX/help text that prints coreFunctionDescription.
*/
text = text.replace(
  /\s*{coreFunctionDescription\s*\?\s*\([\s\S]*?\)\s*:\s*null}/g,
  ""
);

/*
  Remove any remaining direct references just in case.
*/
text = text.replace(/form\.linked_core_function/g, '""');
text = text.replace(/\[form\.linked_core_function\]/g, "[]");

fs.writeFileSync(path, text);

console.log("Roles linked_core_function leftovers cleaned.");