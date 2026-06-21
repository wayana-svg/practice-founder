const fs = require("fs");

function update(path, updater) {
  if (!fs.existsSync(path)) {
    console.log("Missing:", path);
    return;
  }

  const before = fs.readFileSync(path, "utf8");
  const after = updater(before);
  fs.writeFileSync(path, after);
  console.log("Updated:", path);
}

/* 1. Fix homepage Weekly Claims Summary links */
update("app/page.tsx", (text) => {
  let next = text;

  next = next
    .replaceAll('managerPath: "/weekly-claims-summary"', 'managerPath: "/weekly-claims-summary-list"')
    .replaceAll('managerPath: "/weekly-claims-summary-list"', 'managerPath: "/weekly-claims-summary-list"')
    .replaceAll('addPath: "/weekly-claims-summary"', 'addPath: "/weekly-claims-summary-list?add=1"')
    .replaceAll('addPath: "/weekly-claims-summary-list"', 'addPath: "/weekly-claims-summary-list?add=1"');

  return next;
});

/* 2. Make the old add page redirect into the manager add form */
update("app/weekly-claims-summary/page.tsx", () => {
  return `import { redirect } from "next/navigation";

export default function WeeklyClaimsSummaryPage() {
  redirect("/weekly-claims-summary-list?add=1");
}
`;
});

/* 3. Make sure the manager itself does not redirect its own Add button away */
update("app/weekly-claims-summary-list/page.tsx", (text) => {
  return text.replace(/\n\s*addPath:\s*"\/weekly-claims-summary[^"]*",/g, "");
});

/* 4. Teach MasterManager to open the add form when URL has ?add=1 */
update("components/MasterManager.tsx", (text) => {
  if (text.includes('params.get("add") === "1"') && text.includes("MasterManager add query support")) {
    return text;
  }

  const functionName = "function openAddPanel()";
  const start = text.indexOf(functionName);

  if (start === -1) {
    console.log("Could not find openAddPanel in MasterManager.");
    return text;
  }

  const braceStart = text.indexOf("{", start);
  let depth = 0;
  let end = -1;

  for (let i = braceStart; i < text.length; i++) {
    const char = text[i];

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;

    if (depth === 0) {
      end = i + 1;
      break;
    }
  }

  if (end === -1) {
    console.log("Could not find end of openAddPanel.");
    return text;
  }

  const effect = `

  // MasterManager add query support
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    if (params.get("add") === "1") {
      window.history.replaceState(null, "", window.location.pathname);
      openAddPanel();
    }
  }, []);
`;

  return text.slice(0, end) + effect + text.slice(end);
});

console.log("Weekly Claims Summary homepage add flow fixed.");