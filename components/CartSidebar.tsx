"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { formatPrice, proxyImage } from "@/lib/utils";

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
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    const loadWhatsApp = async () => {
      try {
        const response = await fetch("/api/social-links");
        if (response.ok) {
          const data = await response.json();
          if (data.whatsapp) setWhatsappNumber(data.whatsapp);
        }
      } catch (error) {
        console.error("Error loading WhatsApp:", error);
      }
    };
    loadWhatsApp();
  }, []);

  const handleCheckout = () => {
    if (!whatsappNumber) {
      alert("No se ha configurado un número de WhatsApp");
      return;
    }

    const lines = ["¡Hola! Me interesa comprar:\n"];
    items.forEach((item) => {
      lines.push(
        `- *${item.title}* x${item.quantity} — $${formatPrice(item.price * item.quantity)}`,
      );
    });
    lines.push(`\n*Total: $${formatPrice(totalPrice)}*`);

    const message = encodeURIComponent(lines.join("\n"));
    const cleanNumber = whatsappNumber.replaceAll(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
    clearCart();
    setIsOpen(false);
  };

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
            <svg
              className="w-5 h-5"
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
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center ${
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
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                      className={`w-7 h-7 rounded flex items-center justify-center text-sm font-bold transition-colors ${
                        theme === "light"
                          ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1)
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
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
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
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
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
            {(() => {
              const canjeItem = items.find((i) => i.planCanje);
              if (!canjeItem) return null;
              const href = `/cotiza-tu-telefono?productoId=${canjeItem._id}&producto=${encodeURIComponent(canjeItem.title)}&modelo=${encodeURIComponent(canjeItem.title)}`;
              return (
                <Link
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 bg-green-500/20 text-green-400 border border-green-400/30 hover:bg-green-500/30 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  Plan canje — {canjeItem.title}
                </Link>
              );
            })()}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={!whatsappNumber}
              className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Hacer pedido por WhatsApp
            </button>
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
