import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 }).lean();

  return <ProductsClient products={JSON.parse(JSON.stringify(products))} />;
}
