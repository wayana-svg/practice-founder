const fs = require("fs");

const file = "app/issues-list/page.tsx";

if (!fs.existsSync(file)) {
  throw new Error("Cannot find app/issues-list/page.tsx");
}

let code = fs.readFileSync(file, "utf8");

code = code.replace(
  `          <button type="button" onClick={openAddModal} style={primaryButtonStyle}>
            + Add Issue
          </button>`,
  `          <a href="/issues-breakdowns" style={primaryButtonStyle}>
            + Add Issue
          </a>`
);

fs.writeFileSync(file, code);

console.log("Done. Issues Manager + Add Issue now opens /issues-breakdowns.");