"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { formatPrice } from "@/lib/utils";
import ImagePlaceholder from "./ImagePlaceholder";
import Button, { ButtonLink } from "./Button";
import type { ProductType, Variant } from "@/lib/models/Product";

type Props = {
  readonly product: ProductType;
};

export default function ProductDetailClient({ product }: Props) {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const [selectedImage, setSelectedImage] = useState(product.images?.[0] || "");
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [warrantyMessage, setWarrantyMessage] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // Cargar mensaje de garantía según la categoría
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
          if (config && config.warrantyMessage) {
            setWarrantyMessage(config.warrantyMessage);
          }
        }
      } catch (error) {
        console.error("Error loading warranty message:", error);
      }
    };

    loadWarrantyMessage();
  }, [product.category]);

  // Cargar número de WhatsApp
  useEffect(() => {
    const loadWhatsApp = async () => {
      try {
        const response = await fetch("/api/social-links");
        if (response.ok) {
          const data = await response.json();
          if (data.whatsapp) {
            setWhatsappNumber(data.whatsapp);
          }
        }
      } catch (error) {
        console.error("Error loading WhatsApp:", error);
      }
    };

    loadWhatsApp();
  }, []);

  // Agrupar variantes por tipo
  const colorVariants =
    product.variants?.filter((v) => v.type === "color") || [];
  const storageVariants =
    product.variants?.filter((v) => v.type === "storage") || [];

  // Calcular precio final
  const finalPrice = product.price + (selectedVariant?.price || 0);

  // Calcular stock disponible
  const availableStock = selectedVariant
    ? selectedVariant.stock
    : product.stock;

  // Cambiar imagen cuando se selecciona una variante con imagen
  const handleVariantSelect = (variant: Variant) => {
    setSelectedVariant(variant);
    if (variant.image) {
      setSelectedImage(variant.image);
    }
  };

  // Construir URL para plan canje
  const canjeHref = `/cotiza-tu-telefono?productoId=${product._id}&producto=${encodeURIComponent(product.title)}&modelo=${encodeURIComponent(product.title)}`;

  // Obtener datos del plan canje desde URL
  const getCanjeData = () => {
    return {
      modelo: searchParams.get("canjeModelo"),
      almacenamiento: searchParams.get("canjeAlmacenamiento"),
      bateria: searchParams.get("canjeBateria"),
      estetica: searchParams.get("canjeEstetica"),
      piezas: searchParams.get("canjePiezas"),
      funciona: searchParams.get("canjeFunciona"),
      precio: searchParams.get("canjePrecio"),
    };
  };

  // Generar mensaje de WhatsApp
  const generateWhatsAppMessage = () => {
    const canjeData = getCanjeData();
    const messageParts = [
      "¡Hola! Me interesa comprar:\n",
      `*${product.title}*`,
      `Precio: $${formatPrice(finalPrice)}`,
    ];

    if (selectedVariant) {
      messageParts.push(`Variante: ${selectedVariant.name}`);
    }

    // Agregar datos del plan canje si existen
    if (canjeData.modelo) {
      const canjeParts = [
        "\n*Plan Canje:*",
        `- Modelo a canjear: ${canjeData.modelo}`,
      ];

      if (canjeData.almacenamiento)
        canjeParts.push(`- Almacenamiento: ${canjeData.almacenamiento}`);
      if (canjeData.bateria)
        canjeParts.push(`- Batería: ${canjeData.bateria}%`);
      if (canjeData.estetica)
        canjeParts.push(
          `- Detalle estético: ${canjeData.estetica === "true" ? "Sí" : "No"}`,
        );
      if (canjeData.piezas)
        canjeParts.push(
          `- Piezas cambiadas: ${canjeData.piezas === "true" ? "Sí" : "No"}`,
        );
      if (canjeData.funciona)
        canjeParts.push(
          `- Funciona perfectamente: ${canjeData.funciona === "true" ? "Sí" : "No"}`,
        );
      if (canjeData.precio)
        canjeParts.push(`- Precio estimado del canje: $${canjeData.precio}`);

      messageParts.push(...canjeParts);
    }

    return encodeURIComponent(messageParts.join("\n"));
  };

  const handleWhatsAppClick = () => {
    if (!whatsappNumber) {
      alert("No se ha configurado un número de WhatsApp");
      return;
    }
    const message = generateWhatsAppMessage();
    const cleanNumber = whatsappNumber.replaceAll(/\D/g, "");
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-transparent py-8">
      <div className="container mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/products"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Volver al catálogo
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="card rounded-2xl overflow-hidden aspect-square flex items-center justify-center bg-white/5">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <ImagePlaceholder size="lg" className="bg-white/5" />
              )}
            </div>

            {/* Miniaturas */}
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
                      src={img}
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
            <div>
              <h1
                className={`text-4xl font-bold mb-2 ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                {product.title}
              </h1>
              <p
                className={`text-lg leading-relaxed ${
                  theme === "light" ? "text-gray-600" : "text-white/70"
                }`}
              >
                {product.description}
              </p>
            </div>

            {/* Precio */}
            <div
              className={`border-y py-6 ${
                theme === "light" ? "border-gray-200" : "border-white/10"
              }`}
            >
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold">
                  ${formatPrice(finalPrice)}
                </span>
                {selectedVariant && selectedVariant.price > 0 && (
                  <span className="text-lg text-white/40 line-through">
                    ${formatPrice(product.price)}
                  </span>
                )}
              </div>
              <div className="mt-2">
                {availableStock > 0 ? (
                  <span className="inline-flex items-center gap-2 text-green-400 font-medium">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    En stock ({availableStock} disponibles)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-red-400 font-medium">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Sin stock
                  </span>
                )}
              </div>

              {product.planCanje && (
                <div className="mt-4">
                  <ButtonLink href={canjeHref} className="w-full sm:w-auto">
                    Plan canje
                  </ButtonLink>
                </div>
              )}

              {/* Botón Lo quiero! */}
              <div className="mt-4">
                <Button
                  onClick={handleWhatsAppClick}
                  disabled={!whatsappNumber}
                  className="w-full sm:w-auto inline-flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Lo quiero!
                </Button>
              </div>
            </div>

            {/* Selector de variantes de color */}
            {colorVariants.length > 0 && (
              <div>
                <h3
                  className={`font-semibold mb-3 ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  Color disponible ({colorVariants.length}{" "}
                  {colorVariants.length === 1 ? "opción" : "opciones"})
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {colorVariants.map((variant) => (
                    <button
                      key={variant._id}
                      onClick={() => handleVariantSelect(variant)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all font-medium flex flex-col items-center gap-1 ${
                        selectedVariant?._id === variant._id
                          ? "border-blue-400 bg-blue-500/20 text-blue-400 scale-105"
                          : theme === "light"
                            ? "border-gray-300 hover:border-gray-400 bg-white text-gray-700"
                            : "border-white/20 hover:border-white/40 bg-white/5 text-white"
                      }`}
                    >
                      <span>🎨 {variant.name}</span>
                      {variant.price > 0 && (
                        <span className="text-xs opacity-70">
                          +${formatPrice(variant.price)}
                        </span>
                      )}
                      {variant.stock > 0 ? (
                        <span className="text-xs text-green-400">
                          {variant.stock} disponibles
                        </span>
                      ) : (
                        <span className="text-xs text-red-400">Sin stock</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de variantes de almacenamiento */}
            {storageVariants.length > 0 && (
              <div>
                <h3
                  className={`font-semibold mb-3 ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  Capacidad de almacenamiento ({storageVariants.length}{" "}
                  {storageVariants.length === 1 ? "opción" : "opciones"})
                </h3>
                <div className="flex gap-3 flex-wrap">
                  {storageVariants.map((variant) => (
                    <button
                      key={variant._id}
                      onClick={() => handleVariantSelect(variant)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all font-medium flex flex-col items-center gap-1 ${
                        selectedVariant?._id === variant._id
                          ? "border-blue-400 bg-blue-500/20 text-blue-400 scale-105"
                          : theme === "light"
                            ? "border-gray-300 hover:border-gray-400 bg-white text-gray-700"
                            : "border-white/20 hover:border-white/40 bg-white/5 text-white"
                      }`}
                    >
                      <span>💾 {variant.name}</span>
                      {variant.price > 0 && (
                        <span className="text-xs opacity-70">
                          +${formatPrice(variant.price)}
                        </span>
                      )}
                      {variant.stock > 0 ? (
                        <span className="text-xs text-green-400">
                          {variant.stock} disponibles
                        </span>
                      ) : (
                        <span className="text-xs text-red-400">Sin stock</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Información adicional */}
            {warrantyMessage && (
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                <h4 className="font-semibold text-blue-400 mb-2">
                  Información del producto
                </h4>
                <ul className="space-y-1 text-sm text-blue-300">
                  <li>{warrantyMessage}</li>
                </ul>
              </div>
            )}

            {/* Detalles técnicos */}
            {product.variants && product.variants.length > 0 && (
              <div
                className={`border-t pt-6 ${
                  theme === "light" ? "border-gray-200" : "border-white/10"
                }`}
              >
                <h4
                  className={`font-semibold mb-3 ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  Todas las opciones disponibles
                </h4>
                <div className="space-y-2">
                  {product.variants.map((variant) => (
                    <div
                      key={variant._id}
                      className={`flex justify-between items-center text-sm py-2 border-b last:border-0 ${
                        theme === "light"
                          ? "border-gray-100"
                          : "border-white/10"
                      }`}
                    >
                      <span
                        className={
                          theme === "light" ? "text-gray-700" : "text-white/70"
                        }
                      >
                        {variant.type === "color" ? "🎨" : "💾"} {variant.name}
                      </span>
                      <span
                        className={
                          theme === "light" ? "text-gray-500" : "text-white/50"
                        }
                      >
                        Stock: {variant.stock} · +${formatPrice(variant.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
