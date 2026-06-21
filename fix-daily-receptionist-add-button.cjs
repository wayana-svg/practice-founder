const fs = require("fs");

const managerFile = "components/MasterManager.tsx";
const receptionistManagerFile = "app/daily-receptionist-tracker-list/page.tsx";

if (!fs.existsSync(managerFile)) {
  throw new Error("Cannot find components/MasterManager.tsx");
}

if (!fs.existsSync(receptionistManagerFile)) {
  throw new Error("Cannot find app/daily-receptionist-tracker-list/page.tsx");
}

let managerCode = fs.readFileSync(managerFile, "utf8");

// Add addPath to the MasterManager config type if it is not already there.
if (!managerCode.includes("addPath?: string;")) {
  managerCode = managerCode.replace(
    "addButtonLabel: string;",
    "addButtonLabel: string;\n  addPath?: string;"
  );
}

// Replace the generic add button with a link when addPath is provided.
const oldAddButtonBlock = `<button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openAddPanel();
          }}
          style={primaryButtonStyle}
        >
          {config.addButtonLabel}
        </button>`;

const newAddButtonBlock = `{config.addPath ? (
          <a
            href={config.addPath}
            onClick={(event) => event.stopPropagation()}
            style={{
              ...primaryButtonStyle,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {config.addButtonLabel}
          </a>
        ) : (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openAddPanel();
            }}
            style={primaryButtonStyle}
          >
            {config.addButtonLabel}
          </button>
        )}`;

if (managerCode.includes(oldAddButtonBlock)) {
  managerCode = managerCode.replace(oldAddButtonBlock, newAddButtonBlock);
} else if (!managerCode.includes("config.addPath ?")) {
  console.log("Could not find the exact Add button block in MasterManager.");
  console.log("If the button does not change, send me your MasterManager.tsx file.");
}

fs.writeFileSync(managerFile, managerCode);

// Add addPath to Daily Receptionist Manager config.
let receptionistCode = fs.readFileSync(receptionistManagerFile, "utf8");

if (!receptionistCode.includes('addPath: "/daily-receptionist-tracker"')) {
  receptionistCode = receptionistCode.replace(
    'addButtonLabel: "+ Add Daily Receptionist Tracker",',
    'addButtonLabel: "+ Add Daily Receptionist Tracker",\n  addPath: "/daily-receptionist-tracker",'
  );
}

fs.writeFileSync(receptionistManagerFile, receptionistCode);

console.log("Done. Daily Receptionist manager Add button now opens the sectioned quick-add page.");