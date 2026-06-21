const fs = require("fs");

const path = "app/daily-physician-tracker-list/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Clean the linkedRecord block for role_impacted_id.
  MasterManager LinkedRecordConfig accepts tableName, primaryKey, title, labelField,
  description, and fields. It does not accept managerPath/titleField/subtitleField.
*/
text = text.replace(
  /linkedRecord:\s*{[\s\S]*?tableName:\s*"roles",[\s\S]*?primaryKey:\s*"id",[\s\S]*?labelField:\s*"role_name",[\s\S]*?},/,
  `linkedRecord: {
        tableName: "roles",
        primaryKey: "id",
        title: "Role",
        labelField: "role_name",
        description: "Open the connected role record.",
        fields: [
          { key: "id", label: "Role ID", type: "text" },
          { key: "role_name", label: "Role Name", type: "text" },
          { key: "role_status", label: "Role Status", type: "text" },
          { key: "must_log", label: "Must Log?", type: "text" },
          { key: "time_limit", label: "Time Limit", type: "text" },
          { key: "notes", label: "Notes", type: "text" },
        ],
      },`
);

/*
  Remove any leftover managerPath/titleField/subtitleField just in case.
*/
text = text.replace(/\s*managerPath:\s*"\/roles-list",/g, "");
text = text.replace(/\s*titleField:\s*"role_name",/g, "");
text = text.replace(/\s*subtitleField:\s*"department",/g, "");

fs.writeFileSync(path, text);

console.log("Daily Physician role linkedRecord config cleaned.");