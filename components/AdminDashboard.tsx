"use client";
import { deleteAllProducts } from "@/app/admin/deleteAllActions";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";
import { useEffect, useState } from "react";
import CategoryConfigManager from "./CategoryConfigManager";
import Pagination from "./Pagination";
import ProductForm from "./ProductForm";
import ProductImporter from "./ProductImporter";
import SocialLinksManager from "./SocialLinksManager";
import UserManagement from "./UserManagement";
import StatsCard from "./admin/StatsCard";
import TabNavigation from "./admin/TabNavigation";
import ProductTableRow from "./admin/ProductTableRow";
import ProductFilters from "./admin/ProductFilters";

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
  ).sort((a, b) => (a || "").localeCompare(b || ""));

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

  // Handler para actualizar el estado featured de un producto
  const handleFeaturedToggle = (
    productId: string,
    newFeaturedState: boolean
  ) => {
    setLocalProducts((prevProducts) =>
      prevProducts.map((p) =>
        p._id === productId ? { ...p, featured: newFeaturedState } : p
      )
    );
  };

  // Handler para editar un producto
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowCreateProduct(false);
  };

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
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isAdmin={isAdmin}
          stats={{
            totalProducts: stats.totalProducts,
            totalUsers: stats.totalUsers,
          }}
        />

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Productos"
                value={stats.totalProducts}
                bgColor="bg-blue-500/20"
                textColor="text-blue-400"
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                }
              />

              {isAdmin && (
                <>
                  <StatsCard
                    title="Total Usuarios"
                    value={stats.totalUsers}
                    bgColor="bg-green-500/20"
                    textColor="text-green-400"
                    icon={
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    }
                  />

                  <StatsCard
                    title="Usuarios Pendientes"
                    value={stats.pendingUsers}
                    bgColor="bg-orange-500/20"
                    textColor="text-orange-400"
                    icon={
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    }
                  />
                </>
              )}

              <StatsCard
                title="Stock Bajo"
                value={stats.lowStockProducts}
                bgColor="bg-red-500/20"
                textColor="text-red-400"
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                }
              />
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
                        showToast(result.message || "", "success");
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
                      console.error("Error al eliminar productos:", error);
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
                <ProductFilters
                  searchQuery={searchQuery}
                  categoryFilter={categoryFilter}
                  categories={categories as string[]}
                  theme={theme}
                  onSearchChange={setSearchQuery}
                  onCategoryChange={setCategoryFilter}
                />
              </div>

              {/* Resultados de búsqueda */}
              {searchQuery &&
                (() => {
                  const productCount = filteredProducts.length;
                  const pluralSuffix = productCount === 1 ? "" : "s";
                  const message =
                    productCount === 0
                      ? "No se encontraron productos"
                      : `Se encontraron ${productCount} producto${pluralSuffix}`;

                  return (
                    <p
                      className={`text-sm mb-4 ${
                        theme === "light" ? "text-gray-600" : "text-white/60"
                      }`}
                    >
                      {message}
                    </p>
                  );
                })()}

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
                          <ProductTableRow
                            key={product._id}
                            product={product}
                            theme={theme}
                            onEdit={handleEditProduct}
                            onFeaturedToggle={handleFeaturedToggle}
                            onToast={showToast}
                          />
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
