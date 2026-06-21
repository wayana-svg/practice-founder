const fs = require("fs");

const quickFile = "app/roles/page.tsx";
const managerFile = "app/roles-list/page.tsx";

for (const file of [quickFile, managerFile]) {
  if (!fs.existsSync(file)) {
    throw new Error(`Cannot find ${file}`);
  }
}

let quick = fs.readFileSync(quickFile, "utf8");

// Remove linked_core_function from the form state type.
quick = quick.replace(/\n  linked_core_function: string;/, "");

// Remove linked_core_function from emptyForm.
quick = quick.replace(/\n  linked_core_function: "",/, "");

// Remove the full coreFunctionOptions array.
quick = quick.replace(
  /\nconst coreFunctionOptions: OptionDefinition\[\] = \[[\s\S]*?\n\];\n\nconst mustLogOptions:/,
  "\nconst mustLogOptions:"
);

// Remove coreFunctionDescription memo block.
quick = quick.replace(
  /\n  const coreFunctionDescription = useMemo\([\s\S]*?\n  \);\n/,
  "\n"
);

// Remove linked_core_function from payload.
quick = quick.replace(/\n      linked_core_function: form\.linked_core_function \|\| null,/, "");

// Remove the full Linked Core Function label block.
quick = quick.replace(
  /\n            <label[\s\S]*?Linked Core Function[\s\S]*?coreFunctionDescription[\s\S]*?<\/label>\n/,
  "\n"
);

// Remove summary card for Core Function.
quick = quick.replace(
  /\n        <div style=\{summaryCardStyle\}>\s*<div style=\{summaryLabelStyle\}>Core Function<\/div>[\s\S]*?<\/div>\s*<\/div>/,
  ""
);

// Change summary grid from 3 cards to 2 cards.
quick = quick.replace(
  'gridTemplateColumns: "repeat(3, minmax(0, 1fr))"',
  'gridTemplateColumns: "repeat(2, minmax(0, 1fr))"'
);

fs.writeFileSync(quickFile, quick);

let manager = fs.readFileSync(managerFile, "utf8");

// Remove the linked_core_function field object from manager config.
manager = manager.replace(
  /\n    \{\s*key: "linked_core_function",[\s\S]*?sortOrder: \[[\s\S]*?\],\s*\},/,
  ""
);

// Remove it from defaultVisibleFields.
manager = manager.replace(/\n    "linked_core_function",/, "");

fs.writeFileSync(managerFile, manager);

console.log("Done. Linked Core Function has been removed from Roles quick-add and manager.");