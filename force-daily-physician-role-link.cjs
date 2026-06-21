const fs = require("fs");

const path = "app/daily-physician-tracker-list/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

const correctField = `{
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

/*
  Replace any existing role_impacted_id field block.
*/
const roleIdFieldRegex = /{\s*key:\s*"role_impacted_id"[\s\S]*?},/;

if (roleIdFieldRegex.test(text)) {
  text = text.replace(roleIdFieldRegex, correctField + ",");
} else {
  /*
    If role_impacted_id is missing, insert before notes.
  */
  text = text.replace(
    /(\s*{\s*key:\s*"notes")/,
    "\n    " + correctField + ",\n$1"
  );
}

/*
  Remove old employee-style role impacted field if it exists.
*/
text = text.replace(
  /\s*{\s*key:\s*"role_impacted"[\s\S]*?},/g,
  ""
);

/*
  Make sure visible fields uses role_impacted_id, not role_impacted.
*/
text = text.replaceAll('"role_impacted"', '"role_impacted_id"');

fs.writeFileSync(path, text);

console.log("Role Impacted now forced to roles linkedRecord.");