const fs = require("fs");

const homeFile = "app/page.tsx";

if (!fs.existsSync(homeFile)) {
  throw new Error("Cannot find app/page.tsx");
}

let code = fs.readFileSync(homeFile, "utf8");

code = code.replaceAll('addPath: "/roles-list?add=1"', 'addPath: "/roles"');
code = code.replaceAll('addPath: "/roles-list"', 'addPath: "/roles"');

fs.writeFileSync(homeFile, code);

console.log("Done. Homepage Roles Add Record now opens /roles.");