import { Schema, model, models } from "mongoose";

const VariantSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g., "Rojo", "64GB"
    type: { type: String, required: true }, // "color" o "storage"
    price: { type: Number, default: 0 }, // Precio adicional de la variante
    stock: { type: Number, default: 0 },
    image: { type: String, default: "" }, // Imagen específica de la variante
  },
  { _id: true }
);

const ProductSchema = new Schema({
  externalId: { type: String, unique: true, sparse: true }, // ID del Excel
  title: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, default: "" }, // Categoría del producto
  price: { type: Number, default: 0 }, // Precio base
  stock: { type: Number, default: 0 }, // Stock base (si no hay variantes)
  images: { type: [String], default: [] }, // Imágenes generales
  variants: { type: [VariantSchema], default: [] }, // Variantes del producto
  featured: { type: Boolean, default: false }, // Producto destacado
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ProductSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export type Variant = {
  _id: string;
  name: string;
  type: "color" | "storage";
  price: number;
  stock: number;
  image: string;
};

export type ProductType = {
  _id: string;
  externalId?: string;
  title: string;
  description: string;
  category?: string;
  price: number;
  stock: number;
  images: string[];
  variants: Variant[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
};

// Eliminar el modelo cacheado si existe para asegurar que use el schema actualizado
if (models.Product) {
  delete models.Product;
}

export default model("Product", ProductSchema);
