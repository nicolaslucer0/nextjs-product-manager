import Link from "next/link";

export default function ProductCard({ product }: { product: any }) {
  return (
    <div className="card">
      <div className="aspect-video w-full overflow-hidden rounded-xl border bg-gray-100 mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {product.images?.[0] ? <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" /> : null}
      </div>
      <div className="font-semibold">{product.title}</div>
      <div className="text-sm text-gray-600 line-clamp-2">{product.description}</div>
      <div className="mt-2 text-lg font-medium">${"{product.price}"}</div>
      <div className="text-xs text-gray-500">Stock: {product.stock}</div>
      <Link href={`/products/${product._id}`} className="btn mt-3">View</Link>
    </div>
  );
}
