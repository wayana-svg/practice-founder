const fs = require("fs");

const path = "components/MasterManager.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  In the linked record modal, fallback fields are created from Object.keys().
  TypeScript inferred only { key, label }, but formatLinkedRecordValue expects type too.
*/
text = text.replace(
  /Object\.keys\(linkedRecordModal\.record\)\.map\(\(key\) => \(\{\s*key,\s*label: key,\s*}\)\)/g,
  `Object.keys(linkedRecordModal.record).map((key) => ({
                    key,
                    label: key,
                    type: "text",
                  }))`
);

/*
  Extra safety: if field.type is still too strict, default it.
*/
text = text.replace(
  /formatLinkedRecordValue\(\s*linkedRecordModal\.record\?\.\[field\.key\] \?\? null,\s*field\.type\s*\)/g,
  `formatLinkedRecordValue(
                        linkedRecordModal.record?.[field.key] ?? null,
                        field.type || "text"
                      )`
);

fs.writeFileSync(path, text);

console.log("MasterManager linked modal field type fixed.");