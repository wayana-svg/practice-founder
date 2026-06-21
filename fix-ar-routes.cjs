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

/* 1. Fix AR links on the main homepage */
update("app/page.tsx", (text) => {
  return text
    .replaceAll('managerPath: "/ar-report-submissions"', 'managerPath: "/ar-report-submissions-list"')
    .replaceAll('addPath: "/ar-report-submissions"', 'addPath: "/ar-report-submissions-list?add=1"')
    .replaceAll('addPath: "/ar-report-submissions-list"', 'addPath: "/ar-report-submissions-list?add=1"');
});

/* 2. Make AR manager Back return to the AR table on the homepage */
update("app/ar-report-submissions-list/page.tsx", (text) => {
  let next = text;

  next = next
    .replaceAll('href="/ar-report-submissions"', 'href="/?table=ar_report_submissions"')
    .replaceAll("href='/ar-report-submissions'", "href='/?table=ar_report_submissions'")
    .replaceAll('href="/" style={backLinkStyle}', 'href="/?table=ar_report_submissions" style={backLinkStyle}')
    .replaceAll("href='/' style={backLinkStyle}", "href='/?table=ar_report_submissions' style={backLinkStyle}");

  /* 3. Open add form when URL has ?add=1 */
  if (!next.includes('params.get("add") === "1"')) {
    const addEffect = `
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    if (params.get("add") === "1") {
      setAddOpen(true);
      window.history.replaceState(null, "", "/ar-report-submissions-list");
    }
  }, []);

`;

    if (next.includes("  const filteredRows = useMemo")) {
      next = next.replace("  const filteredRows = useMemo", addEffect + "  const filteredRows = useMemo");
    } else if (next.includes("  const metrics = useMemo")) {
      next = next.replace("  const metrics = useMemo", addEffect + "  const metrics = useMemo");
    } else if (next.includes("  return (")) {
      next = next.replace("  return (", addEffect + "  return (");
    } else {
      console.log("Could not find insert point for AR add popup effect.");
    }
  }

  return next;
});

/* 4. Remove extra AR block page from the flow */
update("app/ar-report-submissions/page.tsx", () => {
  return `import { redirect } from "next/navigation";

export default function ARReportSubmissionsPage() {
  redirect("/?table=ar_report_submissions");
}
`;
});

console.log("AR routing cleanup complete.");