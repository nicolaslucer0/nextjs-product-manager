"use client";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";

export type AdminTab =
  | "products"
  | "categories"
  | "config"
  | "users"
  | "social"
  | "used"
  | "import"
  | "overview";

type NavItem = {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
  count?: number;
  adminOnly?: boolean;
  group: "principal" | "tienda" | "sistema";
};

type Props = {
  readonly activeTab: AdminTab;
  readonly onTabChange: (tab: AdminTab) => void;
  readonly isAdmin: boolean;
  readonly stats: {
    totalProducts: number;
    totalUsers: number;
  };
};

const iconClass = "w-5 h-5";

function Icon({ d }: { readonly d: string }) {
  return (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={d} />
    </svg>
  );
}

const navItems: NavItem[] = [
  {
    id: "products",
    label: "Productos",
    icon: <Icon d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
    group: "principal",
  },
  {
    id: "categories",
    label: "Categorías",
    icon: <Icon d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />,
    group: "principal",
  },
  {
    id: "import",
    label: "Importar",
    icon: <Icon d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />,
    group: "principal",
  },
  {
    id: "config",
    label: "Configuración",
    icon: <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
    group: "tienda",
  },
  {
    id: "social",
    label: "Redes y contacto",
    icon: <Icon d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />,
    group: "tienda",
  },
  {
    id: "used",
    label: "Cotización usados",
    icon: <Icon d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />,
    group: "tienda",
  },
  {
    id: "users",
    label: "Usuarios",
    icon: <Icon d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    adminOnly: true,
    group: "sistema",
  },
  {
    id: "overview",
    label: "Resumen",
    icon: <Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    group: "sistema",
  },
];

const groupLabels: Record<string, string> = {
  principal: "Productos",
  tienda: "Tienda",
  sistema: "Sistema",
};

export default function AdminSidebar({ activeTab, onTabChange, isAdmin, stats }: Props) {
  const { theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);
  const groups = ["principal", "tienda", "sistema"];

  const getCount = (id: AdminTab) => {
    if (id === "products") return stats.totalProducts;
    if (id === "users") return stats.totalUsers;
    return undefined;
  };

  const lightMode = theme === "light";

  const renderNav = (onItemClick?: () => void) => (
    <nav className="flex flex-col gap-1">
      {groups.map((group) => {
        const groupItems = visibleItems.filter((i) => i.group === group);
        if (groupItems.length === 0) return null;
        return (
          <div key={group} className="mb-2">
            <p className={`text-[11px] font-semibold uppercase tracking-wider px-3 mb-1 ${lightMode ? "text-gray-400" : "text-white/30"}`}>
              {groupLabels[group]}
            </p>
            {groupItems.map((item) => {
              const isActive = activeTab === item.id;
              const count = getCount(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onItemClick?.();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? lightMode
                        ? "bg-blue-50 text-blue-600"
                        : "bg-blue-500/15 text-blue-400"
                      : lightMode
                        ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className={isActive ? "" : "opacity-60"}>{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {count !== undefined && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? lightMode ? "bg-blue-100 text-blue-600" : "bg-blue-500/20 text-blue-400"
                        : lightMode ? "bg-gray-100 text-gray-500" : "bg-white/10 text-white/40"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col w-60 shrink-0 sticky top-24 self-start rounded-xl border p-3 ${
        lightMode ? "bg-white border-gray-200" : "bg-white/5 border-white/10"
      }`} style={{ maxHeight: "calc(100vh - 7rem)" }}>
        {renderNav()}
        <div className={`mt-auto pt-3 border-t ${lightMode ? "border-gray-200" : "border-white/10"}`}>
          <Link
            href="/products"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              lightMode ? "text-gray-500 hover:bg-gray-100" : "text-white/40 hover:bg-white/5"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ver tienda
          </Link>
        </div>
      </aside>

      {/* Mobile: dropdown selector */}
      <div className="lg:hidden mb-6">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium ${
            lightMode
              ? "bg-white border-gray-200 text-gray-900"
              : "bg-white/5 border-white/10 text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            {visibleItems.find((i) => i.id === activeTab)?.icon}
            {visibleItems.find((i) => i.id === activeTab)?.label}
          </span>
          <svg className={`w-5 h-5 transition-transform ${mobileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {mobileOpen && (
          <div className={`mt-2 rounded-xl border p-2 ${
            lightMode ? "bg-white border-gray-200" : "bg-black border-white/10"
          }`}>
            {renderNav(() => setMobileOpen(false))}
          </div>
        )}
      </div>
    </>
  );
}
