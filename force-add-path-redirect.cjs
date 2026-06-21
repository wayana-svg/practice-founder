const fs = require("fs");

const masterFile = "components/MasterManager.tsx";
const receptionistFile = "app/daily-receptionist-tracker-list/page.tsx";

if (!fs.existsSync(masterFile)) {
  throw new Error("Cannot find components/MasterManager.tsx");
}

if (!fs.existsSync(receptionistFile)) {
  throw new Error("Cannot find app/daily-receptionist-tracker-list/page.tsx");
}

let masterCode = fs.readFileSync(masterFile, "utf8");

if (!masterCode.includes("addPath?: string;")) {
  masterCode = masterCode.replace(
    "addButtonLabel: string;",
    "addButtonLabel: string;\n  addPath?: string;"
  );
}

if (!masterCode.includes("window.location.href = config.addPath;")) {
  masterCode = masterCode.replace(
    "  function openAddPanel() {\n    setMessage(\"\");",
    `  function openAddPanel() {
    if (config.addPath && typeof window !== "undefined") {
      window.location.href = config.addPath;
      return;
    }

    setMessage("");`
  );
}

fs.writeFileSync(masterFile, masterCode);

let receptionistCode = fs.readFileSync(receptionistFile, "utf8");

if (!receptionistCode.includes('addPath: "/daily-receptionist-tracker"')) {
  receptionistCode = receptionistCode.replace(
    'addButtonLabel: "+ Add Daily Receptionist Tracker",',
    'addButtonLabel: "+ Add Daily Receptionist Tracker",\n  addPath: "/daily-receptionist-tracker",'
  );
}

fs.writeFileSync(receptionistFile, receptionistCode);

console.log("Done. Any manager with addPath now redirects to its quick-add page.");