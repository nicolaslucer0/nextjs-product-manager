"use client";
import { useTheme } from "@/contexts/ThemeContext";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  const { theme } = useTheme();

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Siempre mostrar primera página
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    // Páginas alrededor de la actual
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Siempre mostrar última página
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Botón Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-lg border transition-all ${
          currentPage === 1
            ? theme === "light"
              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
            : theme === "light"
            ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            : "bg-white/5 border-white/10 text-white hover:bg-white/10"
        }`}
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Números de página */}
      {pageNumbers.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..."}
          className={`min-w-[40px] px-3 py-2 rounded-lg border transition-all ${
            page === currentPage
              ? "bg-blue-500 border-blue-500 text-white font-semibold"
              : page === "..."
              ? theme === "light"
                ? "bg-transparent border-transparent text-gray-400 cursor-default"
                : "bg-transparent border-transparent text-white/40 cursor-default"
              : theme === "light"
              ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              : "bg-white/5 border-white/10 text-white hover:bg-white/10"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Botón Siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-lg border transition-all ${
          currentPage === totalPages
            ? theme === "light"
              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white/5 border-white/10 text-white/30 cursor-not-allowed"
            : theme === "light"
            ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            : "bg-white/5 border-white/10 text-white hover:bg-white/10"
        }`}
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
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
