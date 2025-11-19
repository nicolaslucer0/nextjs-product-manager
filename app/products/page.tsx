import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  await connectDB();

  // Obtener solo las categorías únicas para los filtros
  const categories = await Product.distinct("category");
  const totalProducts = await Product.countDocuments();

  return (
    <ProductsClient categories={categories} totalProducts={totalProducts} />
  );
}
