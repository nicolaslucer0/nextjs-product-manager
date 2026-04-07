"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import Button from "../Button";
import NumericInput from "../NumericInput";

export default function DollarRateManager() {
  const { showToast } = useToast();
  const [rate, setRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.dollarRate) setRate(String(data.dollarRate));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number.parseFloat(rate);
    if (Number.isNaN(value) || value < 0) {
      showToast("Ingresá un valor válido", "warning");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/site-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dollarRate: value }),
      });
      if (res.ok) {
        showToast("Cotización actualizada", "success");
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
        <h3 className="text-xl font-semibold mb-2">Cotización del dólar</h3>
        <p className="text-white/60 text-sm">
          Este valor se usa para mostrar el precio estimado en pesos en las
          páginas de producto y checkout.
        </p>
      </div>
      <form onSubmit={handleSave} className="flex gap-3 items-end">
        <div className="flex-1">
          <label htmlFor="dollarRate" className="label">
            1 USD = ARS
          </label>
          <NumericInput
            id="dollarRate"
            allowDecimals
            className="input"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="Ej: 1200"
          />
        </div>
        <Button type="submit" disabled={saving || !rate}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </div>
  );
}
