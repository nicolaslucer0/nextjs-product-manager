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
