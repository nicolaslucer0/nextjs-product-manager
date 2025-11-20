type ProductFiltersProps = {
  readonly searchQuery: string;
  readonly categoryFilter: string;
  readonly categories: string[];
  readonly theme: string;
  readonly onSearchChange: (value: string) => void;
  readonly onCategoryChange: (value: string) => void;
};

export default function ProductFilters({
  searchQuery,
  categoryFilter,
  categories,
  theme,
  onSearchChange,
  onCategoryChange,
}: ProductFiltersProps) {
  const inputClasses = `px-4 py-2 rounded-lg border transition-colors ${
    theme === "light"
      ? "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      : "bg-white/5 border-white/10 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
  }`;

  const searchInputClasses = `w-full px-4 py-2 pl-10 rounded-lg border transition-colors ${
    theme === "light"
      ? "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      : "bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
  }`;

  const iconColor = theme === "light" ? "text-gray-400" : "text-white/40";
  const iconHoverColor =
    theme === "light" ? "hover:text-gray-600" : "hover:text-white/60";

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Selector de categoría */}
      <select
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={inputClasses}
      >
        <option value="all">Todas las categorías</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {/* Buscador */}
      <div className="relative flex-1 md:max-w-md">
        <input
          type="text"
          placeholder="Buscar por nombre o ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={searchInputClasses}
        />
        <svg
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${iconColor}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${iconColor} ${iconHoverColor}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
