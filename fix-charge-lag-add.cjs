const fs = require("fs");

const path = "app/charge-lag-list/page.tsx";
let text = fs.readFileSync(path, "utf8");

if (!text.includes('params.get("add") === "1"')) {
  text = text.replace(
    `useEffect(() => {
    loadRows();
    loadEmployees();
  }, []);`,
    `useEffect(() => {
    loadRows();
    loadEmployees();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    if (params.get("add") === "1") {
      setAddOpen(true);
      window.history.replaceState(null, "", "/charge-lag-list");
    }
  }, []);`
  );
}

fs.writeFileSync(path, text);
console.log("Charge Lag Add Record now opens the add form.");