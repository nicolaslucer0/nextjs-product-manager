"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import ImageUploader from "./ImageUploader";
import Button from "./Button";
import { proxyImage } from "@/lib/utils";

type Product = {
  _id?: string;
  title: string;
  description: string;
  category?: string;
  price: number;
  stock: number;
  images: string[];
  planCanje?: boolean;
};

type Props = {
  readonly product?: Product | null;
  readonly onSuccess?: () => void;
  readonly categories?: string[];
};

export default function ProductForm({
  product,
  onSuccess,
  categories = [],
}: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [planCanje, setPlanCanje] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  // Cargar datos del producto si está en modo edición
  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      setCategory(product.category || "");
      setPrice(product.price);
      setStock(product.stock);
      setPlanCanje(Boolean(product.planCanje));
      setImages(product.images || []);
    }
  }, [product]);

  function handleImageUploaded(url: string) {
    setImages([...images, url]);
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const productData = {
      title,
      description,
      category: category || undefined,
      price,
      stock,
      planCanje,
      images,
    };

    try {
      const token = localStorage.getItem("token");
      const isEditing = product?._id;
      const url = isEditing ? `/api/products/${product._id}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (res.ok) {
        if (!isEditing) {
          setTitle("");
          setDescription("");
          setPrice(0);
          setStock(0);
          setPlanCanje(false);
          setImages([]);
        }
        showToast(
          isEditing
            ? "Producto actualizado exitosamente"
            : "Producto creado exitosamente",
          "success",
        );
        if (onSuccess) {
          onSuccess();
        }
        setTimeout(() => {
          globalThis.location.reload();
        }, 1000);
      } else {
        const error = await res.json();
        showToast(error.error || "Error al guardar el producto", "error");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      showToast("Error al guardar el producto", "error");
    } finally {
      setLoading(false);
    }
  }

  const isEditing = product?._id;

  return (
    <form onSubmit={submit} className="space-y-6">
      <h3 className="text-2xl font-bold mb-6">
        {isEditing ? "Editar Producto" : "Crear Nuevo Producto"}
      </h3>

      {/* Información básica */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="title" className="label">
            Título del producto
          </label>
          <input
            id="title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: iPhone 15 Pro"
            required
          />
        </div>
        <div>
          <label htmlFor="category" className="label">
            Categoría
          </label>
          <select
            id="category"
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="price" className="label">
            Precio ($)
          </label>
          <input
            id="price"
            className="input"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="0.00"
          />
        </div>
        <div>
          <label htmlFor="stock" className="label">
            Stock
          </label>
          <input
            id="stock"
            className="input"
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            placeholder="0"
          />
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={planCanje}
            onChange={(e) => setPlanCanje(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <div>
            <p className="font-medium">Plan canje</p>
            <p className="text-xs text-white/60">
              Si está activo, se mostrará un botón en el detalle del producto
              para ir al cotizador.
            </p>
          </div>
        </label>
      </div>

      <div>
        <label htmlFor="description" className="label">
          Descripción
        </label>
        <textarea
          id="description"
          className="input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Describe el producto..."
        />
      </div>

      {/* Imágenes del producto */}
      <div>
        <ImageUploader
          onImageUploaded={handleImageUploaded}
          currentImages={images}
          maxImages={5}
          label="Imágenes del producto"
        />

        {/* Galería de imágenes cargadas */}
        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((img, index) => (
              <div
                key={img}
                className="relative group aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center"
              >
                <img
                  src={proxyImage(img)}
                  alt={`Producto ${index + 1}`}
                  className="w-full h-full object-contain p-2"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    className="w-4 h-4"
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
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 pt-6">
        <Button className="w-full md:w-auto" type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
              Guardando...
            </span>
          ) : isEditing ? (
            "Actualizar Producto"
          ) : (
            "Crear Producto"
          )}
        </Button>
      </div>
    </form>
  );
}
