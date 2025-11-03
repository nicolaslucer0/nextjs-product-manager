"use client";

import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import ImagePlaceholder from "./ImagePlaceholder";

type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
};

type FeaturedProductsProps = {
  products: Product[];
};

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const { theme } = useTheme();

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2
          className={`text-3xl font-bold mb-8 ${
            theme === "light" ? "text-gray-900" : "text-white"
          }`}
        >
          Productos Destacados
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <Link
              key={product._id}
              href={`/products/${product._id}`}
              className={`group rounded-xl p-4 transition-all ${
                theme === "light"
                  ? "bg-white border border-gray-200 hover:shadow-lg"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              <div
                className={`rounded-lg aspect-square mb-3 overflow-hidden ${
                  theme === "light" ? "bg-gray-100" : "bg-white/5"
                }`}
              >
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <ImagePlaceholder size="md" />
                )}
              </div>
              <h3
                className={`font-semibold mb-1 line-clamp-2 text-sm md:text-base ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                {product.title}
              </h3>
              <p
                className={`text-xs md:text-sm mb-2 line-clamp-1 ${
                  theme === "light" ? "text-gray-600" : "text-white/60"
                }`}
              >
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <p
                  className={`text-lg md:text-xl font-bold ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  ${formatPrice(product.price)}
                </p>
                <span
                  className={`text-xs ${
                    theme === "light" ? "text-gray-500" : "text-white/50"
                  }`}
                >
                  Stock: {product.stock}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
