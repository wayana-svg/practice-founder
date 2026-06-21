const fs = require("fs");

const path = "app/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find app/page.tsx");
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

if (text.includes('key: "schedule_calendar"')) {
  console.log("Schedule Calendar is already on the homepage.");
  process.exit(0);
}

const newBlock = `{
    key: "schedule_calendar",
    label: "Schedule Calendar",
    description:
      "View the shared Google Calendar schedule and update the embedded calendar link.",
    tableName: "app_embeds",
    managerPath: "/schedule-calendar",
    addPath: "/calendar-settings",
    columns: [
      {
        key: "embed_name",
        label: "Calendar",
        type: "text",
      },
      {
        key: "embed_type",
        label: "Type",
        type: "text",
      },
      {
        key: "is_active",
        label: "Active",
        type: "boolean",
      },
    ],
    defaultColumns: ["embed_name", "embed_type", "is_active"],
  },`;

const businessHqIndex = text.indexOf('label: "Business HQ"');

if (businessHqIndex === -1) {
  console.log("Could not find Business HQ section.");
  process.exit(1);
}

const nextSectionIndex = text.indexOf('label: "', businessHqIndex + 20);
const insertPoint = text.indexOf("]", businessHqIndex);

if (insertPoint === -1) {
  console.log("Could not find where to insert Schedule Calendar.");
  process.exit(1);
}

text = text.slice(0, insertPoint) + "\n  " + newBlock + "\n" + text.slice(insertPoint);

fs.writeFileSync(path, text);

console.log("Schedule Calendar added to the Business HQ section.");