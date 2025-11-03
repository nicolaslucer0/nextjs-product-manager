"use client";
import { useTheme } from "@/contexts/ThemeContext";

type ImagePlaceholderProps = {
  readonly size?: "sm" | "md" | "lg" | "xl";
  readonly className?: string;
};

export default function ImagePlaceholder({
  size = "md",
  className = "",
}: ImagePlaceholderProps) {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  const textSize = {
    sm: "text-xs",
    md: "text-xs",
    lg: "text-sm",
    xl: "text-base",
  };

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <svg
        className={`${sizeClasses[size]} ${
          theme === "light" ? "text-gray-300" : "text-white/20"
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span
        className={`${textSize[size]} ${
          theme === "light" ? "text-gray-400" : "text-white/30"
        } font-medium`}
      >
        Sin imagen
      </span>
    </div>
  );
}
