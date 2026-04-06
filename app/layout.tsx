import "./globals.css";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { CartProvider } from "@/contexts/CartContext";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "NeoTech importados",
  description: "Productos importados originales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body suppressHydrationWarning className="bg-black transition-colors">
        <ThemeProvider>
          <ToastProvider>
            <CartProvider>
              <Navbar />
              <CartSidebar />
              <main className="pt-20">{children}</main>
            </CartProvider>
          </ToastProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
