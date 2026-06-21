const fs = require("fs");

const file = "app/issues-list/page.tsx";

if (!fs.existsSync(file)) {
  throw new Error("Cannot find app/issues-list/page.tsx");
}

let code = fs.readFileSync(file, "utf8");

if (!code.includes('const [filterField, setFilterField] = useState("")')) {
  code = code.replace(
    `  const [searchText, setSearchText] = useState("");`,
    `  const [searchText, setSearchText] = useState("");
  const [activeMenu, setActiveMenu] = useState<
    "" | "filter" | "sort" | "viewFields"
  >("");
  const [filterField, setFilterField] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [visibleFieldKeys, setVisibleFieldKeys] =
    useState<string[]>(defaultIssueFieldKeys);`
  );
}

fs.writeFileSync(file, code);

console.log("Done. Missing Issues filter/sort/view state has been repaired.");