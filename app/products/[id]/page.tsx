import { connectDB } from "@/lib/db";
import Product, { ProductType } from "@/lib/models/Product";
import ProductDetailClient from "@/components/ProductDetailClient";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();
  const productRaw = await Product.findById(id).lean();

  if (!productRaw) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="bg-gray-200 w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Producto no encontrado
          </h2>
          <p className="text-gray-600">
            El producto que buscas no existe o fue eliminado.
          </p>
        </div>
      </div>
    );
  }

  // Convertir ObjectId a string
  const product = JSON.parse(JSON.stringify(productRaw)) as ProductType;

  return <ProductDetailClient product={product} />;
}
