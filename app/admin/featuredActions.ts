"use server";

import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";

export async function toggleFeatured(productId: string) {
  try {
    await connectDB();

    const product = await Product.findById(productId);
    if (!product) {
      return { success: false, error: "Producto no encontrado" };
    }

    console.log("Before toggle:", {
      id: product._id,
      title: product.title,
      currentFeatured: product.featured,
      willBe: !product.featured,
    });

    product.featured = !product.featured;
    await product.save();

    console.log("After save:", {
      id: product._id,
      title: product.title,
      featured: product.featured,
    });

    // Verificar que se guardó correctamente
    const verified = await Product.findById(productId);
    console.log("Verification from DB:", {
      id: verified?._id,
      title: verified?.title,
      featured: verified?.featured,
    });

    return { success: true, featured: product.featured };
  } catch (error) {
    console.error("Error toggling featured:", error);
    return { success: false, error: "Error al actualizar producto" };
  }
}

export async function getFeaturedProducts() {
  try {
    await connectDB();

    const products = await Product.find({ featured: true })
      .sort({ updatedAt: -1 })
      .limit(16)
      .lean();

    console.log("Featured products found:", products.length);
    console.log(
      "Products:",
      products.map((p) => ({ id: p._id, title: p.title, featured: p.featured }))
    );

    return JSON.parse(JSON.stringify(products));
  } catch (error) {
    console.error("Error getting featured products:", error);
    return [];
  }
}
