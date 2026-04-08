"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import Button from "../Button";

export default function ShippingMessageManager() {
  const { showToast } = useToast();
  const [methods, setMethods] = useState<string[]>([""]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => {
        const m = data?.shippingMethods;
        if (Array.isArray(m) && m.length > 0) setMethods(m);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (index: number, value: string) => {
    const updated = [...methods];
    updated[index] = value;
    setMethods(updated);
  };

  const addMethod = () => setMethods([...methods, ""]);

  const removeMethod = (index: number) => {
    if (methods.length <= 1) return;
    setMethods(methods.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const filtered = methods.map((m) => m.trim()).filter(Boolean);
      const res = await fetch("/api/site-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shippingMethods: filtered }),
      });
      if (res.ok) {
        if (filtered.length > 0) setMethods(filtered);
        else setMethods([""]);
        showToast("Formas de envío actualizadas", "success");
      } else {
        showToast("Error al guardar", "error");
      }
    } catch {
      showToast("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto" />
        <p className="mt-4 text-white/60">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">Formas de envío</h3>
        <p className="text-white/60 text-sm">
          Agregá las formas de envío disponibles. En el checkout el cliente
          podrá elegir una.
        </p>
      </div>
      <form onSubmit={handleSave} className="space-y-3">
        {methods.map((method, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={method}
              onChange={(e) => handleChange(index, e.target.value)}
              className="input flex-1"
              placeholder={`Ej: Envío a domicilio`}
            />
            {methods.length > 1 && (
              <button
                type="button"
                onClick={() => removeMethod(index)}
                className="px-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                title="Eliminar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addMethod}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar forma de envío
        </button>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </div>
  );
}
