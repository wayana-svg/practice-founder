const fs = require("fs");

const path = "app/daily-physician-tracker-list/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/* Remove the broken old field shown in the error screen */
text = text.replace(
  /\s*,?\s*label:\s*"Old Role Impacted Text",[\s\S]*?showInEditForm:\s*false,?\s*},?/g,
  ""
);

/* Remove any old role_impacted text field block */
text = text.replace(
  /\s*,?\s*{\s*key:\s*"role_impacted"[\s\S]*?},/g,
  ""
);

/* Remove any broken or duplicate role_impacted_id field block */
text = text.replace(
  /\s*,?\s*{\s*key:\s*"role_impacted_id"[\s\S]*?linkedRecord:\s*{[\s\S]*?}\s*,?\s*},/g,
  ""
);

/* Correct linked Roles field */
const correctRoleField = `    {
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
    },
`;

/* Insert before Notes if possible */
if (text.includes('key: "notes"')) {
  text = text.replace(
    /(\s*{\s*key:\s*"notes")/,
    "\n" + correctRoleField + "$1"
  );
} else {
  const fieldsIndex = text.indexOf("fields: [");
  const defaultVisibleIndex = text.indexOf("defaultVisibleFields", fieldsIndex);

  if (fieldsIndex === -1 || defaultVisibleIndex === -1) {
    console.log("Could not find where to insert the role field.");
    process.exit(1);
  }

  const insertPoint = text.lastIndexOf("]", defaultVisibleIndex);

  text = text.slice(0, insertPoint) + "\n" + correctRoleField + text.slice(insertPoint);
}

/* Add it to visible fields if not already there */
if (!text.includes('"role_impacted_id"')) {
  console.log("Role field insertion failed.");
  process.exit(1);
}

if (text.includes("defaultVisibleFields") && !text.includes('"role_impacted_id",')) {
  text = text.replace(
    /defaultVisibleFields:\s*\[/,
    'defaultVisibleFields: [\n    "role_impacted_id",'
  );
}

fs.writeFileSync(path, text);

console.log("Daily Physician Tracker Role Impacted field cleaned and linked to Roles.");