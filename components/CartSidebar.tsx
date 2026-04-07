"use client";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { formatPrice, proxyImage } from "@/lib/utils";
import NumericInput from "./NumericInput";

export default function CartSidebar() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isOpen,
    setIsOpen,
  } = useCart();
  const { theme } = useTheme();

  if (!isOpen) return null;

  const bgClass =
    theme === "light" ? "bg-white border-gray-200" : "bg-black border-white/20";
  const textClass = theme === "light" ? "text-gray-900" : "text-white";
  const mutedClass = theme === "light" ? "text-gray-500" : "text-white/50";
  const borderClass = theme === "light" ? "border-gray-200" : "border-white/10";
  const hoverBgClass =
    theme === "light" ? "hover:bg-gray-100" : "hover:bg-white/10";

  return (
    <>
      {/* Overlay */}
      <button
        type="button"
        aria-label="Cerrar carrito"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 top-20"
        onClick={() => setIsOpen(false)}
        style={{ border: "none", padding: 0, margin: 0, background: "none" }}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-20 right-0 bottom-0 w-80 max-w-[90vw] backdrop-blur-xl border-l z-40 shadow-2xl flex flex-col ${bgClass}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b ${borderClass}`}
        >
          <h2 className={`font-semibold text-lg ${textClass}`}>
            Carrito ({totalItems})
          </h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className={`p-1 rounded-lg transition-colors ${mutedClass} ${hoverBgClass}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🛒</div>
              <p className={mutedClass}>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item._id}
                className={`flex gap-3 pb-4 border-b ${borderClass}`}
              >
                {/* Thumbnail */}
                <div
                  className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 flex items-center justify-center ${
                    theme === "light" ? "bg-gray-100" : "bg-white/5"
                  }`}
                >
                  {item.image ? (
                    <img
                      src={proxyImage(item.image)}
                      alt={item.title}
                      className="w-full h-full object-contain p-1"
                    />
                  ) : (
                    <div
                      className={`w-full h-full ${theme === "light" ? "bg-gray-100" : "bg-white/5"}`}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${textClass}`}>
                    {item.title}
                  </p>
                  <p className={`text-sm ${mutedClass}`}>
                    ${formatPrice(item.price)}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className={`w-7 h-7 rounded flex items-center justify-center text-sm font-bold transition-colors ${
                        theme === "light"
                          ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      -
                    </button>
                    <NumericInput
                      value={item.quantity}
                      onChange={(e) => {
                        const val = Number.parseInt(e.target.value, 10);
                        if (!Number.isNaN(val) && val >= 1)
                          updateQuantity(item._id, val);
                      }}
                      className={`w-12 h-7 text-center text-sm rounded border ${
                        theme === "light"
                          ? "bg-white border-gray-300 text-gray-900"
                          : "bg-white/5 border-white/20 text-white"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className={`w-7 h-7 rounded flex items-center justify-center text-sm font-bold transition-colors disabled:opacity-30 ${
                        theme === "light"
                          ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item._id)}
                      className="ml-auto text-red-400 hover:text-red-300 transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={`p-4 border-t ${borderClass} space-y-3`}>
            <div className="flex justify-between items-center">
              <span className={`font-semibold ${textClass}`}>Total</span>
              <span className={`text-xl font-bold ${textClass}`}>
                ${formatPrice(totalPrice)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setIsOpen(false)}
              className="w-full btn btn-primary flex items-center justify-center gap-2"
            >
              Finalizar compra
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className={`w-full py-2 text-sm rounded-lg transition-colors ${
                theme === "light"
                  ? "text-red-600 hover:bg-red-50"
                  : "text-red-400 hover:bg-red-500/10"
              }`}
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  );
}
