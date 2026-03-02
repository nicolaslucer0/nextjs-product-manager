"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/contexts/ToastContext";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";

type UsedPhonePrice = {
  _id: string;
  modelName: string;
  storage: string;
  basePrice: number;
  changedPartsPrice: number;
  active: boolean;
};

const COMMON_IPHONES = [
  "iPhone 11",
  "iPhone 11 Pro",
  "iPhone 11 Pro Max",
  "iPhone 12",
  "iPhone 12 mini",
  "iPhone 12 Pro",
  "iPhone 12 Pro Max",
  "iPhone 13",
  "iPhone 13 mini",
  "iPhone 13 Pro",
  "iPhone 13 Pro Max",
  "iPhone 14",
  "iPhone 14 Plus",
  "iPhone 14 Pro",
  "iPhone 14 Pro Max",
  "iPhone 15",
  "iPhone 15 Plus",
  "iPhone 15 Pro",
  "iPhone 15 Pro Max",
  "iPhone 16",
  "iPhone 16 Plus",
  "iPhone 16 Pro",
  "iPhone 16 Pro Max",
];

export default function UsedPhonePricingManager() {
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [rows, setRows] = useState<UsedPhonePrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [modelName, setModelName] = useState("");
  const [storage, setStorage] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [changedPartsPrice, setChangedPartsPrice] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    loadRows();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setModelName("");
    setStorage("");
    setBasePrice("");
    setChangedPartsPrice("");
    setActive(true);
  };

  const loadRows = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/used-phone-prices?includeInactive=1");
      if (response.ok) {
        const data = await response.json();
        setRows(Array.isArray(data) ? data : []);
      } else {
        showToast("Error al cargar tabla de usados", "error");
      }
    } catch (error) {
      console.error("Error loading used phone prices:", error);
      showToast("Error al cargar tabla de usados", "error");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (row: UsedPhonePrice) => {
    setEditingId(row._id);
    setModelName(row.modelName);
    setStorage(row.storage);
    setBasePrice(String(row.basePrice));
    setChangedPartsPrice(String(row.changedPartsPrice));
    setActive(row.active);
  };

  const save = async () => {
    if (!modelName.trim() || !storage.trim()) {
      showToast("Modelo y memoria son requeridos", "error");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: editingId,
        modelName: modelName.trim(),
        storage: storage.trim(),
        basePrice: Number(basePrice || 0),
        changedPartsPrice: Number(changedPartsPrice || 0),
        active,
      };

      const response = await fetch("/api/used-phone-prices", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        showToast(data?.error || "Error al guardar", "error");
        return;
      }

      showToast(
        editingId
          ? "Cotización actualizada correctamente"
          : "Cotización creada correctamente",
        "success",
      );
      resetForm();
      await loadRows();
    } catch (error) {
      console.error("Error saving used phone price:", error);
      showToast("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar esta fila de cotización?")) return;

    try {
      const response = await fetch(`/api/used-phone-prices?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        showToast("Error al eliminar", "error");
        return;
      }

      showToast("Fila eliminada", "success");
      await loadRows();
    } catch (error) {
      console.error("Error deleting used phone price:", error);
      showToast("Error al eliminar", "error");
    }
  };

  let submitLabel = "Crear";
  if (saving) {
    submitLabel = "Guardando...";
  } else if (editingId) {
    submitLabel = "Actualizar";
  }

  let tableContent: React.ReactNode = null;

  if (loading) {
    tableContent = <p className="text-white/60">Cargando...</p>;
  } else if (rows.length === 0) {
    tableContent = (
      <p className="text-white/60">Todavía no hay filas cargadas.</p>
    );
  } else {
    tableContent = (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className={`border-b ${
                theme === "light" ? "border-gray-200" : "border-white/10"
              }`}
            >
              <th className="text-left py-2 px-2">Modelo</th>
              <th className="text-left py-2 px-2">Memoria</th>
              <th className="text-left py-2 px-2">Precio base</th>
              <th className="text-left py-2 px-2">Con piezas cambiadas</th>
              <th className="text-left py-2 px-2">Estado</th>
              <th className="text-right py-2 px-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row._id}
                className={`border-b ${
                  theme === "light" ? "border-gray-100" : "border-white/5"
                }`}
              >
                <td className="py-2 px-2">{row.modelName}</td>
                <td className="py-2 px-2">{row.storage}</td>
                <td className="py-2 px-2">${formatPrice(row.basePrice)}</td>
                <td className="py-2 px-2">
                  ${formatPrice(row.changedPartsPrice)}
                </td>
                <td className="py-2 px-2">
                  {row.active ? (
                    <span className="text-green-400">Activo</span>
                  ) : (
                    <span className="text-white/50">Inactivo</span>
                  )}
                </td>
                <td className="py-2 px-2">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => startEdit(row)}
                      className="btn bg-blue-500/20 border border-blue-400/30 hover:bg-blue-500/30 text-blue-400 text-xs"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => remove(row._id)}
                      className="btn bg-red-500/20 border border-red-400/30 hover:bg-red-500/30 text-red-400 text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Cotización de usados</h2>
        <p className="text-white/60 text-sm">
          Cargá los precios por modelo y memoria. El cliente verá dos precios:
          normal y con piezas cambiadas.
        </p>
      </div>

      <div className="card space-y-4">
        <h3 className="text-lg font-semibold">
          {editingId ? "Editar fila" : "Nueva fila"}
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="used-model-name" className="label">
              Modelo iPhone
            </label>
            <input
              id="used-model-name"
              list="iphone-models"
              className="input"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Ej: iPhone 13 Pro"
            />
            <datalist id="iphone-models">
              {COMMON_IPHONES.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="used-storage" className="label">
              Memoria
            </label>
            <input
              id="used-storage"
              className="input"
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
              placeholder="Ej: 128GB"
            />
          </div>

          <div>
            <label htmlFor="used-base-price" className="label">
              Precio base
            </label>
            <input
              id="used-base-price"
              type="number"
              min="0"
              className="input"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="0"
            />
          </div>

          <div>
            <label htmlFor="used-changed-parts-price" className="label">
              Precio con piezas cambiadas
            </label>
            <input
              id="used-changed-parts-price"
              type="number"
              min="0"
              className="input"
              value={changedPartsPrice}
              onChange={(e) => setChangedPartsPrice(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium">
          <input
            id="used-active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          <label htmlFor="used-active">Activo para cotización en cliente</label>
        </div>

        <div className="flex gap-3">
          <button onClick={save} disabled={saving} className="btn btn-primary">
            {submitLabel}
          </button>
          {(editingId ||
            modelName ||
            storage ||
            basePrice ||
            changedPartsPrice) && (
            <button
              onClick={resetForm}
              disabled={saving}
              className="btn bg-white/5 border border-white/10 hover:bg-white/10"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          Tabla cargada ({rows.length})
        </h3>
        {tableContent}
      </div>
    </div>
  );
}
