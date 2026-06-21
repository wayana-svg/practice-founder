const fs = require("fs");

const path = "app/daily-physician-tracker-list/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Fix the accidental double opening brace:
  {
    {
      key: "role_impacted_id",
*/
text = text.replace(
  /{\s*{\s*key:\s*"role_impacted_id"/g,
  '{\n      key: "role_impacted_id"'
);

/*
  Make sure Role Impacted links to roles, not employees.
  This replaces the role_impacted_id field block if it exists.
*/
const roleFieldRegex =
  /{\s*key:\s*"role_impacted_id"[\s\S]*?linkedRecord:\s*{[\s\S]*?}\s*,?\s*}/;

const correctRoleField = `{
      key: "role_impacted_id",
      label: "Role Impacted",
      type: "number",
      description:
        "The role affected by this physician tracker entry. This links to the Roles table so the linked role can be opened and reviewed.",
      linkedRecord: {
        tableName: "roles",
        primaryKey: "id",
        titleField: "role_name",
        subtitleField: "department",
        managerPath: "/roles-list",
      },
    }`;

if (roleFieldRegex.test(text)) {
  text = text.replace(roleFieldRegex, correctRoleField);
} else {
  console.log("Could not find the full role_impacted_id field block. Only fixed the extra brace.");
}

fs.writeFileSync(path, text);

console.log("Daily Physician Tracker role link field fixed.");