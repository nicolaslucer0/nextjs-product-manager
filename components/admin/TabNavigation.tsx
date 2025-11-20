type TabType =
  | "overview"
  | "products"
  | "users"
  | "social"
  | "import"
  | "config";

type TabNavigationProps = {
  readonly activeTab: TabType;
  readonly onTabChange: (tab: TabType) => void;
  readonly isAdmin: boolean;
  readonly stats: {
    totalProducts: number;
    totalUsers: number;
  };
};

type TabConfig = {
  id: TabType;
  label: string;
  icon: string;
  count?: number;
  adminOnly?: boolean;
};

export default function TabNavigation({
  activeTab,
  onTabChange,
  isAdmin,
  stats,
}: TabNavigationProps) {
  const tabs: TabConfig[] = [
    {
      id: "products",
      label: "Productos",
      icon: "📦",
      count: stats.totalProducts,
    },
    {
      id: "users",
      label: "Usuarios",
      icon: "👥",
      count: stats.totalUsers,
      adminOnly: true,
    },
    { id: "social", label: "Redes Sociales", icon: "🌐" },
    { id: "import", label: "Importar Excel", icon: "📥" },
    { id: "config", label: "Configuración", icon: "⚙️" },
    { id: "overview", label: "Resumen", icon: "📊" },
  ];

  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || isAdmin);

  const getTabLabel = (tab: TabConfig) => {
    const countLabel = tab.count === undefined ? "" : ` (${tab.count})`;
    return `${tab.icon} ${tab.label}${countLabel}`;
  };

  const getTabClasses = (tabId: TabType) => {
    const isActive = activeTab === tabId;
    return `pb-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap text-sm lg:text-base ${
      isActive
        ? "border-blue-400 text-blue-400"
        : "border-transparent text-white/50 hover:text-white/70"
    }`;
  };

  return (
    <div className="mb-6">
      {/* Mobile: Dropdown */}
      <div className="sm:hidden">
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value as TabType)}
          className="w-full card py-3 px-4 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {visibleTabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {getTabLabel(tab)}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: Horizontal Tabs */}
      <div className="hidden sm:block border-b border-white/10">
        <nav className="flex gap-4 lg:gap-8 overflow-x-auto scrollbar-hide">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={getTabClasses(tab.id)}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
