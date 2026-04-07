"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";
import Button from "../Button";

export default function PaymentMessageManager() {
  const { showToast } = useToast();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => {
        if (data?.paymentMessage) setMessage(data.paymentMessage);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/site-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentMessage: message }),
      });
      if (res.ok) {
        showToast("Mensaje de pago actualizado", "success");
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
        <h3 className="text-xl font-semibold mb-2">Mensaje de métodos de pago</h3>
        <p className="text-white/60 text-sm">
          Se muestra en la página de producto y en el checkout. Podés usar
          **texto** para negrita y *texto* para cursiva.
        </p>
      </div>
      <form onSubmit={handleSave} className="space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="input w-full"
          placeholder="Ej: Métodos de pago: efectivo, transferencia bancaria.&#10;**Consultá por otros medios de pago**"
        />
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </div>
  );
}
