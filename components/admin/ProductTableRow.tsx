import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { toggleFeatured } from "@/app/admin/featuredActions";
import { deleteProduct } from "@/app/admin/actions";

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

type ProductTableRowProps = {
  readonly product: Product;
  readonly theme: string;
  readonly onEdit: (product: Product) => void;
  readonly onFeaturedToggle: (
    productId: string,
    newFeaturedState: boolean
  ) => void;
  readonly onToast: (message: string, type: "success" | "error") => void;
};

export default function ProductTableRow({
  product,
  theme,
  onEdit,
  onFeaturedToggle,
  onToast,
}: ProductTableRowProps) {
  const handleToggleFeatured = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await toggleFeatured(product._id);
      if (result.success) {
        onFeaturedToggle(product._id, result.featured!);
        onToast("Producto destacado actualizado", "success");
      } else {
        onToast(result.error || "Error al actualizar", "error");
      }
    } catch (error) {
      console.error("Error toggling featured:", error);
      onToast("Error al actualizar producto", "error");
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const rowClasses = `border-b transition-colors ${
    theme === "light"
      ? "border-gray-100 hover:bg-gray-50"
      : "border-white/5 hover:bg-white/5"
  }`;

  const textClasses = theme === "light" ? "text-gray-900" : "text-white";
  const mutedTextClasses =
    theme === "light" ? "text-gray-500" : "text-white/50";

  return (
    <tr className={rowClasses}>
      {/* Imagen */}
      <td className="py-3 px-2">
        <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-white/5">
          {product.images?.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <div
              className={`w-full h-full ${
                theme === "light" ? "bg-gray-100" : "bg-white/5"
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
            className={`font-semibold hover:text-blue-400 ${textClasses}`}
          >
            {product.title}
          </Link>
          <p className={`text-xs mt-1 line-clamp-2 ${mutedTextClasses}`}>
            {product.description}
          </p>
          {product.variants && product.variants.length > 0 && (
            <div className="flex gap-1 mt-1">
              {product.variants.slice(0, 2).map((v) => (
                <span
                  key={v._id || v.id || v.name}
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
        <span className="text-sm">{product.category || "-"}</span>
      </td>

      {/* Precio */}
      <td className="py-3 px-2">
        <span className="font-semibold">${formatPrice(product.price)}</span>
      </td>

      {/* Stock */}
      <td className="py-3 px-2 hidden sm:table-cell">
        <span
          className={`text-sm ${
            product.stock > 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {product.stock}
        </span>
      </td>

      {/* Acciones */}
      <td className="py-3 px-2">
        <div className="flex gap-1 justify-end">
          <button
            onClick={handleToggleFeatured}
            className={`btn-icon ${
              product.featured ? "text-yellow-400" : "text-white/40"
            }`}
            title={
              product.featured ? "Quitar de destacados" : "Destacar en home"
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
            onClick={handleEdit}
            className="btn-icon text-green-400 hover:text-green-300"
            title="Editar"
          >
            ✏️
          </button>
          <form
            action={async () => {
              await deleteProduct(product._id);
            }}
          >
            <button
              type="submit"
              className="btn-icon text-red-400 hover:text-red-300"
              title="Eliminar"
              onClick={(e) => e.stopPropagation()}
            >
              🗑️
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
