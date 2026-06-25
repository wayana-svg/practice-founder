const fs = require("fs");

const path = "app/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find app/page.tsx");
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Add Public Form Links as a Business HQ sidebar item.
*/
if (!text.includes('key: "public_form_links"')) {
  const block = `

    {
      key: "public_form_links",
      label: "Public Form Links",
      description:
        "Copy public add-record form links that can be shared without opening the full app.",
      tableName: "form_links",
      managerPath: "/form-links",
      addPath: "/form-links",
      columns: [
        {
          key: "form_name",
          label: "Form",
          type: "text",
          description: "The public form name.",
        },
        {
          key: "form_link",
          label: "Link",
          type: "text",
          description: "The public form link.",
        },
      ],
      defaultColumns: ["form_name", "form_link"],
    },`;

  /*
    Put it near Schedule in Business HQ.
  */
  if (text.includes('key: "schedule_calendar"')) {
    text = text.replace(
      /(\s*{\s*key:\s*"schedule_calendar"[\s\S]*?defaultColumns:\s*\[[\s\S]*?\],\s*},)/,
      `$1${block}`
    );
  } else {
    /*
      Fallback: add it before Roles if Schedule pattern is not found.
    */
    text = text.replace(
      /(\s*{\s*key:\s*"roles")/,
      `${block}
$1`
    );
  }
}

/*
  Remove top button version if it was added beside Open Manager.
*/
text = text.replace(
  /\s*<a href="\/form-links" style=\{secondaryActionStyle\}>\s*Public Form Links\s*<\/a>/g,
  ""
);

fs.writeFileSync(path, text);

console.log("Public Form Links added under Business HQ.");