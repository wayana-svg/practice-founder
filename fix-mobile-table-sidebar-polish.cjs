const fs = require("fs");

function writeFile(path, content) {
  const folder = path.split("/").slice(0, -1).join("/");
  if (folder) fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path, content);
}

/*
  Replace the mobile sidebar toggle with a stronger version.
  It closes the menu when the user taps any link, button, or clickable item inside the sidebar.
*/
writeFile(
  "components/MobileSidebarToggle.tsx",
  `"use client";

import { useEffect, useState } from "react";

export default function MobileSidebarToggle() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("pf-mobile-sidebar-open", open);

    return () => {
      document.body.classList.remove("pf-mobile-sidebar-open");
    };
  }, [open]);

  useEffect(() => {
    function closeAfterSidebarClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;

      if (!target) return;

      const sidebar = target.closest("aside, nav, [data-sidebar]");
      const clickable = target.closest("a, button, [role='button'], [tabindex]");

      if (sidebar && clickable) {
        window.setTimeout(() => {
          setOpen(false);
        }, 120);
      }
    }

    document.addEventListener("click", closeAfterSidebarClick);

    return () => {
      document.removeEventListener("click", closeAfterSidebarClick);
    };
  }, []);

  return (
    <button
      type="button"
      className="pf-mobile-sidebar-toggle"
      onClick={() => setOpen((current) => !current)}
      aria-label={open ? "Close menu" : "Open menu"}
    >
      {open ? "Close Menu" : "Open Menu"}
    </button>
  );
}
`
);

const cssPath = "app/globals.css";

if (!fs.existsSync(cssPath)) {
  console.log("Could not find app/globals.css");
  process.exit(1);
}

let css = fs.readFileSync(cssPath, "utf8");

if (!css.includes("Practice Founder mobile table polish")) {
  css += `

/* Practice Founder mobile table polish */
@media (max-width: 900px) {
  html,
  body {
    max-width: 100%;
    overflow-x: hidden;
  }

  main {
    max-width: 100vw !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch;
    padding-left: 14px !important;
    padding-right: 14px !important;
  }

  main table {
    min-width: 860px !important;
    width: max-content !important;
    border-collapse: separate !important;
    border-spacing: 0 !important;
  }

  main th,
  main td {
    white-space: nowrap !important;
    vertical-align: top !important;
  }

  main th:first-child,
  main td:first-child {
    position: sticky;
    left: 0;
    z-index: 2;
    background: #FFFFFF;
  }

  main th:first-child {
    z-index: 3;
  }

  body.pf-mobile-sidebar-open {
    overflow: hidden !important;
  }

  body:not(.pf-mobile-sidebar-open) aside {
    transform: translateX(-110%) !important;
    pointer-events: none !important;
  }

  body.pf-mobile-sidebar-open aside {
    transform: translateX(0) !important;
    pointer-events: auto !important;
  }
}
`;
}

fs.writeFileSync(cssPath, css);

console.log("Mobile table layout and sidebar auto-close fixed.");