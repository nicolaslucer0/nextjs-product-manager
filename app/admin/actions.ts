"use server";

import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";

export async function createProduct(formData: FormData) {
  await connectDB();
  const doc = await Product.create({
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    price: Number(formData.get("price") || 0),
    stock: Number(formData.get("stock") || 0),
    images: (String(formData.get("images") || "")).split(",").map(s => s.trim()).filter(Boolean)
  });
  return JSON.parse(JSON.stringify(doc));
}

export async function updateProduct(id: string, formData: FormData) {
  await connectDB();
  const updated = await Product.findByIdAndUpdate(id, {
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    price: Number(formData.get("price") || 0),
    stock: Number(formData.get("stock") || 0),
    images: (String(formData.get("images") || "")).split(",").map(s => s.trim()).filter(Boolean)
  }, { new: true });
  return JSON.parse(JSON.stringify(updated));
}

export async function deleteProduct(id: string) {
  await connectDB();
  await Product.findByIdAndDelete(id);
  return { ok: true };
}
