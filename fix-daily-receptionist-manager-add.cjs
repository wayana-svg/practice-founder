const fs = require("fs");

const managerPath = "components/MasterManager.tsx";
const dailyReceptionistPath = "app/daily-receptionist-tracker-list/page.tsx";

if (!fs.existsSync(managerPath)) {
  throw new Error(`Missing file: ${managerPath}`);
}

if (!fs.existsSync(dailyReceptionistPath)) {
  throw new Error(`Missing file: ${dailyReceptionistPath}`);
}

let managerCode = fs.readFileSync(managerPath, "utf8");

if (!managerCode.includes("addPath?: string;")) {
  managerCode = managerCode.replace(
    "  addButtonLabel: string;",
    "  addButtonLabel: string;\n  addPath?: string;"
  );
}

const oldButton = `        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openAddPanel();
          }}
          style={primaryButtonStyle}
        >
          {config.addButtonLabel}
        </button>`;

const newButton = `        {config.addPath ? (
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

if (managerCode.includes(oldButton)) {
  managerCode = managerCode.replace(oldButton, newButton);
} else {
  console.log("Could not find the exact MasterManager Add button block. No button replacement was made.");
}

fs.writeFileSync(managerPath, managerCode);

let dailyReceptionistCode = fs.readFileSync(dailyReceptionistPath, "utf8");

if (!dailyReceptionistCode.includes('addPath: "/daily-receptionist-tracker"')) {
  dailyReceptionistCode = dailyReceptionistCode.replace(
    '  addButtonLabel: "+ Add Daily Receptionist Tracker",',
    '  addButtonLabel: "+ Add Daily Receptionist Tracker",\n  addPath: "/daily-receptionist-tracker",'
  );
}

fs.writeFileSync(dailyReceptionistPath, dailyReceptionistCode);

console.log("Done. Daily Receptionist manager Add button now opens the quick-add page.");