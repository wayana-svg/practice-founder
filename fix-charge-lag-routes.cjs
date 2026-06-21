const fs = require("fs");

function updateFile(path, update) {
  if (!fs.existsSync(path)) {
    console.log("Skipped missing file:", path);
    return;
  }

  const before = fs.readFileSync(path, "utf8");
  const after = update(before);

  fs.writeFileSync(path, after);
  console.log("Updated:", path);
}

updateFile("app/page.tsx", (text) => {
  return text
    .replaceAll('managerPath: "/charge-lag-submissions-list"', 'managerPath: "/charge-lag-list"')
    .replaceAll('addPath: "/charge-lag-submissions"', 'addPath: "/charge-lag-list?add=1"')
    .replaceAll('managerPath: "/charge-lag"', 'managerPath: "/charge-lag-list"')
    .replaceAll('addPath: "/charge-lag"', 'addPath: "/charge-lag-list?add=1"');
});

updateFile("app/charge-lag-list/page.tsx", (text) => {
  return text
    .replaceAll('href="/charge-lag"', 'href="/?table=charge_lag_submissions"')
    .replaceAll("href='/charge-lag'", "href='/?table=charge_lag_submissions'");
});

updateFile("app/charge-lag/page.tsx", () => {
  return `import { redirect } from "next/navigation";

export default function ChargeLagHomePage() {
  redirect("/?table=charge_lag_submissions");
}
`;
});

updateFile("app/charge-lag-submissions/page.tsx", () => {
  return `import { redirect } from "next/navigation";

export default function ChargeLagSubmissionsPage() {
  redirect("/?table=charge_lag_submissions");
}
`;
});

updateFile("app/charge-lag-submissions-list/page.tsx", () => {
  return `import { redirect } from "next/navigation";

export default function ChargeLagSubmissionsListPage() {
  redirect("/charge-lag-list");
}
`;
});

console.log("Charge Lag routing cleanup complete.");