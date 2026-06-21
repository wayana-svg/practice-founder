const fs = require("fs");

const path = "app/daily-physician-tracker/page.tsx";

if (!fs.existsSync(path)) {
  console.log("Could not find " + path);
  process.exit(1);
}

let text = fs.readFileSync(path, "utf8");

/* Add Role type after Employee type */
if (!text.includes("type Role = {")) {
  text = text.replace(
    /type Employee = {\s*id: number;\s*name: string \| null;\s*};/,
    `type Employee = {
  id: number;
  name: string | null;
};

type Role = {
  id: number;
  role_name?: string | null;
  name?: string | null;
  department?: string | null;
};`
  );
}

/* Rename form field from role_impacted to role_impacted_id */
text = text.replaceAll("role_impacted: string;", "role_impacted_id: string;");
text = text.replaceAll('role_impacted: "",', 'role_impacted_id: "",');

/* Add roles state after employees state */
if (!text.includes("const [roles, setRoles]")) {
  text = text.replace(
    /const \[employees, setEmployees\] = useState<Employee\[\]>\(\[\]\);/,
    `const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);`
  );
}

/* Load roles on page load */
text = text.replace(
  /useEffect\(\(\) => {\s*loadEmployees\(\);\s*}, \[\]\);/,
  `useEffect(() => {
    loadEmployees();
    loadRoles();
  }, []);`
);

/* Add loadRoles function after loadEmployees function */
if (!text.includes("async function loadRoles()")) {
  const loadEmployeesEndMarker = `  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {`;

  const loadRolesFunction = `  async function loadRoles() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("roles")
      .select("id, role_name, name, department")
      .order("id", { ascending: true });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setRoles((data as Role[]) || []);
  }

  function getRoleLabel(role: Role) {
    return role.role_name || role.name || \`Role #\${role.id}\`;
  }

`;

  text = text.replace(loadEmployeesEndMarker, loadRolesFunction + loadEmployeesEndMarker);
}

/* Payload should save role_impacted_id, not role_impacted */
text = text.replace(
  /role_impacted:\s*form\.was_there_a_staffing_gap\s*\?\s*form\.role_impacted\s*\|\|\s*null\s*:\s*null,/,
  `role_impacted_id: form.was_there_a_staffing_gap
        ? form.role_impacted_id
          ? Number(form.role_impacted_id)
          : null
        : null,`
);

/* Replace the hard-coded Role Impacted dropdown */
const oldDropdownRegex = /<select\s+value={form\.role_impacted}[\s\S]*?<option value="Other">Other<\/option>\s*<\/select>/;

const newDropdown = `<select
                value={form.role_impacted_id}
                onChange={(event) =>
                  updateField("role_impacted_id", event.target.value)
                }
                style={inputStyle}
              >
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {getRoleLabel(role)}
                    {role.department ? \` — \${role.department}\` : ""}
                  </option>
                ))}
              </select>`;

if (oldDropdownRegex.test(text)) {
  text = text.replace(oldDropdownRegex, newDropdown);
} else {
  console.log("Could not find the old Role Impacted dropdown. The form field names were still updated.");
}

/* Safety: remove any leftover form.role_impacted usage */
text = text.replaceAll("form.role_impacted", "form.role_impacted_id");
text = text.replaceAll('"role_impacted"', '"role_impacted_id"');

fs.writeFileSync(path, text);

console.log("Daily Physician quick-add Role Impacted now loads from roles table and saves role_impacted_id.");