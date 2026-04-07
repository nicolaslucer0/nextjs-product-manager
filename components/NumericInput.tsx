import { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  readonly allowDecimals?: boolean;
  readonly onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

/**
 * Input de texto que solo acepta valores numéricos.
 * Usa inputMode="decimal" para mostrar teclado numérico en mobile.
 */
export default function NumericInput({
  allowDecimals = false,
  onChange,
  ...props
}: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir: backspace, delete, tab, escape, enter, arrows, home, end
    const allowed = [
      "Backspace", "Delete", "Tab", "Escape", "Enter",
      "ArrowLeft", "ArrowRight", "Home", "End",
    ];
    if (allowed.includes(e.key)) return;

    // Permitir Ctrl/Cmd + A, C, V, X
    if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) return;

    // Permitir punto/coma decimal si está habilitado y no hay uno ya
    if (allowDecimals && (e.key === "." || e.key === ",")) {
      const value = e.currentTarget.value;
      if (value.includes(".") || value.includes(",")) {
        e.preventDefault();
      }
      return;
    }

    // Permitir signo negativo al inicio
    if (e.key === "-" && e.currentTarget.selectionStart === 0 && !e.currentTarget.value.includes("-")) {
      return;
    }

    // Bloquear cualquier cosa que no sea dígito
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    const pattern = allowDecimals ? /[^\d.\-,]/ : /[^\d\-]/;
    if (pattern.test(pasted)) {
      e.preventDefault();
    }
  };

  return (
    <input
      {...props}
      type="text"
      inputMode={allowDecimals ? "decimal" : "numeric"}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onChange={onChange}
    />
  );
}
