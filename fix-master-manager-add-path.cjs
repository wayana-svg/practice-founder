const fs = require("fs");

const managerFile = "components/MasterManager.tsx";

if (!fs.existsSync(managerFile)) {
  throw new Error("Cannot find components/MasterManager.tsx");
}

let code = fs.readFileSync(managerFile, "utf8");

const oldBlock = `          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openAddPanel();
            }}
            style={primaryButtonStyle}
          >
            {config.addButtonLabel}
          </button>`;

const newBlock = `          {config.addPath ? (
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

if (!code.includes(oldBlock)) {
  throw new Error("Could not find the exact add button block. Send me the latest MasterManager file if this happens.");
}

code = code.replace(oldBlock, newBlock);

fs.writeFileSync(managerFile, code);

console.log("Done. MasterManager now opens config.addPath when one is provided.");