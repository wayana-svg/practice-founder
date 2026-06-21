const fs = require("fs");

function writeFile(path, content) {
  const folder = path.split("/").slice(0, -1).join("/");
  if (folder) fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(path, content);
}

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
    function closeAfterSidebarLinkClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;

      if (!target) return;

      const link = target.closest("a");
      const sidebar = target.closest("aside, nav");

      if (link && sidebar) {
        setOpen(false);
      }
    }

    document.addEventListener("click", closeAfterSidebarLinkClick);

    return () => {
      document.removeEventListener("click", closeAfterSidebarLinkClick);
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

const layoutPath = "app/layout.tsx";

if (!fs.existsSync(layoutPath)) {
  console.log("Could not find app/layout.tsx");
  process.exit(1);
}

let layout = fs.readFileSync(layoutPath, "utf8");

if (!layout.includes('MobileSidebarToggle')) {
  layout = layout.replace(
    /import\s+["']\.\/globals\.css["'];?/,
    `import "./globals.css";
import MobileSidebarToggle from "../components/MobileSidebarToggle";`
  );

  layout = layout.replace(
    /(<body[^>]*>)/,
    `$1
        <MobileSidebarToggle />`
  );
}

fs.writeFileSync(layoutPath, layout);

const cssPath = "app/globals.css";

if (!fs.existsSync(cssPath)) {
  console.log("Could not find app/globals.css");
  process.exit(1);
}

let css = fs.readFileSync(cssPath, "utf8");

if (!css.includes("pf-mobile-sidebar-toggle")) {
  css += `

/* Practice Founder mobile sidebar fix */
.pf-mobile-sidebar-toggle {
  display: none;
}

@media (max-width: 900px) {
  .pf-mobile-sidebar-toggle {
    display: block;
    position: fixed;
    top: 14px;
    left: 14px;
    z-index: 10000;
    border: 1px solid rgba(201, 168, 76, 0.55);
    background: #1C2333;
    color: #FFFFFF;
    padding: 10px 13px;
    border-radius: 999px;
    font-family: "DM Sans", Arial, sans-serif;
    font-size: 13px;
    font-weight: 900;
    box-shadow: 0 12px 28px rgba(28, 35, 51, 0.22);
  }

  body:not(.pf-mobile-sidebar-open) aside {
    transform: translateX(-110%) !important;
    pointer-events: none !important;
  }

  body.pf-mobile-sidebar-open aside {
    transform: translateX(0) !important;
    pointer-events: auto !important;
  }

  aside {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    bottom: 0 !important;
    z-index: 9999 !important;
    max-width: 86vw !important;
    width: 320px !important;
    overflow-y: auto !important;
    transition: transform 180ms ease !important;
    box-shadow: 24px 0 50px rgba(28, 35, 51, 0.28) !important;
  }

  main {
    margin-left: 0 !important;
    width: 100% !important;
  }

  body.pf-mobile-sidebar-open::after {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: rgba(28, 35, 51, 0.38);
  }
}
`;
}

fs.writeFileSync(cssPath, css);

console.log("Mobile sidebar menu fix added.");