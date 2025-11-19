import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "NeoTech - Product Manager",
  description: "Next.js 16 + API Routes + Server Actions + MongoDB",
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
          <Navbar />
          <main className="pt-20">{children}</main>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
