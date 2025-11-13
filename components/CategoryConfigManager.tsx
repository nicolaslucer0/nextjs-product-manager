"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";

type CategoryConfig = {
  _id: string;
  category: string;
  warrantyMessage: string;
  updatedAt: string;
};

type Props = {
  readonly categories: string[];
};

export default function CategoryConfigManager({ categories }: Props) {
  const { theme } = useTheme();
  const [configs, setConfigs] = useState<CategoryConfig[]>([]);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [warrantyMessage, setWarrantyMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/category-config");
      if (response.ok) {
        const data = await response.json();
        setConfigs(data);
      }
    } catch (error) {
      console.error("Error loading configs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: string) => {
    const config = configs.find((c) => c.category === category);
    setEditingCategory(category);
    setWarrantyMessage(config?.warrantyMessage || "Garantía de 30 días");
  };

  const handleSave = async (category: string) => {
    setSaving(true);
    try {
      const response = await fetch("/api/category-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, warrantyMessage }),
      });

      if (response.ok) {
        await loadConfigs();
        setEditingCategory(null);
        alert("✅ Configuración guardada exitosamente");
      } else {
        alert("❌ Error al guardar configuración");
      }
    } catch (error) {
      console.error("Error saving config:", error);
      alert("❌ Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  const getConfigForCategory = (category: string) => {
    return configs.find((c) => c.category === category);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
        <p className="mt-4 text-white/60">Cargando configuraciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">
          Configuración de Mensajes por Categoría
        </h3>
        <p className="text-white/60 text-sm">
          Personaliza el mensaje de garantía que se muestra en el detalle de
          cada producto según su categoría.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-white/60 mb-2">No hay categorías disponibles</p>
          <p className="text-sm text-white/40">
            Crea productos con categorías para poder configurar mensajes
            personalizados
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => {
            const config = getConfigForCategory(category);
            const isEditing = editingCategory === category;

            return (
              <div
                key={category}
                className={`card ${
                  theme === "light"
                    ? "bg-white border-gray-200"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-1">{category}</h4>
                    {isEditing ? (
                      <div className="space-y-3 mt-2">
                        <textarea
                          value={warrantyMessage}
                          onChange={(e) => setWarrantyMessage(e.target.value)}
                          placeholder="Ej: Garantía de 30 días"
                          rows={3}
                          className={`w-full rounded-lg border px-3 py-2 text-sm ${
                            theme === "light"
                              ? "bg-white border-gray-300 text-gray-900"
                              : "bg-white/5 border-white/10 text-white"
                          }`}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(category)}
                            disabled={saving}
                            className="btn btn-primary text-sm"
                          >
                            {saving ? "Guardando..." : "Guardar"}
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            disabled={saving}
                            className="btn bg-white/5 border border-white/10 hover:bg-white/10 text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p
                        className={`text-sm ${
                          theme === "light" ? "text-gray-600" : "text-white/60"
                        }`}
                      >
                        {config?.warrantyMessage ||
                          "Garantía de 30 días (predeterminado)"}
                      </p>
                    )}
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => handleEdit(category)}
                      className="btn bg-blue-500/20 border border-blue-400/30 hover:bg-blue-500/30 text-blue-400 text-sm"
                    >
                      Editar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
