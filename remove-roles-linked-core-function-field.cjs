const fs = require("fs");

const path = "app/roles/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let lines = fs.readFileSync(path, "utf8").split(/\r?\n/);
let output = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  /*
    Remove any JSX label block that contains linked_core_function.
  */
  if (line.includes('updateField("linked_core_function"')) {
    while (output.length > 0 && !output[output.length - 1].includes("<label")) {
      output.pop();
    }

    if (output.length > 0 && output[output.length - 1].includes("<label")) {
      output.pop();
    }

    while (i < lines.length && !lines[i].includes("</label>")) {
      i++;
    }

    continue;
  }

  output.push(line);
}

let text = output.join("\n");

/*
  Remove any remaining references.
*/
text = text.replace(/linked_core_function/g, "");

fs.writeFileSync(path, text);

console.log("Roles linked core function form field removed.");