const fs = require("fs");

const path = "app/weekly-financial-report/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Add revenue to the emptyForm object if it is missing.
*/
if (!text.includes('revenue: "",')) {
  text = text.replace(
    /const emptyForm: FormState = {\s*/,
    `const emptyForm: FormState = {
  revenue: "",
`
  );
}

fs.writeFileSync(path, text);

console.log("Weekly Financial emptyForm revenue fixed.");