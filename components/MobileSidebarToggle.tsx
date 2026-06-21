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
