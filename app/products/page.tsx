import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import ProductsClient from "./ProductsClient";
import { Suspense } from "react";

export const revalidate = 60;

export default async function ProductsPage() {
  try {
    await connectDB();

    const [categoryDocs, totalProducts] = await Promise.all([
      Category.find().sort({ name: 1 }).lean(),
      Product.countDocuments(),
    ]);
    const categories = categoryDocs.map((c: any) => c.name as string);

    return (
      <Suspense fallback={<div>Cargando...</div>}>
        <ProductsClient categories={categories} totalProducts={totalProducts} />
      </Suspense>
    );
  } catch (error) {
    console.error("Error loading products page:", error);

    return (
      <Suspense fallback={<div>Cargando...</div>}>
        <ProductsClient categories={[]} totalProducts={0} />
      </Suspense>
    );
  }
}
