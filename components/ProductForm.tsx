"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import ImageUploader from "./ImageUploader";
import Button from "./Button";
import { proxyImage } from "@/lib/utils";
import NumericInput from "./NumericInput";

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

  const isEditing = product?._id;

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
          setCategory("");
          setPrice(0);
          setStock(0);
          setPlanCanje(false);
          setImages([]);
        }
        showToast(
          isEditing ? "Producto actualizado" : "Producto creado",
          "success",
        );
        onSuccess?.();
        setTimeout(() => globalThis.location.reload(), 1000);
      } else {
        const error = await res.json();
        showToast(error.error || "Error al guardar", "error");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      showToast("Error al guardar el producto", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">
          {isEditing ? "Editar producto" : "Nuevo producto"}
        </h3>
        {isEditing && (
          <span className="text-xs text-white/40 font-mono">{product._id}</span>
        )}
      </div>

      {/* Sección 1: Datos principales */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-2">
          Información básica
        </legend>

        <div>
          <label htmlFor="title" className="label">
            Nombre del producto *
          </label>
          <input
            id="title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: iPhone 15 Pro 256GB"
            required
          />
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
            placeholder="Descripción corta del producto..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="price" className="label">
              Precio USD *
            </label>
            <NumericInput
              id="price"
              className="input"
              allowDecimals
              value={price || ""}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
          <div>
            <label htmlFor="stock" className="label">
              Stock *
            </label>
            <NumericInput
              id="stock"
              className="input"
              value={stock || ""}
              onChange={(e) => setStock(Number(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-white/10 bg-white/5 p-3">
          <input
            type="checkbox"
            checked={planCanje}
            onChange={(e) => setPlanCanje(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <div>
            <p className="font-medium text-sm">Habilitar plan canje</p>
            <p className="text-xs text-white/50">
              Muestra el botón de cotización en el detalle del producto.
            </p>
          </div>
        </label>
      </fieldset>

      {/* Sección 2: Imágenes */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-2">
          Imágenes
        </legend>

        <ImageUploader
          onImageUploaded={handleImageUploaded}
          currentImages={images}
          maxImages={5}
          label="Subí o pegá la URL de las imágenes"
        />

        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {images.map((img, index) => (
              <div
                key={img}
                className="relative group aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10"
              >
                <img
                  src={proxyImage(img)}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-contain p-1"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                    Principal
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </fieldset>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
        <Button type="submit" disabled={loading || !title.trim()}>
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Guardando...
            </span>
          ) : isEditing ? (
            "Guardar cambios"
          ) : (
            "Crear producto"
          )}
        </Button>
        {!loading && (
          <span className="text-xs text-white/30">
            {isEditing ? "Los cambios se aplicarán inmediatamente" : "El producto estará disponible en el catálogo"}
          </span>
        )}
      </div>
    </form>
  );
}
