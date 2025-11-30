"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import ImageUploader from "./ImageUploader";
import { formatPrice } from "@/lib/utils";

type Variant = {
  id: string;
  name: string;
  type: "color" | "storage";
  price: number;
  stock: number;
  image: string;
};

type Product = {
  _id?: string;
  title: string;
  description: string;
  category?: string;
  price: number;
  stock: number;
  images: string[];
  variants?: Variant[];
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
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showVariantForm, setShowVariantForm] = useState(false);

  // Estado para nueva variante
  const [variantName, setVariantName] = useState("");
  const [variantType, setVariantType] = useState<"color" | "storage">("color");
  const [variantPrice, setVariantPrice] = useState<number>(0);
  const [variantStock, setVariantStock] = useState<number>(0);
  const [variantImage, setVariantImage] = useState("");
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  // Cargar datos del producto si está en modo edición
  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setDescription(product.description);
      setCategory(product.category || "");
      setPrice(product.price);
      setStock(product.stock);
      setImages(product.images || []);
      if (product.variants) {
        setVariants(
          product.variants.map((v: any) => ({
            id: v._id || Date.now().toString(),
            name: v.name,
            type: v.type,
            price: v.price,
            stock: v.stock,
            image: v.image,
          }))
        );
      }
    }
  }, [product]);

  function addVariant() {
    if (!variantName) {
      showToast("El nombre de la variante es requerido", "warning");
      return;
    }

    if (editingVariantId) {
      // Editar variante existente
      setVariants(
        variants.map((v) =>
          v.id === editingVariantId
            ? {
                ...v,
                name: variantName,
                type: variantType,
                price: variantPrice,
                stock: variantStock,
                image: variantImage,
              }
            : v
        )
      );
      showToast("Variante actualizada", "success");
    } else {
      // Agregar nueva variante
      const newVariant: Variant = {
        id: Date.now().toString(),
        name: variantName,
        type: variantType,
        price: variantPrice,
        stock: variantStock,
        image: variantImage,
      };
      setVariants([...variants, newVariant]);
      showToast("Variante agregada", "success");
    }

    // Reset form
    resetVariantForm();
  }

  function resetVariantForm() {
    setVariantName("");
    setVariantPrice(0);
    setVariantStock(0);
    setVariantImage("");
    setEditingVariantId(null);
    setShowVariantForm(false);
  }

  function editVariant(variant: Variant) {
    setVariantName(variant.name);
    setVariantType(variant.type);
    setVariantPrice(variant.price);
    setVariantStock(variant.stock);
    setVariantImage(variant.image);
    setEditingVariantId(variant.id);
    setShowVariantForm(true);
  }

  function removeVariant(id: string) {
    setVariants(variants.filter((v) => v.id !== id));
  }

  function handleImageUploaded(url: string) {
    setImages([...images, url]);
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
  }

  function handleVariantImageUploaded(url: string) {
    setVariantImage(url);
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
      images,
      variants: variants.map((v) => ({
        name: v.name,
        type: v.type,
        price: v.price,
        stock: v.stock,
        image: v.image,
      })),
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
          setImages([]);
          setVariants([]);
        }
        showToast(
          isEditing
            ? "Producto actualizado exitosamente"
            : "Producto creado exitosamente",
          "success"
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
          <input
            id="category"
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Ej: Smartphones, Laptops, etc."
            list="categories-list"
          />
          {categories.length > 0 && (
            <datalist id="categories-list">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          )}
          <p className="text-xs text-white/50 mt-1">
            Escribe una nueva categoría o selecciona una existente
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="price" className="label">
            Precio base ($)
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
            Stock base
          </label>
          <input
            id="stock"
            className="input"
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            placeholder="0"
          />
          <p className="text-xs text-white/50 mt-1">
            Stock general (si no usas variantes)
          </p>
        </div>
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
                className="relative group aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10"
              >
                <img
                  src={img}
                  alt={`Producto ${index + 1}`}
                  className="w-full h-full object-cover"
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

      {/* Sección de variantes */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">Variantes del producto</h3>
            <p className="text-sm text-white/60">
              Agrega colores, capacidades de almacenamiento, etc.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (showVariantForm) {
                resetVariantForm();
              } else {
                setShowVariantForm(true);
              }
            }}
            className="btn bg-blue-600 text-white hover:bg-blue-700"
          >
            {showVariantForm ? "Cancelar" : "+ Agregar variante"}
          </button>
        </div>

        {/* Formulario para agregar variante */}
        {showVariantForm && (
          <div className="bg-white/5 rounded-xl p-4 mb-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="variantName" className="label">
                  Nombre de la variante
                </label>
                <input
                  id="variantName"
                  className="input"
                  value={variantName}
                  onChange={(e) => setVariantName(e.target.value)}
                  placeholder="Ej: Rojo, 128GB, etc."
                />
              </div>
              <div>
                <label htmlFor="variantType" className="label">
                  Tipo
                </label>
                <select
                  id="variantType"
                  className="input"
                  value={variantType}
                  onChange={(e) =>
                    setVariantType(e.target.value as "color" | "storage")
                  }
                >
                  <option value="color">Color</option>
                  <option value="storage">Almacenamiento</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="variantPrice" className="label">
                  Precio adicional ($)
                </label>
                <input
                  id="variantPrice"
                  className="input"
                  type="number"
                  step="0.01"
                  value={variantPrice}
                  onChange={(e) => setVariantPrice(Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label htmlFor="variantStock" className="label">
                  Stock
                </label>
                <input
                  id="variantStock"
                  className="input"
                  type="number"
                  value={variantStock}
                  onChange={(e) => setVariantStock(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Imagen de la variante */}
            <div>
              <ImageUploader
                onImageUploaded={handleVariantImageUploaded}
                currentImages={variantImage ? [variantImage] : []}
                maxImages={1}
                label="Imagen de la variante (opcional)"
              />
              {variantImage && (
                <div className="mt-3 relative inline-block">
                  <img
                    src={variantImage}
                    alt="Vista previa"
                    className="w-32 h-32 object-cover rounded-lg border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setVariantImage("")}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5"
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
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={addVariant}
              className="btn bg-green-600 text-white hover:bg-green-700"
            >
              {editingVariantId ? "Actualizar variante" : "Guardar variante"}
            </button>
          </div>
        )}

        {/* Lista de variantes agregadas */}
        {variants.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-white/70">
              Variantes agregadas ({variants.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {variants.map((variant) => (
                <div
                  key={variant.id}
                  className="border border-white/20 rounded-lg p-3 bg-white/5 flex items-start justify-between"
                >
                  <div className="flex gap-3">
                    {variant.image && (
                      <img
                        src={variant.image}
                        alt={variant.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div>
                      <div className="font-medium text-white">
                        {variant.name}
                      </div>
                      <div className="text-sm text-white/60">
                        {variant.type === "color"
                          ? "🎨 Color"
                          : "💾 Almacenamiento"}
                      </div>
                      <div className="text-sm">
                        <span className="text-green-400 font-medium">
                          +${formatPrice(variant.price)}
                        </span>{" "}
                        <span className="text-white/60">
                          · Stock: {variant.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editVariant(variant)}
                      className="text-blue-400 hover:text-blue-300"
                      title="Editar variante"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar variante"
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 pt-6">
        <button
          className="btn btn-primary w-full md:w-auto"
          type="submit"
          disabled={loading}
        >
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
        </button>
      </div>
    </form>
  );
}
