const fs = require("fs");

const files = [
  "app/page.tsx",
  "app/tasks/page.tsx",
  "app/tasks-list/page.tsx",
];

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log(`Skipped missing file: ${file}`);
    continue;
  }

  let code = fs.readFileSync(file, "utf8");

  code = code.replaceAll("/tasks-list?add=1", "/tasks-list");
  code = code.replaceAll('addPath: "/tasks-list",', 'addPath: "/tasks",');
  code = code.replaceAll("addPath: '/tasks-list',", "addPath: '/tasks',");

  code = code.replaceAll(
    'useState<ModalMode | null>("add")',
    "useState<ModalMode | null>(null)"
  );

  code = code.replaceAll(
    "useState<ModalMode | null>('add')",
    "useState<ModalMode | null>(null)"
  );

  code = code.replace(
    /useEffect\(\(\) => \{\s*loadEverything\(\);\s*openAddTask\(\);\s*\}, \[\]\);/g,
    `useEffect(() => {
    loadEverything();
  }, []);`
  );

  fs.writeFileSync(file, code);
  console.log(`Fixed: ${file}`);
}

console.log("Done.");