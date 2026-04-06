import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema({
  externalId: { type: String, unique: true, sparse: true }, // ID del Excel
  title: { type: String, required: true },
  description: { type: String, default: "" },
  category: { type: String, default: "" }, // Categoría del producto
  price: { type: Number, default: 0 }, // Precio base
  stock: { type: Number, default: 0 },
  images: { type: [String], default: [] }, // Imágenes generales
  featured: { type: Boolean, default: false }, // Producto destacado
  planCanje: { type: Boolean, default: false }, // Habilita botón de plan canje
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ category: 1, createdAt: -1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ featured: 1, updatedAt: -1 });
ProductSchema.index({ title: "text", description: "text" });

ProductSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export type ProductType = {
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
  createdAt: string;
  updatedAt: string;
};

export default models.Product || model("Product", ProductSchema);
