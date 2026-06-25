const fs = require("fs");

const path = "app/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find app/page.tsx");
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Add Public Form Links button near the homepage top actions.
*/
if (!text.includes('href="/form-links"')) {
  text = text.replace(
    /(<a\s+href=\{selectedTable\.managerPath\}[\s\S]*?Open Manager[\s\S]*?<\/a>)/,
    `$1

  <a href="/form-links" style={secondaryActionStyle}>
    Public Form Links
  </a>`
  );
}

fs.writeFileSync(path, text);

console.log("Public Form Links button added to homepage.");