"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import Button from "../Button";

type Category = {
  _id: string;
  name: string;
};

export default function CategoryManager() {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setNewName("");
        await loadCategories();
        showToast("Categoría creada", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Error al crear categoría", "error");
      }
    } catch {
      showToast("Error al crear categoría", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim() || editName.trim() === categories.find((c) => c._id === id)?.name) {
      setEditingId(null);
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, name: editName.trim() }),
      });
      if (res.ok) {
        setEditingId(null);
        await loadCategories();
        showToast("Categoría actualizada", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Error al actualizar", "error");
      }
    } catch {
      showToast("Error al actualizar categoría", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar la categoría "${name}"? Los productos con esta categoría no se verán afectados.`)) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        await loadCategories();
        showToast("Categoría eliminada", "success");
      } else {
        showToast("Error al eliminar categoría", "error");
      }
    } catch {
      showToast("Error al eliminar categoría", "error");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto" />
        <p className="mt-4 text-white/60">Cargando categorías...</p>
      </div>
    );
  }

  const borderClass = theme === "light" ? "border-gray-200" : "border-white/10";
  const cardBg = theme === "light" ? "bg-white border-gray-200" : "bg-white/5 border-white/10";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Gestión de Categorías</h3>
        <p className="text-white/60 text-sm">
          Creá y administrá las categorías disponibles para los productos.
        </p>
      </div>

      {/* Formulario para agregar */}
      <form onSubmit={handleAdd} className="flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nueva categoría..."
          className="input flex-1"
        />
        <Button type="submit" disabled={saving || !newName.trim()}>
          {saving ? "Creando..." : "Crear"}
        </Button>
      </form>

      {/* Lista */}
      {categories.length === 0 ? (
        <div className="text-center py-12 card">
          <p className="text-white/60 mb-2">No hay categorías</p>
          <p className="text-sm text-white/40">
            Creá tu primera categoría para poder asignarla a productos.
          </p>
        </div>
      ) : (
        <div className={`rounded-xl border ${borderClass} overflow-hidden`}>
          {categories.map((cat, index) => (
            <div
              key={cat._id}
              className={`flex items-center justify-between px-4 py-3 ${
                index > 0 ? `border-t ${borderClass}` : ""
              } ${cardBg}`}
            >
              {editingId === cat._id ? (
                <form
                  className="flex items-center gap-2 flex-1"
                  onSubmit={(e) => { e.preventDefault(); handleEdit(cat._id); }}
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input flex-1 py-1 text-sm"
                    autoFocus
                    disabled={saving}
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="text-green-400 hover:text-green-300 transition-colors"
                    title="Guardar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    disabled={saving}
                    className="text-white/40 hover:text-white/60 transition-colors"
                    title="Cancelar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              ) : (
                <>
                  <span className="font-medium">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setEditingId(cat._id); setEditName(cat.name); }}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                      title="Editar categoría"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat._id, cat.name)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Eliminar categoría"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
