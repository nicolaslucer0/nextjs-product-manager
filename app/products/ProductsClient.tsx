"use client";
import { useState, useMemo } from "react";
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
  readonly products: Product[];
};

export default function ProductsClient({ products }: ProductsClientProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [inStock, setInStock] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Obtener categorías únicas
  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort(
        (a, b) => a!.localeCompare(b!)
      ),
    [products]
  );

  // Filtrado y ordenamiento
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Búsqueda por texto
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de categoría
    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    // Filtro de precio mínimo
    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= Number.parseFloat(minPrice));
    }

    // Filtro de precio máximo
    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number.parseFloat(maxPrice));
    }

    // Filtro de stock
    if (inStock) {
      filtered = filtered.filter((p) => p.stock > 0);
    }

    // Ordenamiento
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "newest":
      default:
        // Ya viene ordenado por createdAt desc
        break;
    }

    return filtered;
  }, [
    products,
    searchTerm,
    categoryFilter,
    sortBy,
    minPrice,
    maxPrice,
    inStock,
  ]);

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, minPrice, maxPrice, inStock, sortBy]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setSortBy("newest");
  };

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div>
        <label htmlFor="search" className="label">
          Buscar
        </label>
        <input
          id="search"
          type="text"
          className="input"
          placeholder="Nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
            onChange={(e) => setCategoryFilter(e.target.value)}
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
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            id="maxPrice"
            type="number"
            className="input"
            placeholder="Máx"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Stock disponible */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
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
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Más recientes</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="name-asc">Nombre: A-Z</option>
          <option value="name-desc">Nombre: Z-A</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-3">Catálogo de Productos</h1>
          <p className="text-white/60 text-lg">
            Explora nuestra colección completa ({products.length} productos)
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar de filtros - Desktop */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="card sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Filtros</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Limpiar
                </button>
              </div>

              <FilterContent />

              {/* Resultados */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-sm text-white/60">
                  {filteredProducts.length > 0 ? (
                    <>
                      Mostrando{" "}
                      <span className="font-semibold text-white">
                        {startIndex + 1}-
                        {Math.min(endIndex, filteredProducts.length)}
                      </span>{" "}
                      de {filteredProducts.length} producto
                      {filteredProducts.length !== 1 ? "s" : ""}
                      {filteredProducts.length !== products.length && (
                        <> ({products.length} totales)</>
                      )}
                    </>
                  ) : (
                    "0 productos encontrados"
                  )}
                </p>
              </div>
            </div>
          </aside>

          {/* Botón flotante de filtros - Mobile */}
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="lg:hidden fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl flex items-center gap-2 font-medium transition-all"
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
            {(searchTerm ||
              minPrice ||
              maxPrice ||
              inStock ||
              sortBy !== "newest") && (
              <span className="bg-red-500 rounded-full w-2 h-2 absolute -top-1 -right-1" />
            )}
          </button>

          {/* Bottom Sheet - Mobile */}
          {showFilters && (
            <>
              {/* Overlay */}
              <div
                className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                onClick={() => setShowFilters(false)}
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
                    <FilterContent />

                    {/* Resultados */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <p className="text-sm text-white/60">
                        {filteredProducts.length > 0 ? (
                          <>
                            Mostrando{" "}
                            <span className="font-semibold text-white">
                              {startIndex + 1}-
                              {Math.min(endIndex, filteredProducts.length)}
                            </span>{" "}
                            de {filteredProducts.length} producto
                            {filteredProducts.length !== 1 ? "s" : ""}
                            {filteredProducts.length !== products.length && (
                              <> ({products.length} totales)</>
                            )}
                          </>
                        ) : (
                          "0 productos encontrados"
                        )}
                      </p>
                    </div>

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
            {filteredProducts.length === 0 ? (
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
                  {paginatedProducts.map((product) => (
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
