"use client";
import { useTheme } from "@/contexts/ThemeContext";

type Props = {
  readonly items: string[];
  readonly icon?: string;
  readonly title: string;
};

export default function PaymentInfoBanner({ items, icon = "💳", title }: Props) {
  const { theme } = useTheme();

  if (!items || items.length === 0) return null;

  return (
    <div
      className={`rounded-lg border p-4 flex gap-3 items-start ${
        theme === "light"
          ? "bg-amber-50 border-amber-200"
          : "bg-amber-500/10 border-amber-400/30"
      }`}
    >
      <span className="text-lg shrink-0">{icon}</span>
      <div className="flex-1">
        <p
          className={`text-sm font-medium mb-1 ${
            theme === "light" ? "text-amber-900" : "text-amber-100"
          }`}
        >
          {title}
        </p>
        <ul
          className={`text-sm leading-relaxed space-y-0.5 ${
            theme === "light" ? "text-amber-800" : "text-amber-200"
          }`}
        >
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
