"use client";

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
