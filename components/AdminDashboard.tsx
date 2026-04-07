"use client";
import { deleteAllProducts } from "@/app/admin/deleteAllActions";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { useEffect, useState } from "react";
import Button from "./Button";
import CategoryConfigManager from "./CategoryConfigManager";
import Pagination from "./Pagination";
import ProductForm from "./ProductForm";
import ProductImporter from "./ProductImporter";
import SocialLinksManager from "./SocialLinksManager";
import UsedPhonePricingManager from "./UsedPhonePricingManager";
import UserManagement from "./UserManagement";
import StatsCard from "./admin/StatsCard";
import AdminSidebar from "./admin/AdminSidebar";
import type { AdminTab } from "./admin/AdminSidebar";
import ProductTableRow from "./admin/ProductTableRow";
import ProductFilters from "./admin/ProductFilters";
import CategoryManager from "./admin/CategoryManager";
import DollarRateManager from "./admin/DollarRateManager";
import PaymentMessageManager from "./admin/PaymentMessageManager";
import ShippingMessageManager from "./admin/ShippingMessageManager";

type Product = {
  _id: string;
  externalId?: string;
  title: string;
  description: string;
  category?: string;
  price: number;
  stock: number;
  images: string[];
  featured?: boolean;
  planCanje?: boolean;
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
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter]);

  const isAdmin = users.length > 0;

  // Categorías desde la API
  const [categories, setCategories] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.map((c: { name: string }) => c.name)))
      .catch(() => {});
  }, []);

  // Filtrar productos
  const filteredProducts = localProducts.filter((product) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      product.title.toLowerCase().includes(query) ||
      product._id.toLowerCase().includes(query) ||
      product.externalId?.toLowerCase().includes(query);
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleFeaturedToggle = (id: string, featured: boolean) => {
    setLocalProducts((prev) => prev.map((p) => (p._id === id ? { ...p, featured } : p)));
  };

  const handlePlanCanjeToggle = (id: string, planCanje: boolean) => {
    setLocalProducts((prev) => prev.map((p) => (p._id === id ? { ...p, planCanje } : p)));
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setShowProductForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const isFormOpen = showProductForm || editingProduct !== null;

  const borderClass = theme === "light" ? "border-gray-200" : "border-white/10";

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto py-8">
        {/* Header */}
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Panel de administración</h1>
          <p className={theme === "light" ? "text-gray-500" : "text-white/50"}>
            Gestioná productos, configuración y más
          </p>
        </div>

        {/* Layout: sidebar + contenido */}
        <div className="flex gap-8">
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isAdmin={isAdmin}
            stats={{ totalProducts: stats.totalProducts, totalUsers: stats.totalUsers }}
          />

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">

        {/* =================== PRODUCTOS =================== */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Formulario crear/editar */}
            {isFormOpen && (
              <div className="card relative">
                <button
                  type="button"
                  onClick={closeForm}
                  className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors"
                  title="Cerrar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <ProductForm
                  product={editingProduct}
                  categories={categories}
                  onSuccess={closeForm}
                />
              </div>
            )}

            {/* Toolbar */}
            {!isFormOpen && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold">
                  Productos ({localProducts.length})
                </h2>
                <Button onClick={openCreateForm} className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo producto
                </Button>
              </div>
            )}

            {/* Lista de productos */}
            <div className="card">
              <div className="mb-4">
                <ProductFilters
                  searchQuery={searchQuery}
                  categoryFilter={categoryFilter}
                  categories={categories}
                  theme={theme}
                  onSearchChange={setSearchQuery}
                  onCategoryChange={setCategoryFilter}
                />
              </div>

              {searchQuery && (
                <p className={`text-sm mb-4 ${theme === "light" ? "text-gray-600" : "text-white/60"}`}>
                  {filteredProducts.length === 0
                    ? "No se encontraron productos"
                    : `${filteredProducts.length} resultado${filteredProducts.length !== 1 ? "s" : ""}`}
                </p>
              )}

              {filteredProducts.length === 0 && !searchQuery ? (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📦</p>
                  <h3 className="text-lg font-semibold mb-2">No hay productos</h3>
                  <p className={`mb-4 ${theme === "light" ? "text-gray-500" : "text-white/50"}`}>
                    Empezá creando tu primer producto
                  </p>
                  <Button onClick={openCreateForm}>Crear producto</Button>
                </div>
              ) : filteredProducts.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={`border-b ${borderClass}`}>
                          <th className="text-left py-3 px-2 text-sm font-semibold">Imagen</th>
                          <th className="text-left py-3 px-2 text-sm font-semibold">Producto</th>
                          <th className="text-left py-3 px-2 text-sm font-semibold hidden md:table-cell">Categoría</th>
                          <th className="text-left py-3 px-2 text-sm font-semibold">Precio</th>
                          <th className="text-left py-3 px-2 text-sm font-semibold hidden sm:table-cell">Stock</th>
                          <th className="text-left py-3 px-2 text-sm font-semibold hidden md:table-cell">Plan canje</th>
                          <th className="text-right py-3 px-2 text-sm font-semibold">Acciones</th>
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
                            onPlanCanjeToggle={handlePlanCanjeToggle}
                            onToast={showToast}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}

                  {/* Zona peligrosa - colapsada */}
                  <details className="mt-6 pt-4 border-t border-red-500/20">
                    <summary className="text-sm text-red-400/60 cursor-pointer hover:text-red-400 transition-colors">
                      Zona peligrosa
                    </summary>
                    <div className="mt-3">
                      <button
                        onClick={async () => {
                          if (!confirm("¿Estás seguro de que querés eliminar TODOS los productos? Esta acción no se puede deshacer.")) return;
                          if (!confirm(`ÚLTIMA CONFIRMACIÓN: Se eliminarán ${localProducts.length} productos. ¿Continuar?`)) return;
                          try {
                            const result = await deleteAllProducts();
                            if (result.success) {
                              showToast(result.message || "", "success");
                              setTimeout(() => globalThis.location.reload(), 1000);
                            } else {
                              showToast(result.error || "Error al eliminar", "error");
                            }
                          } catch {
                            showToast("Error al eliminar productos", "error");
                          }
                        }}
                        className="btn bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 text-sm flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar todos los productos
                      </button>
                    </div>
                  </details>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* =================== CATEGORÍAS =================== */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <CategoryManager />
          </div>
        )}

        {/* =================== CONFIGURACIÓN =================== */}
        {activeTab === "config" && (
          <div className="space-y-6">
            <div className="card">
              <DollarRateManager />
            </div>
            <div className="card">
              <PaymentMessageManager />
            </div>
            <div className="card">
              <ShippingMessageManager />
            </div>
            <div className="card">
              <CategoryConfigManager categories={categories} />
            </div>
          </div>
        )}

        {/* =================== USUARIOS =================== */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <UserManagement users={users} />
          </div>
        )}

        {/* =================== REDES SOCIALES =================== */}
        {activeTab === "social" && (
          <div className="space-y-6">
            <SocialLinksManager />
          </div>
        )}

        {/* =================== COTIZACIÓN USADOS =================== */}
        {activeTab === "used" && (
          <div className="space-y-6">
            <UsedPhonePricingManager />
          </div>
        )}

        {/* =================== IMPORTAR =================== */}
        {activeTab === "import" && (
          <div className="space-y-6">
            <ProductImporter />
          </div>
        )}

        {/* =================== RESUMEN =================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Productos"
                value={stats.totalProducts}
                bgColor="bg-blue-500/20"
                textColor="text-blue-400"
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />}
              />
              {isAdmin && (
                <>
                  <StatsCard
                    title="Total Usuarios"
                    value={stats.totalUsers}
                    bgColor="bg-green-500/20"
                    textColor="text-green-400"
                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />}
                  />
                  <StatsCard
                    title="Usuarios Pendientes"
                    value={stats.pendingUsers}
                    bgColor="bg-orange-500/20"
                    textColor="text-orange-400"
                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                  />
                </>
              )}
              <StatsCard
                title="Stock Bajo"
                value={stats.lowStockProducts}
                bgColor="bg-red-500/20"
                textColor="text-red-400"
                icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
              />
            </div>
          </div>
        )}

          </div>{/* /flex-1 */}
        </div>{/* /flex gap-8 */}
      </div>
    </div>
  );
}
