"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Navbar() {
  const [logged, setLogged] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setLogged(Boolean(localStorage.getItem("token")));

    // Detectar scroll para cambiar opacidad del navbar
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("token");
    setMenuOpen(false);
    location.href = "/";
  };

  const navBgClass =
    theme === "light"
      ? scrolled
        ? "bg-white/90 backdrop-blur-2xl border-b border-gray-200 shadow-xl"
        : "bg-white/70 backdrop-blur-xl border-b border-gray-100"
      : scrolled
      ? "bg-black/80 backdrop-blur-2xl border-b border-white/10 shadow-2xl"
      : "bg-black/40 backdrop-blur-xl border-b border-white/5";

  const textClass =
    theme === "light"
      ? "text-gray-700 hover:text-gray-900"
      : "text-white/80 hover:text-white";

  const buttonClass =
    theme === "light"
      ? "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
      : "bg-white/10 hover:bg-white/20 text-white border-white/20";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBgClass}`}
    >
      <div className="container flex h-20 items-center justify-between">
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity"
          onClick={() => setMenuOpen(false)}
        >
          <Image
            src="/images/logo/neotech.png"
            alt="NeoTech"
            width={150}
            height={40}
            priority
            className="h-10 w-auto"
            unoptimized
          />
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/products"
            className={`font-medium transition-colors text-sm ${textClass}`}
          >
            Catálogo
          </Link>
          {logged && (
            <Link
              href="/admin"
              className={`font-medium transition-colors text-sm ${textClass}`}
            >
              Administrar
            </Link>
          )}

          {/* Theme Toggle - Desktop */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-lg hover:bg-opacity-10 transition-colors ${textClass}`}
            aria-label="Cambiar tema"
            title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          >
            {theme === "dark" ? (
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
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
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
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {logged ? (
            <button
              type="button"
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm border ${buttonClass}`}
              onClick={handleLogout}
            >
              Cerrar Sesión
            </button>
          ) : (
            <Link
              href="/login"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                theme === "light"
                  ? "bg-gray-200 hover:bg-gray-300"
                  : "bg-white/10 hover:bg-white/20"
              }`}
              title="Iniciar Sesión"
            >
              <svg
                className={`w-5 h-5 ${
                  theme === "light" ? "text-gray-700" : "text-white"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>
          )}
        </div>

        {/* Botón hamburguesa - Mobile */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className={`md:hidden p-2 hover:bg-opacity-10 rounded-lg transition-colors ${textClass}`}
          aria-label="Menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar Mobile */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <button
            type="button"
            aria-label="Cerrar menú"
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 top-20"
            onClick={() => setMenuOpen(false)}
            tabIndex={0}
            style={{
              border: "none",
              padding: 0,
              margin: 0,
              background: "none",
            }}
          />

          {/* Sidebar */}
          <div
            className={`md:hidden fixed top-20 right-0 bottom-0 w-64 backdrop-blur-xl border-l z-40 shadow-2xl ${
              theme === "light"
                ? "bg-white border-gray-200"
                : "bg-black border-white/20"
            }`}
          >
            <div
              className={`flex flex-col p-6 gap-4 ${
                theme === "light"
                  ? "bg-gradient-to-b from-white via-white to-gray-50"
                  : "bg-linear-to-b from-black via-black to-black/95"
              }`}
            >
              <Link
                href="/products"
                className={`font-medium transition-colors text-base py-3 px-4 rounded-lg ${
                  theme === "light"
                    ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                📦 Catálogo
              </Link>
              {logged && (
                <Link
                  href="/admin"
                  className={`font-medium transition-colors text-base py-3 px-4 rounded-lg ${
                    theme === "light"
                      ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  ⚙️ Administrar
                </Link>
              )}

              <div
                className={`border-t my-2 ${
                  theme === "light" ? "border-gray-200" : "border-white/10"
                }`}
              />

              {/* Theme Toggle - Mobile */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center gap-3 ${
                  theme === "light"
                    ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {theme === "dark" ? (
                  <>
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
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                    <span className="font-medium">☀️ Modo Claro</span>
                  </>
                ) : (
                  <>
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
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                    <span className="font-medium">🌙 Modo Oscuro</span>
                  </>
                )}
              </button>

              <div
                className={`border-t my-2 ${
                  theme === "light" ? "border-gray-200" : "border-white/10"
                }`}
              />

              {logged ? (
                <button
                  type="button"
                  className="w-full px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-all text-base border border-red-400/30"
                  onClick={handleLogout}
                >
                  🚪 Cerrar Sesión
                </button>
              ) : (
                <Link
                  href="/login"
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all text-base border flex items-center justify-center gap-2 ${
                    theme === "light"
                      ? "bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
                      : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-400/30"
                  }`}
                  onClick={() => setMenuOpen(false)}
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Iniciar Sesión</span>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
