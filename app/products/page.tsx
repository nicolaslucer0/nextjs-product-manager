import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import ProductsClient from "./ProductsClient";
import { Suspense } from "react";

export default async function ProductsPage() {
  await connectDB();

  // Obtener solo las categorías únicas para los filtros
  const categories = await Product.distinct("category");
  const totalProducts = await Product.countDocuments();

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ProductsClient categories={categories} totalProducts={totalProducts} />
    </Suspense>
  );
}
