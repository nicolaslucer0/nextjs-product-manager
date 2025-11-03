"use client";
import { useState, useEffect } from "react";
import type { SocialLinksType } from "@/lib/models/SocialLinks";

export default function SocialLinksManager() {
  const [socialLinks, setSocialLinks] = useState<SocialLinksType>({
    instagram: "",
    whatsapp: "",
    tiktok: "",
    locationAddress: "",
    locationCity: "",
    locationSchedule: "",
    locationMap: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const res = await fetch("/api/social-links");
      if (res.ok) {
        const data = await res.json();
        setSocialLinks(data);
      }
    } catch (error) {
      console.error("Error fetching social links:", error);
      setMessage("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/social-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socialLinks),
      });

      if (res.ok) {
        setMessage("✅ Cambios guardados correctamente");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Error al guardar los cambios");
      }
    } catch (error) {
      console.error("Error saving social links:", error);
      setMessage("❌ Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SocialLinksType, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Redes Sociales y Contacto</h2>
        <p className="text-white/60">
          Configura los enlaces que aparecen en la página de inicio
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Instagram */}
        <div>
          <label className="label">
            <span className="flex items-center gap-2">
              <span className="text-2xl">📸</span>
              Instagram
            </span>
          </label>
          <input
            type="url"
            className="input"
            placeholder="https://instagram.com/tu_usuario"
            value={socialLinks.instagram}
            onChange={(e) => handleChange("instagram", e.target.value)}
            required
          />
          <p className="text-xs text-white/40 mt-1">
            Ejemplo: https://instagram.com/neotech_store
          </p>
        </div>

        {/* WhatsApp */}
        <div>
          <label className="label">
            <span className="flex items-center gap-2">
              <span className="text-2xl">💬</span>
              WhatsApp
            </span>
          </label>
          <input
            type="text"
            className="input"
            placeholder="+1234567890"
            value={socialLinks.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            required
          />
          <p className="text-xs text-white/40 mt-1">
            Formato: +código_país número (Ejemplo: +56912345678)
          </p>
        </div>

        {/* TikTok */}
        <div>
          <label className="label">
            <span className="flex items-center gap-2">
              <span className="text-2xl">🎵</span>
              TikTok
            </span>
          </label>
          <input
            type="url"
            className="input"
            placeholder="https://tiktok.com/@tu_usuario"
            value={socialLinks.tiktok}
            onChange={(e) => handleChange("tiktok", e.target.value)}
            required
          />
          <p className="text-xs text-white/40 mt-1">
            Ejemplo: https://tiktok.com/@neotech_oficial
          </p>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h3 className="text-xl font-bold mb-4">📍 Ubicación de Tienda</h3>

          {/* Dirección */}
          <div className="mb-4">
            <label className="label">Dirección</label>
            <input
              type="text"
              className="input"
              placeholder="Av. Principal 123"
              value={socialLinks.locationAddress}
              onChange={(e) => handleChange("locationAddress", e.target.value)}
              required
            />
          </div>

          {/* Ciudad */}
          <div className="mb-4">
            <label className="label">Ciudad/País</label>
            <input
              type="text"
              className="input"
              placeholder="Ciudad, País"
              value={socialLinks.locationCity}
              onChange={(e) => handleChange("locationCity", e.target.value)}
              required
            />
          </div>

          {/* Horario */}
          <div className="mb-4">
            <label className="label">Horario de Atención</label>
            <input
              type="text"
              className="input"
              placeholder="Lun - Sáb: 9AM - 8PM"
              value={socialLinks.locationSchedule}
              onChange={(e) => handleChange("locationSchedule", e.target.value)}
              required
            />
          </div>

          {/* Mapa */}
          <div>
            <label className="label">Enlace de Google Maps (opcional)</label>
            <input
              type="url"
              className="input"
              placeholder="https://maps.google.com/..."
              value={socialLinks.locationMap}
              onChange={(e) => handleChange("locationMap", e.target.value)}
            />
            <p className="text-xs text-white/40 mt-1">
              Puedes obtenerlo desde Google Maps → Compartir → Copiar enlace
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.includes("✅")
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={saving}
        >
          {saving ? "Guardando..." : "💾 Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
