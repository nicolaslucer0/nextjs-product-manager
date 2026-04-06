/**
 * Inyecta f_auto,q_auto en URLs de Cloudinary para servir el formato
 * más eficiente (AVIF/WebP) y calidad óptima según el cliente.
 */
function optimizeCloudinaryUrl(url: string): string {
  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  const after = url.slice(idx + marker.length);
  if (after.startsWith("f_auto") || after.startsWith("q_auto")) return url;
  return url.slice(0, idx + marker.length) + "f_auto,q_auto/" + after;
}

/**
 * Devuelve la URL proxied de una imagen externa para evitar bloqueos de extensiones.
 * Imágenes relativas o data-URIs se devuelven tal cual.
 */
export function proxyImage(url: string): string {
  if (!url?.startsWith("http")) return url;
  const optimized = url.includes("res.cloudinary.com") ? optimizeCloudinaryUrl(url) : url;
  return `/api/image-proxy?url=${encodeURIComponent(optimized)}`;
}

/**
 * Formatea un precio sin mostrar decimales si no los tiene
 * @param price - El precio a formatear
 * @returns El precio formateado como string
 */
export function formatPrice(price: number): string {
  // Si el precio es un número entero, no mostrar decimales
  if (Number.isInteger(price)) {
    return price.toString();
  }
  // Si tiene decimales, mostrar hasta 2 decimales sin ceros innecesarios
  return price.toFixed(2).replace(/\.?0+$/, "");
}
