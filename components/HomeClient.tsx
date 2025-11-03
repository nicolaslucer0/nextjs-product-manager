"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import type { SocialLinksType } from "@/lib/models/SocialLinks";
import FeaturedProducts from "./FeaturedProducts";

type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
};

type HomeClientProps = {
  featuredProducts: Product[];
};

export default function HomeClient({ featuredProducts }: HomeClientProps) {
  const { theme } = useTheme();
  const [socialLinks, setSocialLinks] = useState<SocialLinksType | null>(null);

  useEffect(() => {
    fetch("/api/social-links")
      .then((res) => res.json())
      .then((data) => setSocialLinks(data))
      .catch((err) => console.error("Error loading social links:", err));
  }, []);

  return (
    <div
      className={`min-h-screen ${
        theme === "light" ? "bg-gray-50" : "bg-black"
      }`}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden py-32 px-4">
        {/* Gradient background estilo Apple */}
        {theme === "light" ? (
          <>
            <div className="absolute inset-0 bg-linear-to-br from-blue-100 via-white to-purple-100"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),rgba(0,0,0,0))]"></div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-linear-to-br from-purple-900/20 via-black to-blue-900/20"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(0,0,0,0))]"></div>
          </>
        )}

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight tracking-tight">
              <span
                className={
                  theme === "light"
                    ? "text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-purple-600 to-blue-600"
                    : "text-white"
                }
              >
                Vendemos{" "}
              </span>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-pink-400">
                tecnología
              </span>
            </h1>
            <p
              className={`text-2xl md:text-3xl mb-12 font-light ${
                theme === "light" ? "text-gray-600" : "text-white/60"
              }`}
            >
              Vendemos todo tipo de productos electrónicos
              <br />
              iPhones nuevos y seminuevos, Playstations, accesorios y mucho más.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className={`px-8 py-4 rounded-full font-semibold transition-all duration-300 text-lg shadow-2xl ${
                  theme === "light"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white text-black hover:bg-white/90"
                }`}
              >
                Explorar Productos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProducts products={featuredProducts} />

      {/* Social Media & Contact Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-linear-to-b from-transparent to-transparent ${
            theme === "light" ? "via-blue-50" : "via-blue-900/10"
          }`}
        ></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2
              className={`text-5xl md:text-6xl font-bold mb-6 ${
                theme === "light" ? "text-gray-900" : "text-white"
              }`}
            >
              Conecta con{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">
                nosotros
              </span>
            </h2>
            <p
              className={`text-xl max-w-2xl mx-auto ${
                theme === "light" ? "text-gray-600" : "text-white/60"
              }`}
            >
              Síguenos en nuestras redes sociales y visítanos en nuestra tienda
              física
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Instagram */}
            <a
              href={socialLinks?.instagram || "https://instagram.com"}
              target="_blank"
              rel="noopener noreferrer"
              className={`card group transition-all duration-300 hover:scale-105 cursor-pointer ${
                theme === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                Instagram
              </h3>
              <p
                className={`text-sm mb-3 ${
                  theme === "light" ? "text-gray-500" : "text-white/60"
                }`}
              >
                {socialLinks?.instagram
                  ? `@${
                      socialLinks.instagram.split("/").pop() || "neotech_store"
                    }`
                  : "@neotech_store"}
              </p>
              <p className="text-blue-400 text-sm font-medium group-hover:text-blue-300">
                Síguenos →
              </p>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${
                socialLinks?.whatsapp?.replace(/[^0-9]/g, "") || "1234567890"
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className={`card group transition-all duration-300 hover:scale-105 cursor-pointer ${
                theme === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-green-500 to-emerald-500 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                WhatsApp
              </h3>
              <p
                className={`text-sm mb-3 ${
                  theme === "light" ? "text-gray-500" : "text-white/60"
                }`}
              >
                {socialLinks?.whatsapp || "+1 234 567 890"}
              </p>
              <p className="text-green-400 text-sm font-medium group-hover:text-green-300">
                Chatea con nosotros →
              </p>
            </a>

            {/* TikTok */}
            <a
              href={socialLinks?.tiktok || "https://tiktok.com"}
              target="_blank"
              rel="noopener noreferrer"
              className={`card group transition-all duration-300 hover:scale-105 cursor-pointer ${
                theme === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-black to-gray-800 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform border border-white/20">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                TikTok
              </h3>
              <p
                className={`text-sm mb-3 ${
                  theme === "light" ? "text-gray-500" : "text-white/60"
                }`}
              >
                {socialLinks?.tiktok
                  ? `@${
                      socialLinks.tiktok.split("/").pop()?.replace("@", "") ||
                      "neotech_oficial"
                    }`
                  : "@neotech_oficial"}
              </p>
              <p
                className={`text-sm font-medium ${
                  theme === "light"
                    ? "text-gray-800 group-hover:text-gray-600"
                    : "text-white group-hover:text-white/80"
                }`}
              >
                Ver videos →
              </p>
            </a>

            {/* Ubicación */}
            {socialLinks?.locationMap ? (
              <a
                href={socialLinks.locationMap}
                target="_blank"
                rel="noopener noreferrer"
                className={`card transition-all duration-300 hover:scale-105 cursor-pointer ${
                  theme === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-red-500 to-orange-500 mb-4 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  Visítanos
                </h3>
                <p
                  className={`text-sm mb-1 ${
                    theme === "light" ? "text-gray-500" : "text-white/60"
                  }`}
                >
                  {socialLinks.locationAddress || "Av. Principal 123"}
                </p>
                <p
                  className={`text-sm mb-3 ${
                    theme === "light" ? "text-gray-500" : "text-white/60"
                  }`}
                >
                  {socialLinks.locationCity || "Ciudad, País"}
                </p>
                <p className="text-orange-400 text-sm font-medium">
                  {socialLinks.locationSchedule || "Lun - Sáb: 9AM - 8PM"}
                </p>
              </a>
            ) : (
              <div
                className={`card transition-all duration-300 hover:scale-105 ${
                  theme === "light" ? "hover:bg-gray-100" : "hover:bg-white/10"
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-red-500 to-orange-500 mb-4 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    theme === "light" ? "text-gray-900" : "text-white"
                  }`}
                >
                  Visítanos
                </h3>
                <p
                  className={`text-sm mb-1 ${
                    theme === "light" ? "text-gray-500" : "text-white/60"
                  }`}
                >
                  {socialLinks?.locationAddress || "Av. Principal 123"}
                </p>
                <p
                  className={`text-sm mb-3 ${
                    theme === "light" ? "text-gray-500" : "text-white/60"
                  }`}
                >
                  {socialLinks?.locationCity || "Ciudad, País"}
                </p>
                <p className="text-orange-400 text-sm font-medium">
                  {socialLinks?.locationSchedule || "Lun - Sáb: 9AM - 8PM"}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-20 relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-linear-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-linear-to-br from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`border-t py-12 px-4 ${
          theme === "light"
            ? "border-gray-200 bg-white"
            : "border-white/10 bg-black"
        }`}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3
                className={`font-bold text-xl mb-4 ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                NeoTech
              </h3>
              <p
                className={`text-sm ${
                  theme === "light" ? "text-gray-600" : "text-white/60"
                }`}
              >
                La solución completa para gestionar tu inventario de manera
                profesional.
              </p>
            </div>
            <div>
              <h4
                className={`font-semibold mb-4 ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                Producto
              </h4>
              <ul
                className={`space-y-2 text-sm ${
                  theme === "light" ? "text-gray-600" : "text-white/60"
                }`}
              >
                <li>
                  <Link
                    href="/products"
                    className={
                      theme === "light"
                        ? "hover:text-gray-900"
                        : "hover:text-white"
                    }
                  >
                    Productos
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className={
                      theme === "light"
                        ? "hover:text-gray-900"
                        : "hover:text-white"
                    }
                  >
                    Características
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className={
                      theme === "light"
                        ? "hover:text-gray-900"
                        : "hover:text-white"
                    }
                  >
                    Precios
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4
                className={`font-semibold mb-4 ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                Empresa
              </h4>
              <ul
                className={`space-y-2 text-sm ${
                  theme === "light" ? "text-gray-600" : "text-white/60"
                }`}
              >
                <li>
                  <Link
                    href="#"
                    className={
                      theme === "light"
                        ? "hover:text-gray-900"
                        : "hover:text-white"
                    }
                  >
                    Acerca de
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className={
                      theme === "light"
                        ? "hover:text-gray-900"
                        : "hover:text-white"
                    }
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className={
                      theme === "light"
                        ? "hover:text-gray-900"
                        : "hover:text-white"
                    }
                  >
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4
                className={`font-semibold mb-4 ${
                  theme === "light" ? "text-gray-900" : "text-white"
                }`}
              >
                Legal
              </h4>
              <ul
                className={`space-y-2 text-sm ${
                  theme === "light" ? "text-gray-600" : "text-white/60"
                }`}
              >
                <li>
                  <Link
                    href="#"
                    className={
                      theme === "light"
                        ? "hover:text-gray-900"
                        : "hover:text-white"
                    }
                  >
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className={
                      theme === "light"
                        ? "hover:text-gray-900"
                        : "hover:text-white"
                    }
                  >
                    Términos
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className={
                      theme === "light"
                        ? "hover:text-gray-900"
                        : "hover:text-white"
                    }
                  >
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div
            className={`border-t mt-8 pt-8 text-center text-sm ${
              theme === "light"
                ? "border-gray-200 text-gray-600"
                : "border-gray-800 text-white/60"
            }`}
          >
            © {new Date().getFullYear()} Product Manager. Todos los derechos
            reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
