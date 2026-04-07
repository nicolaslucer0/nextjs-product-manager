"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useTheme } from "@/contexts/ThemeContext";
import { formatPrice, proxyImage } from "@/lib/utils";
import Button from "@/components/Button";
import NumericInput from "@/components/NumericInput";
import { useSiteConfig } from "@/lib/useDollarRate";
import PaymentInfoBanner from "@/components/PaymentInfoBanner";
import CanjeModal from "@/components/CanjeModal";

export default function CheckoutPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    removeCanje,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();
  const { theme } = useTheme();
  const router = useRouter();
  const { dollarRate, paymentMessage, shippingMessage } = useSiteConfig();
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [canjeModalFor, setCanjeModalFor] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/social-links")
      .then((r) => r.json())
      .then((data) => {
        if (data?.whatsapp) setWhatsappNumber(data.whatsapp);
      })
      .catch(() => {});
  }, []);

  const textClass = theme === "light" ? "text-gray-900" : "text-white";
  const mutedClass = theme === "light" ? "text-gray-500" : "text-white/50";
  const borderClass = theme === "light" ? "border-gray-200" : "border-white/10";
  const cardBg = theme === "light" ? "bg-white" : "bg-white/5";

  const getItemFinalPrice = (item: typeof items[0]) => {
    return item.canje ? Math.max(0, item.price - item.canje.discount) : item.price;
  };

  const handleWhatsAppCheckout = () => {
    if (!whatsappNumber) {
      alert("No se ha configurado un número de WhatsApp");
      return;
    }

    const lines = ["¡Hola! Quiero hacer el siguiente pedido:\n"];
    items.forEach((item) => {
      const unitPrice = getItemFinalPrice(item);
      lines.push(`- *${item.title}* x${item.quantity} — $${formatPrice(unitPrice * item.quantity)}`);
      if (item.canje) {
        lines.push(`  📱 Plan canje: ${item.canje.model} ${item.canje.storage}`);
        lines.push(`  • Batería: ${item.canje.battery}% | Estética: ${item.canje.aestheticDetail ? "Con detalle" : "Sin detalle"} | Piezas: ${item.canje.changedParts ? "Cambiadas" : "Originales"}`);
      }
    });
    lines.push(`\n*Total: $${formatPrice(totalPrice)}*`);

    const message = encodeURIComponent(lines.join("\n"));
    const cleanNumber = whatsappNumber.replaceAll(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
    clearCart();
    router.push("/products");
  };

  const canjeModalItem = canjeModalFor ? items.find((i) => i._id === canjeModalFor) : null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto max-w-2xl text-center py-20">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className={`text-3xl font-bold mb-3 ${textClass}`}>Tu carrito está vacío</h1>
          <p className={`mb-6 ${mutedClass}`}>Agregá productos desde el catálogo para continuar.</p>
          <Link href="/products" className="btn btn-primary inline-flex items-center gap-2">Ver catálogo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/products" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Seguir comprando
          </Link>
          <h1 className={`text-3xl font-bold ${textClass}`}>Resumen de tu pedido</h1>
          <p className={mutedClass}>
            {totalItems} {totalItems === 1 ? "producto" : "productos"} en tu carrito
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const finalUnitPrice = getItemFinalPrice(item);
              return (
                <div key={item._id} className={`rounded-xl border p-4 ${borderClass} ${cardBg}`}>
                  <div className="flex gap-4">
                    {/* Imagen */}
                    <div className={`w-24 h-24 rounded-lg overflow-hidden shrink-0 flex items-center justify-center ${
                      theme === "light" ? "bg-gray-100" : "bg-white/5"
                    }`}>
                      {item.image ? (
                        <img src={proxyImage(item.image)} alt={item.title} className="w-full h-full object-contain p-2" />
                      ) : (
                        <div className={`w-full h-full ${theme === "light" ? "bg-gray-100" : "bg-white/5"}`} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <Link href={`/products/${item._id}`} className={`font-semibold hover:text-blue-400 transition-colors ${textClass}`}>
                          {item.title}
                        </Link>
                        <button type="button" onClick={() => removeItem(item._id)} className="text-red-400 hover:text-red-300 transition-colors shrink-0" title="Eliminar">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className={`text-sm ${mutedClass}`}>
                        {item.canje ? (
                          <span>
                            <span className="line-through">${formatPrice(item.price)}</span>
                            {" "}
                            <span className="text-green-400 font-medium">${formatPrice(finalUnitPrice)}</span>
                            {" c/u"}
                          </span>
                        ) : (
                          <span>${formatPrice(item.price)} c/u</span>
                        )}
                      </div>

                      {/* Canje badge */}
                      {item.canje && (
                        <div className="mt-2 rounded-lg bg-green-500/10 border border-green-400/30 px-3 py-2 flex items-center justify-between">
                          <div className="text-xs text-green-400">
                            <span className="font-medium">Plan canje aplicado</span>
                            <span className="text-green-400/60 ml-1">
                              — {item.canje.model} {item.canje.storage}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCanje(item._id)}
                            className="text-xs text-red-400/60 hover:text-red-400 ml-2"
                            title="Quitar canje"
                          >
                            Quitar
                          </button>
                        </div>
                      )}

                      {/* Plan canje available but not applied */}
                      {item.planCanje && !item.canje && (
                        <button
                          type="button"
                          onClick={() => setCanjeModalFor(item._id)}
                          className="mt-2 text-xs text-green-400 hover:text-green-300 underline"
                        >
                          Aplicar plan canje
                        </button>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${
                              theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-700" : "bg-white/10 hover:bg-white/20 text-white"
                            }`}>-</button>
                          <NumericInput
                            value={item.quantity}
                            onChange={(e) => {
                              const val = Number.parseInt(e.target.value, 10);
                              if (!Number.isNaN(val) && val >= 1) updateQuantity(item._id, val);
                            }}
                            className={`w-14 h-8 text-center text-sm rounded-lg border ${
                              theme === "light" ? "bg-white border-gray-300 text-gray-900" : "bg-white/5 border-white/20 text-white"
                            }`}
                          />
                          <button type="button" onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors disabled:opacity-30 ${
                              theme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-700" : "bg-white/10 hover:bg-white/20 text-white"
                            }`}>+</button>
                        </div>
                        <span className={`font-semibold ${textClass}`}>
                          ${formatPrice(finalUnitPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen lateral */}
          <div className="lg:col-span-1">
            <div className={`rounded-xl border p-6 sticky top-24 space-y-4 ${borderClass} ${cardBg}`}>
              <h2 className={`text-lg font-semibold ${textClass}`}>Resumen</h2>

              <div className={`space-y-2 text-sm border-b pb-4 ${borderClass}`}>
                {items.map((item) => {
                  const unitPrice = getItemFinalPrice(item);
                  return (
                    <div key={item._id}>
                      <div className="flex justify-between gap-2">
                        <span className={`truncate ${mutedClass}`}>
                          {item.title} x{item.quantity}
                        </span>
                        <span className={`shrink-0 ${textClass}`}>
                          ${formatPrice(unitPrice * item.quantity)}
                        </span>
                      </div>
                      {item.canje && (
                        <p className="text-xs text-green-400/70 ml-1">
                          Precio con plan canje
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-lg font-semibold ${textClass}`}>Total</span>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${textClass}`}>${formatPrice(totalPrice)}</span>
                  {dollarRate > 0 && (
                    <p className={`text-sm ${mutedClass}`}>~${formatPrice(totalPrice * dollarRate)} ARS</p>
                  )}
                </div>
              </div>

              <PaymentInfoBanner message={paymentMessage} />
              <PaymentInfoBanner message={shippingMessage} icon="🚚" />

              <Button
                onClick={handleWhatsAppCheckout}
                disabled={!whatsappNumber}
                fullWidth
                className="inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Hacer pedido por WhatsApp
              </Button>

              <button
                type="button"
                onClick={() => { if (confirm("¿Vaciar el carrito?")) clearCart(); }}
                className={`w-full py-2 text-sm rounded-lg transition-colors ${
                  theme === "light" ? "text-red-600 hover:bg-red-50" : "text-red-400 hover:bg-red-500/10"
                }`}
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Canje Modal */}
      {canjeModalItem && (
        <CanjeModal
          productId={canjeModalItem._id}
          productTitle={canjeModalItem.title}
          productPrice={canjeModalItem.price}
          onClose={() => setCanjeModalFor(null)}
        />
      )}
    </div>
  );
}
