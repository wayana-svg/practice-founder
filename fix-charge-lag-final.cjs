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

/* 1. Fix the Charge Lag links on the main homepage */
update("app/page.tsx", (text) => {
  return text
    .replaceAll('managerPath: "/charge-lag-submissions-list"', 'managerPath: "/charge-lag-list"')
    .replaceAll('managerPath: "/charge-lag-submissions"', 'managerPath: "/charge-lag-list"')
    .replaceAll('managerPath: "/charge-lag"', 'managerPath: "/charge-lag-list"')
    .replaceAll('addPath: "/charge-lag-submissions-list"', 'addPath: "/charge-lag-list?add=1"')
    .replaceAll('addPath: "/charge-lag-submissions"', 'addPath: "/charge-lag-list?add=1"')
    .replaceAll('addPath: "/charge-lag"', 'addPath: "/charge-lag-list?add=1"');
});

/* 2. Make the Charge Lag manager open the add popup when URL has ?add=1 */
update("app/charge-lag-list/page.tsx", (text) => {
  let next = text;

  next = next
    .replaceAll('href="/charge-lag"', 'href="/?table=charge_lag_submissions"')
    .replaceAll("href='/charge-lag'", "href='/?table=charge_lag_submissions'");

  if (!next.includes('params.get("add") === "1"')) {
    const addEffect = `
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    if (params.get("add") === "1") {
      setAddOpen(true);
      window.history.replaceState(null, "", "/charge-lag-list");
    }
  }, []);

`;

    if (next.includes("  const filteredRows = useMemo")) {
      next = next.replace("  const filteredRows = useMemo", addEffect + "  const filteredRows = useMemo");
    } else if (next.includes("  const metrics = useMemo")) {
      next = next.replace("  const metrics = useMemo", addEffect + "  const metrics = useMemo");
    } else {
      console.log("Could not find insert point for add popup effect.");
    }
  }

  return next;
});

/* 3. Remove the extra Charge Lag block pages from the flow */
update("app/charge-lag/page.tsx", () => {
  return `import { redirect } from "next/navigation";

export default function ChargeLagHomePage() {
  redirect("/?table=charge_lag_submissions");
}
`;
});

update("app/charge-lag-submissions/page.tsx", () => {
  return `import { redirect } from "next/navigation";

export default function ChargeLagSubmissionsPage() {
  redirect("/?table=charge_lag_submissions");
}
`;
});

update("app/charge-lag-submissions-list/page.tsx", () => {
  return `import { redirect } from "next/navigation";

export default function ChargeLagSubmissionsListPage() {
  redirect("/charge-lag-list");
}
`;
});

console.log("Final Charge Lag fix complete.");