const fs = require("fs");

const path = "components/MasterManager.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Fix linked-record select onChange type.
  renderInput expects string values here, so do not pass Number/null.
*/
text = text.replace(
  /onChange=\{\(event\) => onChange\(event\.target\.value \? Number\(event\.target\.value\) : null\)\}/g,
  `onChange={(event) => onChange(event.target.value)}`
);

fs.writeFileSync(path, text);

console.log("MasterManager linked select onChange fixed.");