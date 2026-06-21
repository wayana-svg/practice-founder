const fs = require("fs");

const cssPath = "app/globals.css";

if (!fs.existsSync(cssPath)) {
  console.log("Could not find app/globals.css");
  process.exit(1);
}

let css = fs.readFileSync(cssPath, "utf8");

if (!css.includes("Practice Founder final mobile page fit")) {
  css += `

/* Practice Founder final mobile page fit */
@media (max-width: 900px) {
  html,
  body {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
  }

  body {
    margin: 0 !important;
  }

  main {
    width: 100% !important;
    max-width: 100vw !important;
    margin-left: 0 !important;
    padding-left: 16px !important;
    padding-right: 16px !important;
    padding-top: 78px !important;
    overflow-x: hidden !important;
  }

  main *,
  main *::before,
  main *::after {
    box-sizing: border-box !important;
  }

  main > div,
  main > section,
  main > article,
  main form {
    width: 100% !important;
    max-width: 100% !important;
  }

  main h1 {
    max-width: 100% !important;
    font-size: clamp(34px, 12vw, 52px) !important;
    line-height: 0.98 !important;
    word-break: normal !important;
    overflow-wrap: normal !important;
  }

  main h2,
  main h3,
  main p {
    max-width: 100% !important;
    overflow-wrap: break-word !important;
  }

  main a,
  main button {
    max-width: 100% !important;
  }

  main input,
  main select,
  main textarea {
    width: 100% !important;
    max-width: 100% !important;
  }

  main [style*="display: flex"],
  main [style*="display:flex"] {
    flex-wrap: wrap !important;
  }

  main [style*="grid-template-columns"] {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
  }

  main table {
    min-width: 720px !important;
    width: max-content !important;
  }

  main table th,
  main table td {
    white-space: nowrap !important;
    font-size: 13px !important;
    padding: 12px 14px !important;
  }

  main table th:first-child,
  main table td:first-child {
    position: sticky !important;
    left: 0 !important;
    z-index: 4 !important;
    background: #ffffff !important;
    box-shadow: 8px 0 14px rgba(28, 35, 51, 0.08) !important;
  }

  main table th:first-child {
    background: #f8f5ee !important;
    z-index: 5 !important;
  }

  main div:has(> table) {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .pf-mobile-sidebar-toggle {
    top: 174px !important;
    left: 16px !important;
    z-index: 10000 !important;
  }

  aside {
    max-width: 86vw !important;
  }
}

@media (max-width: 520px) {
  main {
    padding-left: 14px !important;
    padding-right: 14px !important;
  }

  main table {
    min-width: 680px !important;
  }

  main [style*="grid-template-columns"] {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
`;
}

fs.writeFileSync(cssPath, css);

console.log("Final mobile page fit CSS added.");