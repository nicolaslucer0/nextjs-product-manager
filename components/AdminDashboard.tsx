"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import ProductForm from "./ProductForm";
import UserManagement from "./UserManagement";
import SocialLinksManager from "./SocialLinksManager";
import ProductImporter from "./ProductImporter";
import CategoryConfigManager from "./CategoryConfigManager";
import Pagination from "./Pagination";
import { deleteProduct } from "@/app/admin/actions";
import { deleteAllProducts } from "@/app/admin/deleteAllActions";
import { toggleFeatured } from "@/app/admin/featuredActions";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type Variant = {
  _id?: string;
  id?: string;
  name: string;
  type: "color" | "storage";
  price: number;
  stock: number;
  image: string;
};

type Product = {
  _id: string;
  externalId?: string;
  title: string;
  description: string;
  category?: string;
  price: number;
  stock: number;
  images: string[];
  variants?: Variant[];
  featured?: boolean;
};

type User = {
  _id: string;
  name: string;
  role: "ADMIN" | "USER";
  email: string;
  active: boolean;
  createdAt: string;
};

type Stats = {
  totalProducts: number;
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  lowStockProducts: number;
};

type Props = {
  readonly products: Product[];
  readonly users: User[];
  readonly stats: Stats;
};

export default function AdminDashboard({ products, users, stats }: Props) {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "users" | "social" | "import" | "config"
  >("products");
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Reset page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter]);

  // Determinar si el usuario es admin basándose en si tiene acceso a usuarios
  const isAdmin = users.length > 0;

  // Obtener categorías únicas
  const categories = Array.from(
    new Set(localProducts.map((p) => p.category).filter(Boolean))
  ).sort();

  // Filtrar productos según búsqueda y categoría
  const filteredProducts = localProducts.filter((product) => {
    const query = searchQuery.toLowerCase();
    const matchesTitle = product.title.toLowerCase().includes(query);
    const matchesId = product._id.toLowerCase().includes(query);
    const matchesExternalId = product.externalId?.toLowerCase().includes(query);
    const matchesSearch = matchesTitle || matchesId || matchesExternalId;

    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Dashboard de {isAdmin ? "Administración" : "Gestión"}
          </h1>
          <p className="text-white/60">
            {isAdmin
              ? "Gestiona productos, usuarios y visualiza estadísticas"
              : "Gestiona productos y visualiza estadísticas"}
          </p>
        </div>

        {/* Tabs - Responsive */}
        <div className="mb-6">
          {/* Mobile: Dropdown */}
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="w-full card py-3 px-4 text-white bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="products">
                📦 Productos ({stats.totalProducts})
              </option>
              {isAdmin && (
                <option value="users">👥 Usuarios ({stats.totalUsers})</option>
              )}
              <option value="social">🌐 Redes Sociales</option>
              <option value="import">📥 Importar Excel</option>
              <option value="config">⚙️ Configuración</option>
              <option value="overview">📊 Resumen</option>
            </select>
          </div>

          {/* Desktop: Horizontal Tabs */}
          <div className="hidden sm:block border-b border-white/10">
            <nav className="flex gap-4 lg:gap-8 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab("products")}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap text-sm lg:text-base ${
                  activeTab === "products"
                    ? "border-blue-400 text-blue-400"
                    : "border-transparent text-white/50 hover:text-white/70"
                }`}
              >
                📦 Productos ({stats.totalProducts})
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab("users")}
                  className={`pb-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap text-sm lg:text-base ${
                    activeTab === "users"
                      ? "border-blue-400 text-blue-400"
                      : "border-transparent text-white/50 hover:text-white/70"
                  }`}
                >
                  👥 Usuarios ({stats.totalUsers})
                </button>
              )}
              <button
                onClick={() => setActiveTab("social")}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap text-sm lg:text-base ${
                  activeTab === "social"
                    ? "border-blue-400 text-blue-400"
                    : "border-transparent text-white/50 hover:text-white/70"
                }`}
              >
                🌐 Redes Sociales
              </button>
              <button
                onClick={() => setActiveTab("import")}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap text-sm lg:text-base ${
                  activeTab === "import"
                    ? "border-blue-400 text-blue-400"
                    : "border-transparent text-white/50 hover:text-white/70"
                }`}
              >
                📥 Importar Excel
              </button>
              <button
                onClick={() => setActiveTab("config")}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap text-sm lg:text-base ${
                  activeTab === "config"
                    ? "border-blue-400 text-blue-400"
                    : "border-transparent text-white/50 hover:text-white/70"
                }`}
              >
                ⚙️ Configuración
              </button>
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-4 px-1 border-b-2 font-medium transition-colors whitespace-nowrap text-sm lg:text-base ${
                  activeTab === "overview"
                    ? "border-blue-400 text-blue-400"
                    : "border-transparent text-white/50 hover:text-white/70"
                }`}
              >
                📊 Resumen
              </button>
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">
                      Total Productos
                    </p>
                    <p className="text-3xl font-bold">{stats.totalProducts}</p>
                  </div>
                  <div className="bg-blue-500/20 rounded-full p-3">
                    <svg
                      className="w-8 h-8 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <>
                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/60 mb-1">
                          Total Usuarios
                        </p>
                        <p className="text-3xl font-bold">{stats.totalUsers}</p>
                      </div>
                      <div className="bg-green-500/20 rounded-full p-3">
                        <svg
                          className="w-8 h-8 text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/60 mb-1">
                          Usuarios Pendientes
                        </p>
                        <p className="text-3xl font-bold">
                          {stats.pendingUsers}
                        </p>
                      </div>
                      <div className="bg-orange-500/20 rounded-full p-3">
                        <svg
                          className="w-8 h-8 text-orange-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60 mb-1">Stock Bajo</p>
                    <p className="text-3xl font-bold">
                      {stats.lowStockProducts}
                    </p>
                  </div>
                  <div className="bg-red-500/20 rounded-full p-3">
                    <svg
                      className="w-8 h-8 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">Acciones Rápidas</h2>
              <div
                className={`grid grid-cols-1 ${
                  isAdmin ? "md:grid-cols-3" : "md:grid-cols-2"
                } gap-4`}
              >
                <button
                  onClick={() => {
                    setActiveTab("products");
                    setShowCreateProduct(true);
                  }}
                  className="btn btn-primary flex items-center justify-center gap-2"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Crear Producto
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab("users")}
                    className="btn bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center gap-2"
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
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    Gestionar Usuarios
                  </button>
                )}
                <Link
                  href="/products"
                  className="btn bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center gap-2"
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Ver Catálogo Público
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Create/Edit Product Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                Gestión de Productos
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={async () => {
                    if (
                      !confirm(
                        "⚠️ ¿Estás seguro de que quieres eliminar TODOS los productos? Esta acción no se puede deshacer."
                      )
                    ) {
                      return;
                    }

                    if (
                      !confirm(
                        "⚠️ ÚLTIMA CONFIRMACIÓN: Se eliminarán " +
                          localProducts.length +
                          " productos. ¿Continuar?"
                      )
                    ) {
                      return;
                    }

                    try {
                      const result = await deleteAllProducts();
                      if (result.success) {
                        showToast(result.message, "success");
                        setTimeout(() => {
                          globalThis.location.reload();
                        }, 1000);
                      } else {
                        showToast(
                          result.error || "Error al eliminar productos",
                          "error"
                        );
                      }
                    } catch (error) {
                      showToast("Error al eliminar productos", "error");
                    }
                  }}
                  className="btn bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 flex items-center justify-center gap-2 text-sm sm:text-base"
                  title="Eliminar todos los productos de la base de datos"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span className="hidden sm:inline">Eliminar Todos</span>
                  <span className="sm:hidden">Eliminar Todo</span>
                </button>
                <button
                  onClick={() => {
                    setShowCreateProduct(!showCreateProduct);
                    setEditingProduct(null);
                  }}
                  className="btn btn-primary flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {showCreateProduct || editingProduct ? (
                    <>
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
                      Cancelar
                    </>
                  ) : (
                    <>
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
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Crear Producto
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Create/Edit Product Form */}
            {(showCreateProduct || editingProduct) && (
              <div className="card">
                <ProductForm
                  product={editingProduct as any}
                  categories={categories as string[]}
                  onSuccess={() => {
                    setShowCreateProduct(false);
                    setEditingProduct(null);
                  }}
                />
              </div>
            )}

            {/* Products List */}
            <div className="card">
              <div className="flex flex-col gap-4 mb-6">
                <h3 className="text-xl font-semibold">
                  Todos los Productos ({localProducts.length})
                </h3>

                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Selector de categoría */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      theme === "light"
                        ? "bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        : "bg-white/5 border-white/10 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                    }`}
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full px-4 py-2 pl-10 rounded-lg border transition-colors ${
                        theme === "light"
                          ? "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          : "bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                      }`}
                    />
                    <svg
                      className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                        theme === "light" ? "text-gray-400" : "text-white/40"
                      }`}
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
                        onClick={() => setSearchQuery("")}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                          theme === "light"
                            ? "text-gray-400 hover:text-gray-600"
                            : "text-white/40 hover:text-white/60"
                        }`}
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
              </div>

              {/* Resultados de búsqueda */}
              {searchQuery && (
                <p
                  className={`text-sm mb-4 ${
                    theme === "light" ? "text-gray-600" : "text-white/60"
                  }`}
                >
                  {filteredProducts.length === 0
                    ? "No se encontraron productos"
                    : `Se encontraron ${filteredProducts.length} producto${
                        filteredProducts.length === 1 ? "" : "s"
                      }`}
                </p>
              )}

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-white/5 w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-white/30"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    No hay productos
                  </h3>
                  <p className="text-white/60 mb-4">
                    Comienza creando tu primer producto
                  </p>
                  <button
                    onClick={() => setShowCreateProduct(true)}
                    className="btn btn-primary"
                  >
                    Crear Producto
                  </button>
                </div>
              ) : (
                <>
                  {/* Vista de Lista / Tabla */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr
                          className={`border-b ${
                            theme === "light"
                              ? "border-gray-200"
                              : "border-white/10"
                          }`}
                        >
                          <th className="text-left py-3 px-2 text-sm font-semibold">
                            Imagen
                          </th>
                          <th className="text-left py-3 px-2 text-sm font-semibold">
                            Producto
                          </th>
                          <th className="text-left py-3 px-2 text-sm font-semibold hidden md:table-cell">
                            Categoría
                          </th>
                          <th className="text-left py-3 px-2 text-sm font-semibold">
                            Precio
                          </th>
                          <th className="text-left py-3 px-2 text-sm font-semibold hidden sm:table-cell">
                            Stock
                          </th>
                          <th className="text-right py-3 px-2 text-sm font-semibold">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map((product) => (
                          <tr
                            key={product._id}
                            className={`border-b transition-colors ${
                              theme === "light"
                                ? "border-gray-100 hover:bg-gray-50"
                                : "border-white/5 hover:bg-white/5"
                            }`}
                          >
                            {/* Imagen */}
                            <td className="py-3 px-2">
                              <div className="w-16 h-16 rounded-lg overflow-hidden">
                                {product.images && product.images.length > 0 ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div
                                    className={`w-full h-full ${
                                      theme === "light"
                                        ? "bg-gray-100"
                                        : "bg-white/5"
                                    }`}
                                  />
                                )}
                              </div>
                            </td>

                            {/* Producto */}
                            <td className="py-3 px-2">
                              <div className="flex flex-col">
                                <Link
                                  href={`/products/${product._id}`}
                                  className={`font-semibold hover:text-blue-400 ${
                                    theme === "light"
                                      ? "text-gray-900"
                                      : "text-white"
                                  }`}
                                >
                                  {product.title}
                                </Link>
                                <p
                                  className={`text-xs mt-1 line-clamp-2 ${
                                    theme === "light"
                                      ? "text-gray-500"
                                      : "text-white/50"
                                  }`}
                                >
                                  {product.description}
                                </p>
                                {product.variants &&
                                  product.variants.length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                      {product.variants
                                        .slice(0, 2)
                                        .map((v, idx) => (
                                          <span
                                            key={idx}
                                            className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400"
                                          >
                                            {v.name}
                                          </span>
                                        ))}
                                      {product.variants.length > 2 && (
                                        <span className="text-xs text-white/40">
                                          +{product.variants.length - 2}
                                        </span>
                                      )}
                                    </div>
                                  )}
                              </div>
                            </td>

                            {/* Categoría */}
                            <td className="py-3 px-2 hidden md:table-cell">
                              <span className="text-sm">
                                {product.category || "-"}
                              </span>
                            </td>

                            {/* Precio */}
                            <td className="py-3 px-2">
                              <span className="font-semibold">
                                ${formatPrice(product.price)}
                              </span>
                            </td>

                            {/* Stock */}
                            <td className="py-3 px-2 hidden sm:table-cell">
                              <span
                                className={`text-sm ${
                                  product.stock > 0
                                    ? "text-green-400"
                                    : "text-red-400"
                                }`}
                              >
                                {product.stock}
                              </span>
                            </td>

                            {/* Acciones */}
                            <td className="py-3 px-2">
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    (async () => {
                                      try {
                                        console.log(
                                          "Toggling featured for product:",
                                          product._id,
                                          "Current featured:",
                                          product.featured
                                        );
                                        const result = await toggleFeatured(
                                          product._id
                                        );
                                        console.log("Toggle result:", result);

                                        if (result.success) {
                                          // Actualizar el estado local
                                          setLocalProducts((prevProducts) =>
                                            prevProducts.map((p) =>
                                              p._id === product._id
                                                ? {
                                                    ...p,
                                                    featured: result.featured,
                                                  }
                                                : p
                                            )
                                          );
                                          showToast(
                                            "Producto destacado actualizado",
                                            "success"
                                          );
                                        } else {
                                          showToast(
                                            result.error ||
                                              "Error al actualizar",
                                            "error"
                                          );
                                        }
                                      } catch (error) {
                                        console.error(
                                          "Error toggling featured:",
                                          error
                                        );
                                        showToast(
                                          "Error al actualizar producto",
                                          "error"
                                        );
                                      }
                                    })();
                                  }}
                                  className={`btn-icon ${
                                    product.featured
                                      ? "text-yellow-400"
                                      : "text-white/40"
                                  }`}
                                  title={
                                    product.featured
                                      ? "Quitar de destacados"
                                      : "Destacar en home"
                                  }
                                >
                                  {product.featured ? "⭐" : "☆"}
                                </button>
                                <Link
                                  href={`/products/${product._id}`}
                                  className="btn-icon text-blue-400 hover:text-blue-300"
                                  title="Ver detalle"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  👁️
                                </Link>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingProduct(product);
                                    setShowCreateProduct(false);
                                    window.scrollTo({
                                      top: 0,
                                      behavior: "smooth",
                                    });
                                  }}
                                  className="btn-icon text-green-400 hover:text-green-300"
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <form
                                  onClick={(e) => e.stopPropagation()}
                                  action={async () => {
                                    await deleteProduct(product._id);
                                  }}
                                >
                                  <button
                                    type="submit"
                                    className="btn-icon text-red-400 hover:text-red-300"
                                    title="Eliminar"
                                  >
                                    🗑️
                                  </button>
                                </form>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Gestión de Usuarios</h2>
            </div>
            <UserManagement users={users} />
          </div>
        )}

        {/* Social Links Tab */}
        {activeTab === "social" && (
          <div className="space-y-6">
            <SocialLinksManager />
          </div>
        )}

        {/* Import Tab */}
        {activeTab === "import" && (
          <div className="space-y-6">
            <ProductImporter />
          </div>
        )}

        {/* Config Tab */}
        {activeTab === "config" && (
          <div className="space-y-6">
            <CategoryConfigManager categories={categories as string[]} />
          </div>
        )}
      </div>
    </div>
  );
}
