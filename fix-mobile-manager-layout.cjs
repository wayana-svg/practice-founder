const fs = require("fs");

const cssPath = "app/globals.css";

if (!fs.existsSync(cssPath)) {
  console.log("Could not find app/globals.css");
  process.exit(1);
}

let css = fs.readFileSync(cssPath, "utf8");

if (!css.includes("Practice Founder stronger mobile manager layout")) {
  css += `

/* Practice Founder stronger mobile manager layout */
@media (max-width: 900px) {
  .pf-mobile-sidebar-toggle {
    top: 170px !important;
    left: 16px !important;
    padding: 9px 12px !important;
    font-size: 12px !important;
  }

  main {
    padding-top: 64px !important;
    padding-left: 14px !important;
    padding-right: 14px !important;
    max-width: 100vw !important;
    overflow-x: hidden !important;
  }

  main * {
    box-sizing: border-box !important;
  }

  main h1 {
    font-size: 42px !important;
    line-height: 0.95 !important;
    max-width: 100% !important;
    word-break: normal !important;
  }

  main p {
    max-width: 100% !important;
  }

  main [style*="grid-template-columns"] {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  main input[type="search"],
  main input[type="text"],
  main input:not([type]),
  main select,
  main textarea {
    max-width: 100% !important;
    width: 100% !important;
  }

  main button {
    max-width: 100% !important;
  }

  main form,
  main section,
  main article {
    max-width: 100% !important;
  }

  main table {
    display: table !important;
    min-width: 760px !important;
    width: max-content !important;
  }

  main table th,
  main table td {
    font-size: 13px !important;
    padding: 14px 16px !important;
    white-space: nowrap !important;
  }

  main table th:first-child,
  main table td:first-child {
    position: sticky !important;
    left: 0 !important;
    z-index: 4 !important;
    background: #FFFFFF !important;
    box-shadow: 8px 0 14px rgba(28, 35, 51, 0.06) !important;
  }

  main table th:first-child {
    background: #F8F5EE !important;
    z-index: 5 !important;
  }

  main > div,
  main > section {
    max-width: 100% !important;
  }

  body.pf-mobile-sidebar-open {
    overflow: hidden !important;
  }
}

@media (max-width: 520px) {
  main h1 {
    font-size: 36px !important;
  }

  main [style*="grid-template-columns"] {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  main table {
    min-width: 700px !important;
  }
}
`;
}

fs.writeFileSync(cssPath, css);

console.log("Stronger mobile manager layout added.");