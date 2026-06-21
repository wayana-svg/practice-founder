const fs = require("fs");

const path = "app/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Add missing descriptions to the Schedule / app_embeds columns.
*/
text = text.replace(
  /{\s*key:\s*"embed_name",\s*label:\s*"Calendar",\s*type:\s*"text",?\s*}/g,
  `{
            key: "embed_name",
            label: "Calendar",
            type: "text",
            description: "The display name of the calendar block shown in the Schedule dashboard.",
          }`
);

text = text.replace(
  /{\s*key:\s*"embed_type",\s*label:\s*"Type",\s*type:\s*"text",?\s*}/g,
  `{
            key: "embed_type",
            label: "Type",
            type: "text",
            description: "The type of embedded schedule item, such as a Google Calendar embed.",
          }`
);

text = text.replace(
  /{\s*key:\s*"is_active",\s*label:\s*"Active",\s*type:\s*"boolean",?\s*}/g,
  `{
            key: "is_active",
            label: "Active",
            type: "boolean",
            description: "Shows whether this calendar block is active and visible in the Schedule dashboard.",
          }`
);

fs.writeFileSync(path, text);

console.log("Homepage schedule calendar column descriptions added.");