const fs = require("fs");

const path = "components/MasterManager.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/*
  Add linked option state.
*/
if (!text.includes("type LinkedSelectOptionsMap")) {
  text = text.replace(
    /type Employee = {[\s\S]*?};/,
    (match) =>
      `${match}

type LinkedSelectOption = {
  id: string | number;
  label: string;
  subtitle?: string | null;
};

type LinkedSelectOptionsMap = Record<string, LinkedSelectOption[]>;`
  );
}

if (!text.includes("const [linkedSelectOptions, setLinkedSelectOptions]")) {
  text = text.replace(
    /const \[employees, setEmployees\] = useState<Employee\[\]>\(\[\]\);/,
    `const [employees, setEmployees] = useState<Employee[]>([]);
  const [linkedSelectOptions, setLinkedSelectOptions] =
    useState<LinkedSelectOptionsMap>({});`
  );
}

/*
  Make sure linked options load on startup.
*/
if (!text.includes("loadLinkedSelectOptions();")) {
  text = text.replace(
    /loadEmployees\(\);/,
    `loadEmployees();
    loadLinkedSelectOptions();`
  );
}

/*
  Add helper functions before loadEmployees.
*/
if (!text.includes("async function loadLinkedSelectOptions")) {
  text = text.replace(
    /async function loadEmployees\(\) \{/,
    `function getLinkedRecordLabelField(field: ManagerField) {
    return (
      field.linkedRecord?.labelField ||
      field.linkedRecord?.titleField ||
      field.linkedRecord?.subtitleField ||
      "id"
    );
  }

  function getLinkedRecordSubtitleField(field: ManagerField) {
    return field.linkedRecord?.subtitleField || "";
  }

  function getLinkedOptionLabel(field: ManagerField, value: string | number | boolean | null | undefined) {
    if (!field.linkedRecord || value === null || value === undefined || value === "") {
      return "-";
    }

    const options = linkedSelectOptions[field.key] || [];
    const match = options.find((option) => String(option.id) === String(value));

    if (match) {
      return match.subtitle ? \`\${match.label} — \${match.subtitle}\` : match.label;
    }

    return \`\${field.linkedRecord.title || "Record"} #\${value}\`;
  }

  async function loadLinkedSelectOptions() {
    const linkedFields = config.fields.filter((field) => field.linkedRecord);

    if (linkedFields.length === 0) return;

    const supabase = createClient();
    const nextOptions: LinkedSelectOptionsMap = {};

    for (const field of linkedFields) {
      if (!field.linkedRecord) continue;

      const labelField = getLinkedRecordLabelField(field);
      const subtitleField = getLinkedRecordSubtitleField(field);
      const columns = Array.from(
        new Set([
          field.linkedRecord.primaryKey,
          labelField,
          subtitleField,
        ].filter(Boolean))
      ).join(", ");

      const { data, error } = await supabase
        .from(field.linkedRecord.tableName)
        .select(columns)
        .limit(500);

      if (error) {
        console.log(error.message);
        continue;
      }

      nextOptions[field.key] = ((data || []) as RowData[]).map((record) => ({
        id: record[field.linkedRecord!.primaryKey] as string | number,
        label:
          String(record[labelField] || "") ||
          \`\${field.linkedRecord!.title || "Record"} #\${record[field.linkedRecord!.primaryKey]}\`,
        subtitle: subtitleField ? String(record[subtitleField] || "") : null,
      }));
    }

    setLinkedSelectOptions(nextOptions);
  }

  async function loadEmployees() {`
  );
}

/*
  Make display formatting show linked labels before plain number/id.
*/
if (!text.includes("if (field.linkedRecord) return getLinkedOptionLabel(field, value);")) {
  text = text.replace(
    /if \(field\?\.type === "employee"\) return getEmployeeName\(value\);/,
    `if (field?.linkedRecord) return getLinkedOptionLabel(field, value);
    if (field?.type === "employee") return getEmployeeName(value);`
  );
}

/*
  Add linked select rendering before employee field rendering.
*/
if (!text.includes("Select linked record")) {
  text = text.replace(
    /if \(field\.type === "employee"\) \{/,
    `if (field.linkedRecord) {
      const options = linkedSelectOptions[field.key] || [];

      return (
        <select
          value={String(value || "")}
          onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
          style={inputStyle}
          disabled={readOnly}
        >
          <option value="">Select linked record</option>
          {options.map((option) => (
            <option key={String(option.id)} value={option.id}>
              {option.subtitle ? \`\${option.label} — \${option.subtitle}\` : option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "employee") {`
  );
}

/*
  Include linked options in memo dependency if there is a dependency list with employees/config.fields.
*/
text = text.replaceAll(
  "[rows, searchText, filters, sortBy, sortReverse, employees, config.fields]",
  "[rows, searchText, filters, sortBy, sortReverse, employees, linkedSelectOptions, config.fields]"
);

text = text.replaceAll(
  "[filteredRows, groupBy, employees]",
  "[filteredRows, groupBy, employees, linkedSelectOptions]"
);

fs.writeFileSync(path, text);

console.log("MasterManager linked-record dropdown support added.");