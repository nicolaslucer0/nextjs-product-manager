"use client";
import { useTheme } from "@/contexts/ThemeContext";

type Props = {
  readonly message: string;
  readonly icon?: string;
};

/** Renders basic markdown: **bold**, *italic*, newlines */
function renderMarkdown(text: string) {
  const parts = text.split("\n");
  return parts.map((line, i) => {
    const formatted = line
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
    return (
      <span key={i}>
        {i > 0 && <br />}
        <span dangerouslySetInnerHTML={{ __html: formatted }} />
      </span>
    );
  });
}

export default function PaymentInfoBanner({ message, icon = "💳" }: Props) {
  const { theme } = useTheme();

  if (!message) return null;

  return (
    <div
      className={`rounded-lg border p-4 flex gap-3 items-start ${
        theme === "light"
          ? "bg-amber-50 border-amber-200"
          : "bg-amber-500/10 border-amber-400/30"
      }`}
    >
      <span className="text-lg shrink-0">{icon}</span>
      <div
        className={`text-sm leading-relaxed ${
          theme === "light" ? "text-amber-800" : "text-amber-200"
        }`}
      >
        {renderMarkdown(message)}
      </div>
    </div>
  );
}
