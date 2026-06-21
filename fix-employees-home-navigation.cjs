const fs = require("fs");

const file = "app/page.tsx";

if (!fs.existsSync(file)) {
  throw new Error("Cannot find app/page.tsx");
}

let code = fs.readFileSync(file, "utf8");

code = code.replace(
  `        key: "employees",
        label: "Employees",
        description: "Staff directory and employee records.",
        tableName: "employees",
        managerPath: "/employees",
        columns: [`,
  `        key: "employees",
        label: "Employees",
        description: "Staff directory and employee records.",
        tableName: "employees",
        managerPath: "/employees-list",
        addPath: "/employees",
        columns: [`
);

code = code.replace(
  `          {
            key: "status",
            label: "Status",
            description: "The employee's current status.",
          },`,
  `          {
            key: "active",
            label: "Active",
            description: "Whether this employee is active and available for new assignments.",
          },`
);

code = code.replace(
  `        defaultColumns: ["name", "email", "role", "status"],`,
  `        defaultColumns: ["name", "email", "role", "active"],`
);

fs.writeFileSync(file, code);

console.log("Done. Homepage Employees now has Open Manager and Add Record wired correctly.");