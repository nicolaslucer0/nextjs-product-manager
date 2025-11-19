"use client";
import { useState, useEffect, useMemo, memo } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { formatPrice } from "@/lib/utils";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import Pagination from "@/components/Pagination";

type Variant = {
  _id?: string;
  name: string;
  type: "color" | "storage";
  price: number;
  stock: number;
  image: string;
};

type Product = {
  _id: string;
  title: string;
  description: string;
  category?: string;
  price: number;
  stock: number;
  images: string[];
  variants?: Variant[];
};

type ProductsClientProps = {
  readonly categories: string[];
  readonly totalProducts: number;
};

type FilterContentProps = {
  readonly searchTerm: string;
  readonly debouncedSearchTerm: string;
  readonly categoryFilter: string;
  readonly minPrice: string;
  readonly maxPrice: string;
  readonly inStock: boolean;
  readonly sortBy: string;
  readonly categories: string[];
  readonly onSearchChange: (value: string) => void;
  readonly onCategoryChange: (value: string) => void;
  readonly onMinPriceChange: (value: string) => void;
  readonly onMaxPriceChange: (value: string) => void;
  readonly onInStockChange: (value: boolean) => void;
  readonly onSortByChange: (value: string) => void;
};

const FilterContent = memo(
  ({
    searchTerm,
    debouncedSearchTerm,
    categoryFilter,
    minPrice,
    maxPrice,
    inStock,
    sortBy,
    categories,
    onSearchChange,
    onCategoryChange,
    onMinPriceChange,
    onMaxPriceChange,
    onInStockChange,
    onSortByChange,
  }: FilterContentProps) => (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div>
        <label htmlFor="search" className="label">
          Buscar
        </label>
        <div className="relative">
          <input
            id="search"
            type="text"
            className="input pr-10"
            placeholder="Nombre o descripción..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm !== debouncedSearchTerm && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="animate-spin h-5 w-5 text-blue-400"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Categoría */}
      {categories.length > 0 && (
        <div>
          <label htmlFor="category" className="label">
            Categoría
          </label>
          <select
            id="category"
            className="input"
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Rango de precio */}
      <div>
        <label htmlFor="minPrice" className="label">
          Rango de precio
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            id="minPrice"
            type="number"
            className="input"
            placeholder="Mín"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
          />
          <input
            id="maxPrice"
            type="number"
            className="input"
            placeholder="Máx"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
          />
        </div>
      </div>

      {/* Stock disponible */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-sm font-medium">Solo con stock disponible</span>
        </label>
      </div>

      {/* Ordenar por */}
      <div>
        <label htmlFor="sortBy" className="label">
          Ordenar por
        </label>
        <select
          id="sortBy"
          className="input"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
        >
          <option value="newest">Más recientes</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="name-asc">Nombre: A-Z</option>
          <option value="name-desc">Nombre: Z-A</option>
        </select>
      </div>
    </div>
  )
);

FilterContent.displayName = "FilterContent";

export default function ProductsClient({
  categories,
  totalProducts,
}: ProductsClientProps) {
  const { theme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(totalProducts);
  const itemsPerPage = 12;

  // Debounce para el searchTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          sortBy,
        });

        if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
        if (categoryFilter !== "all") params.append("category", categoryFilter);
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
        if (inStock) params.append("inStock", "true");

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();

        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    currentPage,
    debouncedSearchTerm,
    categoryFilter,
    minPrice,
    maxPrice,
    inStock,
    sortBy,
  ]);

  // Reset page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearchTerm,
    categoryFilter,
    minPrice,
    maxPrice,
    inStock,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setSortBy("newest");
  };

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (categoryFilter !== "all") count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    if (inStock) count++;
    if (sortBy !== "newest") count++;
    return count;
  }, [searchTerm, categoryFilter, minPrice, maxPrice, inStock, sortBy]);

  // Obtener etiquetas de filtros activos
  const getActiveFilterLabels = () => {
    const labels = [];
    if (searchTerm) labels.push(`Búsqueda: "${searchTerm}"`);
    if (categoryFilter !== "all") labels.push(`Categoría: ${categoryFilter}`);
    if (minPrice) labels.push(`Precio min: $${minPrice}`);
    if (maxPrice) labels.push(`Precio max: $${maxPrice}`);
    if (inStock) labels.push("Solo con stock");
    if (sortBy !== "newest") {
      const sortLabels: Record<string, string> = {
        "price-asc": "Precio: menor a mayor",
        "price-desc": "Precio: mayor a menor",
        "name-asc": "Nombre: A-Z",
        "name-desc": "Nombre: Z-A",
      };
      labels.push(sortLabels[sortBy] || sortBy);
    }
    return labels;
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, total);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3">Catálogo de Productos</h1>
          <p className="text-white/60 text-lg">
            Explora nuestra colección completa ({totalProducts} productos)
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar de filtros - Desktop */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="card sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Filtros</h2>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Limpiar
                </button>
              </div>

              <FilterContent
                searchTerm={searchTerm}
                debouncedSearchTerm={debouncedSearchTerm}
                categoryFilter={categoryFilter}
                minPrice={minPrice}
                maxPrice={maxPrice}
                inStock={inStock}
                sortBy={sortBy}
                categories={categories}
                onSearchChange={setSearchTerm}
                onCategoryChange={setCategoryFilter}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                onInStockChange={setInStock}
                onSortByChange={setSortBy}
              />

              {/* Resultados */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-sm text-white/60">
                  {total > 0 ? (
                    <>
                      Mostrando{" "}
                      <span className="font-semibold text-white">
                        {startIndex}-{endIndex}
                      </span>{" "}
                      de {total} producto{total !== 1 ? "s" : ""}
                    </>
                  ) : (
                    "0 productos encontrados"
                  )}
                </p>
              </div>
            </div>
          </aside>

          {/* Bottom Sheet - Mobile */}
          {showFilters && (
            <>
              {/* Overlay */}
              <div
                className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setShowFilters(false)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setShowFilters(false);
                  }
                }}
              />

              {/* Bottom Sheet */}
              <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl">
                <div className="max-h-[80vh] overflow-y-auto">
                  {/* Header */}
                  <div className="sticky top-0 bg-black/95 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Filtros</h2>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        Limpiar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowFilters(false)}
                        className="text-white/60 hover:text-white"
                      >
                        <svg
                          className="w-6 h-6"
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
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-4">
                    <FilterContent
                      searchTerm={searchTerm}
                      debouncedSearchTerm={debouncedSearchTerm}
                      categoryFilter={categoryFilter}
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      inStock={inStock}
                      sortBy={sortBy}
                      categories={categories}
                      onSearchChange={setSearchTerm}
                      onCategoryChange={setCategoryFilter}
                      onMinPriceChange={setMinPrice}
                      onMaxPriceChange={setMaxPrice}
                      onInStockChange={setInStock}
                      onSortByChange={setSortBy}
                    />

                    {
                      /* Resultados */
                      <div className="mt-6 pt-4 border-t border-white/10">
                        <p className="text-sm text-white/60">
                          {total > 0 ? (
                            <>
                              Mostrando{" "}
                              <span className="font-semibold text-white">
                                {startIndex}-{endIndex}
                              </span>{" "}
                              de {total} producto{total !== 1 ? "s" : ""}
                            </>
                          ) : (
                            "0 productos encontrados"
                          )}
                        </p>
                      </div>
                    }

                    {/* Botón aplicar */}
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      className="w-full mt-4 btn bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Aplicar filtros
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Grid de productos */}
          <main className="lg:col-span-3">
            {/* Botón de filtros y filtros activos - Mobile */}
            <div className="lg:hidden mb-4 space-y-3">
              {/* Botón para abrir filtros */}
              <button
                type="button"
                onClick={() => setShowFilters(true)}
                className="w-full btn bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center gap-2"
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Filtros activos */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2">
                  {getActiveFilterLabels().map((label, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-400/30"
                    >
                      {label}
                    </span>
                  ))}
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full border border-red-400/30 hover:bg-red-500/30"
                  >
                    <svg
                      className="w-3 h-3"
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
                    Limpiar todo
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent mb-4"></div>
                  <p className="text-white/60">Cargando productos...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="card text-center py-16">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-white/5 flex items-center justify-center text-4xl">
                  📦
                </div>
                <h3 className="text-2xl font-semibold mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-white/60 mb-4">
                  Intenta ajustar los filtros de búsqueda
                </p>
                <button onClick={clearFilters} className="btn btn-primary">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Link
                      key={product._id}
                      href={`/products/${product._id}`}
                      className="card hover:bg-white/10 transition-all group cursor-pointer"
                    >
                      {/* Imagen del producto */}
                      <div className="bg-white/5 rounded-xl aspect-square mb-4 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <ImagePlaceholder size="md" />
                        )}
                      </div>

                      {/* Info del producto */}
                      <div>
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-400 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-sm text-white/60 mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Variantes */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {product.variants
                                .slice(0, 4)
                                .map((variant, idx) => (
                                  <span
                                    key={variant._id || idx}
                                    className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30"
                                  >
                                    {variant.type === "color" ? "🎨" : "💾"}{" "}
                                    {variant.name}
                                  </span>
                                ))}
                              {product.variants.length > 4 && (
                                <span
                                  className={`text-xs px-2 py-1 ${
                                    theme === "light"
                                      ? "text-gray-500"
                                      : "text-white/50"
                                  }`}
                                >
                                  +{product.variants.length - 4}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold">
                              ${formatPrice(product.price)}
                            </div>
                            <div className="text-sm text-white/50">
                              {product.stock > 0 ? (
                                <span className="text-green-400 font-medium">
                                  ✓ En stock ({product.stock})
                                </span>
                              ) : (
                                <span className="text-red-400 font-medium">
                                  Sin stock
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-blue-400 group-hover:translate-x-1 transition-transform">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
