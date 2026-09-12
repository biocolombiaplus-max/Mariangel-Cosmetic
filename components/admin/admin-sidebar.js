"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import BrandLogo from "@/components/brand-logo";

const LINKS = [
  { href: "/admin", label: "Resumen", icon: "📊" },
  { href: "/admin/productos", label: "Productos", icon: "🛍️" },
  { href: "/admin/contenido", label: "Contenido de la tienda", icon: "🎨" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-brand-blush-100 bg-white px-4 py-6">
      <div className="mb-8 px-2">
        <BrandLogo size="sm" />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {LINKS.map((l) => {
          const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-plum-600 text-white"
                  : "text-brand-deep-900/70 hover:bg-brand-blush-50"
              }`}
            >
              <span>{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-1 border-t border-brand-blush-100 pt-4">
        <Link
          href="/"
          target="_blank"
          className="rounded-xl px-3 py-2.5 text-sm font-medium text-brand-deep-900/70 hover:bg-brand-blush-50"
        >
          🔗 Ver tienda
        </Link>
        <button
          onClick={logout}
          className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
        >
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
