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
    /addButtonLabel:\s*string;/,
    "addButtonLabel: string;\n  addPath?: string;"
  );
}

if (!masterCode.includes("window.location.href = config.addPath;")) {
  masterCode = masterCode.replace(
    /function openAddPanel\(\)\s*\{\s*setMessage\(""\);\s*setErrorMessage\(""\);/,
    `function openAddPanel() {
    if (config.addPath && typeof window !== "undefined") {
      window.location.href = config.addPath;
      return;
    }

    setMessage("");
    setErrorMessage("");`
  );
}

if (!masterCode.includes("window.location.href = config.addPath;")) {
  throw new Error("The redirect was not inserted into MasterManager.tsx");
}

fs.writeFileSync(masterFile, masterCode);

let receptionistCode = fs.readFileSync(receptionistFile, "utf8");

if (!receptionistCode.includes('addPath: "/daily-receptionist-tracker"')) {
  receptionistCode = receptionistCode.replace(
    /addButtonLabel:\s*"\+ Add Daily Receptionist Tracker",/,
    'addButtonLabel: "+ Add Daily Receptionist Tracker",\n  addPath: "/daily-receptionist-tracker",'
  );
}

if (!receptionistCode.includes('addPath: "/daily-receptionist-tracker"')) {
  throw new Error("The addPath was not inserted into the Daily Receptionist manager config");
}

fs.writeFileSync(receptionistFile, receptionistCode);

console.log("Done. Daily Receptionist manager Add now redirects to the sectioned quick-add page.");