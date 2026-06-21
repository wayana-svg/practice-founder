const fs = require("fs");

const path = "components/MasterManager.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  LinkedRecordConfig supports labelField, not titleField/subtitleField.
  Remove unsupported property references from helper functions.
*/
text = text.replace(
  /return \(\s*field\.linkedRecord\?\.labelField\s*\|\|\s*field\.linkedRecord\?\.titleField\s*\|\|\s*field\.linkedRecord\?\.subtitleField\s*\|\|\s*"id"\s*\);/,
  `return field.linkedRecord?.labelField || "id";`
);

text = text.replace(
  /function getLinkedRecordSubtitleField\(field: ManagerField\) {\s*return field\.linkedRecord\?\.subtitleField \|\| "";\s*}/,
  `function getLinkedRecordSubtitleField(field: ManagerField) {
    return "";
  }`
);

/*
  Extra safety remove any direct unsupported references.
*/
text = text.replace(/field\.linkedRecord\?\.titleField/g, "undefined");
text = text.replace(/field\.linkedRecord\?\.subtitleField/g, "undefined");

fs.writeFileSync(path, text);

console.log("MasterManager unsupported linkedRecord fields removed.");