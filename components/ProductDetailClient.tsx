"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { formatPrice, proxyImage } from "@/lib/utils";
import ImagePlaceholder from "./ImagePlaceholder";
import Button from "./Button";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { useSiteConfig } from "@/lib/useDollarRate";
import PaymentInfoBanner from "./PaymentInfoBanner";
import NumericInput from "./NumericInput";
import CanjeModal from "./CanjeModal";
import type { ProductType } from "@/lib/models/Product";

type Props = {
  readonly product: ProductType;
};

export default function ProductDetailClient({ product }: Props) {
  const { theme } = useTheme();
  const [selectedImage, setSelectedImage] = useState(product.images?.[0] || "");
  const [warrantyMessage, setWarrantyMessage] = useState("");
  const [cartQuantity, setCartQuantity] = useState(1);
  const { items, addItem, setIsOpen: openCart } = useCart();
  const { dollarRate, paymentMethods, shippingMethods } = useSiteConfig();
  const { showToast } = useToast();
  const [showCanjeModal, setShowCanjeModal] = useState(false);

  // Check if this product already has canje applied in cart
  const cartItem = items.find((i) => i._id === product._id);
  const hasCanjeApplied = Boolean(cartItem?.canje);

  useEffect(() => {
    const loadWarrantyMessage = async () => {
      if (!product.category) return;
      try {
        const response = await fetch("/api/category-config");
        if (response.ok) {
          const configs = await response.json();
          const config = configs.find(
            (c: { category: string }) => c.category === product.category,
          );
          if (config?.warrantyMessage) {
            setWarrantyMessage(config.warrantyMessage);
          }
        }
      } catch (error) {
        console.error("Error loading warranty message:", error);
      }
    };
    loadWarrantyMessage();
  }, [product.category]);

  const handleAddToCart = () => {
    addItem(product, cartQuantity);
    showToast(`${product.title} agregado al carrito`, "success");
    setCartQuantity(1);
  };

  const handleBuyNow = () => {
    addItem(product, cartQuantity);
    setCartQuantity(1);
    openCart(true);
  };

  const lightText = theme === "light";

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="container mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/products"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al catálogo
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="card rounded-2xl overflow-hidden aspect-square flex items-center justify-center bg-white/5">
              {selectedImage ? (
                <img
                  src={proxyImage(selectedImage)}
                  alt={product.title}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <ImagePlaceholder size="lg" className="bg-white/5" />
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center ${
                      selectedImage === img
                        ? "border-blue-400 shadow-lg shadow-blue-500/20 bg-blue-500/10"
                        : "border-white/10 hover:border-white/30 bg-white/5"
                    }`}
                  >
                    <img
                      src={proxyImage(img)}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Título y descripción */}
            <div>
              <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${lightText ? "text-gray-900" : "text-white"}`}>
                {product.title}
              </h1>
              <p className={`text-lg leading-relaxed ${lightText ? "text-gray-600" : "text-white/70"}`}>
                {product.description}
              </p>
            </div>

            {/* Bloque de precio */}
            <div className={`rounded-xl p-5 ${lightText ? "bg-gray-50 border border-gray-200" : "bg-white/5 border border-white/10"}`}>
              {hasCanjeApplied ? (
                <>
                  <div className="flex items-baseline gap-3">
                    <span className={`text-2xl line-through ${lightText ? "text-gray-400" : "text-white/40"}`}>
                      USD ${formatPrice(product.price)}
                    </span>
                    <span className="text-4xl font-bold text-green-400">
                      USD ${formatPrice(Math.max(0, product.price - cartItem!.canje!.discount))}
                    </span>
                  </div>
                  {dollarRate > 0 && (
                    <p className={`text-lg mt-1 ${lightText ? "text-gray-500" : "text-white/50"}`}>
                      ~${formatPrice(Math.round(Math.max(0, product.price - cartItem!.canje!.discount) * dollarRate))} ARS
                      <span className="text-xs ml-1">(precio estimado)</span>
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="text-4xl font-bold">
                    USD ${formatPrice(product.price)}
                  </div>
                  {dollarRate > 0 && (
                    <p className={`text-lg mt-1 ${lightText ? "text-gray-500" : "text-white/50"}`}>
                      ~${formatPrice(Math.round(product.price * dollarRate))} ARS
                      <span className="text-xs ml-1">(precio estimado)</span>
                    </p>
                  )}
                </>
              )}
              <div className="mt-3">
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-green-400 font-medium text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Disponible
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-red-400 font-medium text-sm">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    Sin stock
                  </span>
                )}
              </div>
            </div>

            {/* Acciones de compra */}
            {product.stock > 0 && (
              <div className="space-y-4">
                {/* Selector de cantidad */}
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${lightText ? "text-gray-600" : "text-white/60"}`}>
                    Cantidad:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCartQuantity(Math.max(1, cartQuantity - 1))}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold transition-colors ${
                        lightText
                          ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      -
                    </button>
                    <NumericInput
                      value={cartQuantity}
                      onChange={(e) => {
                        const val = Number.parseInt(e.target.value, 10);
                        if (!Number.isNaN(val) && val >= 1)
                          setCartQuantity(Math.min(val, product.stock));
                      }}
                      className={`w-14 h-9 text-center rounded-lg border ${
                        lightText
                          ? "bg-white border-gray-300 text-gray-900"
                          : "bg-white/5 border-white/20 text-white"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setCartQuantity(Math.min(product.stock, cartQuantity + 1))}
                      disabled={cartQuantity >= product.stock}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg font-bold transition-colors disabled:opacity-30 ${
                        lightText
                          ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Botones principales */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleBuyNow}
                    className="flex-1 inline-flex items-center justify-center gap-2 text-base"
                  >
                    Comprar ahora
                  </Button>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium inline-flex items-center justify-center gap-2 transition-colors border text-base ${
                      lightText
                        ? "border-gray-300 hover:bg-gray-100 text-gray-700"
                        : "border-white/20 hover:bg-white/10 text-white"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    Agregar al carrito
                  </button>
                </div>

                {/* Plan canje */}
                {product.planCanje && (
                  hasCanjeApplied ? (
                    <div className="w-full rounded-lg p-3 bg-green-500/10 border border-green-400/30 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Plan canje aplicado
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowCanjeModal(true)}
                        className="text-xs text-green-400/70 hover:text-green-400 underline"
                      >
                        Modificar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        // Ensure product is in cart first
                        if (!cartItem) addItem(product, cartQuantity);
                        setShowCanjeModal(true);
                      }}
                      className="w-full py-2.5 px-4 rounded-lg font-medium inline-flex items-center justify-center gap-2 transition-colors border bg-green-500/10 border-green-400/30 text-green-400 hover:bg-green-500/20"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Cotizá tu plan canje
                    </button>
                  )
                )}
              </div>
            )}

            {/* Información complementaria */}
            <div className="space-y-3">
              <PaymentInfoBanner items={paymentMethods} title="Métodos de pago" />
              <PaymentInfoBanner items={shippingMethods} title="Formas de envío" icon="🚚" />
              {warrantyMessage && (
                <div className={`rounded-lg border p-4 flex gap-3 items-start ${
                  lightText
                    ? "bg-blue-50 border-blue-200"
                    : "bg-blue-500/10 border-blue-400/30"
                }`}>
                  <span className="text-lg shrink-0">🛡️</span>
                  <p className={`text-sm leading-relaxed ${lightText ? "text-blue-800" : "text-blue-200"}`}>
                    {warrantyMessage}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Canje Modal */}
      {showCanjeModal && (
        <CanjeModal
          productId={product._id}
          productTitle={product.title}
          productPrice={product.price}
          onClose={() => setShowCanjeModal(false)}
        />
      )}
    </div>
  );
}
