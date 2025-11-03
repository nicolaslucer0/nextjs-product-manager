"use client";
import { useState } from "react";

type ImportResult = {
  success: boolean;
  message: string;
  created: number;
  updated: number;
  total: number;
  errors?: string[];
};

export default function ProductImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor selecciona un archivo");
      return;
    }

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/products/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        setFile(null);
        // Reset input
        const input = document.getElementById("file-input") as HTMLInputElement;
        if (input) input.value = "";
      } else {
        setError(data.error || "Error al importar productos");
        if (data.hint) {
          setError(`${data.error}\n${data.hint}`);
        }
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Crear un CSV de ejemplo con las columnas del Excel del usuario
    const template = `Id	Nombre	Tipo de Producto	Proveedor	Código	Stock	Precio de Venta	Descripción	Activo	Mostrar en Ventas	Mostrar en Compras	Imagen
PROD001	iPhone 15 Pro	Electrónica	Apple	IP15PRO	50	999.99	Smartphone Apple de última generación con chip A17 Pro	SI	SI	NO	https://example.com/iphone.jpg
PROD002	MacBook Air M2	Electrónica	Apple	MBA2023	30	1199.99	Laptop ultraligera con chip M2	SI	SI	NO	https://example.com/macbook.jpg
PROD003	AirPods Pro	Accesorios	Apple	APP2023	100	249.99	Auriculares inalámbricos con cancelación de ruido	SI	SI	NO	https://example.com/airpods.jpg`;

    const blob = new Blob([template], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_productos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Importar Productos desde Excel
        </h2>
        <p className="text-white/60">
          Sube un archivo CSV o Excel para crear o actualizar productos
          masivamente
        </p>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-400 mb-2">📋 Instrucciones</h3>
        <ul className="text-sm text-blue-300 space-y-1">
          <li>• El archivo debe ser CSV (.csv) o Excel (.xlsx, .xls)</li>
          <li>
            • Columnas requeridas: <strong>Id, Nombre</strong>
          </li>
          <li>
            • Columnas opcionales: Tipo de Producto, Proveedor, Código, Stock,
            Precio de Venta, Descripción, Activo, Mostrar en Ventas, Mostrar en
            Compras, Imagen
          </li>
          <li>• Si un producto con el mismo ID ya existe, se actualizará</li>
          <li>• Si no existe, se creará uno nuevo</li>
          <li>• El ID es obligatorio y debe ser único</li>
        </ul>
        <button
          onClick={downloadTemplate}
          className="mt-3 text-sm text-blue-400 hover:text-blue-300 underline"
        >
          📥 Descargar plantilla de ejemplo
        </button>
      </div>

      {/* Selector de archivo */}
      <div className="mb-6">
        <label className="label">Seleccionar archivo</label>
        <div className="flex gap-3">
          <input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="input flex-1"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn btn-primary px-6"
          >
            {uploading ? "⏳ Subiendo..." : "📤 Importar"}
          </button>
        </div>
        {file && (
          <p className="text-sm text-white/60 mt-2">
            Archivo seleccionado: <strong>{file.name}</strong> (
            {(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      {/* Resultado */}
      {result && (
        <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-green-400 mb-2">
            ✅ {result.message}
          </h3>
          <div className="text-sm text-green-300 space-y-1">
            <p>• Total procesados: {result.total}</p>
            <p>• Productos creados: {result.created}</p>
            <p>• Productos actualizados: {result.updated}</p>
          </div>
          {result.errors && result.errors.length > 0 && (
            <div className="mt-3 pt-3 border-t border-green-400/30">
              <p className="font-semibold text-yellow-400 mb-2">
                ⚠️ Advertencias:
              </p>
              <ul className="text-xs text-yellow-300 space-y-1 max-h-40 overflow-y-auto">
                {result.errors.map((err, idx) => (
                  <li key={idx}>• {err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
          <h3 className="font-semibold text-red-400 mb-2">❌ Error</h3>
          <p className="text-sm text-red-300 whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Formato del archivo */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <h3 className="font-semibold mb-3">Ejemplo de formato CSV:</h3>
        <div className="bg-black/30 rounded-lg p-4 font-mono text-sm overflow-x-auto">
          <pre className="text-green-400">
            {`Id	Nombre	Stock	Precio de Venta	Descripción
PROD001	iPhone 15 Pro	50	999.99	Smartphone Apple
PROD002	MacBook Air	30	1199.99	Laptop M2`}
          </pre>
        </div>
        <p className="text-xs text-white/50 mt-2">
          Nota: Puedes usar comas (,) punto y coma (;) o tabulaciones ( ) como
          separadores
        </p>
      </div>
    </div>
  );
}
