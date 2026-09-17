"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import BrandLogo from "@/components/brand-logo";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default function AdminShell({ children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the mobile drawer automatically whenever the route changes
  // (covers browser back/forward, not just in-drawer link clicks).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-brand-blush-50 lg:flex">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-blush-100 bg-white px-4 py-3 lg:hidden">
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="flex h-9 w-9 items-center justify-center rounded-full text-brand-plum-700 hover:bg-brand-blush-50"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
        <BrandLogo size="sm" />
        <span className="w-9" />
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-60 lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:transition-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <AdminSidebar onNavigate={() => setOpen(false)} />
      </div>

      <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </main>
    </div>
  );
}
