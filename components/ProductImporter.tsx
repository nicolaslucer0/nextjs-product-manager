"use client";
import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";

type ImportResult = {
  success: boolean;
  message: string;
  created: number;
  updated: number;
  total: number;
  errors?: string[];
};

type ProgressData = {
  message: string;
  percent: number;
  created?: number;
  updated?: number;
  errors?: number;
  processed?: number;
  total?: number;
};

export default function ProductImporter() {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<ProgressData | null>(null);
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
      showToast("Por favor selecciona un archivo", "warning");
      return;
    }

    setUploading(true);
    setError("");
    setResult(null);
    setProgress(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Usar el endpoint con streaming
      const res = await fetch("/api/products/import-stream", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Error al iniciar la importación");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No se pudo leer la respuesta");
      }

      // Leer el stream
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");

        // Guardar la última línea incompleta
        buffer = lines.pop() || "";

        // Procesar cada línea completa
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "progress") {
                setProgress({
                  message: data.message,
                  percent: data.percent,
                  created: data.created,
                  updated: data.updated,
                  errors: data.errors,
                  processed: data.processed,
                  total: data.total,
                });
              } else if (data.type === "complete") {
                setResult({
                  success: data.success,
                  message: data.message,
                  created: data.created,
                  updated: data.updated,
                  total: data.total,
                  errors: data.errors,
                });
                setProgress(null);
                setFile(null);
                showToast("Importación completada exitosamente", "success");

                // Reset input
                const input = document.getElementById(
                  "file-input"
                ) as HTMLInputElement;
                if (input) input.value = "";

                // Recargar página después de 2 segundos
                setTimeout(() => {
                  globalThis.location.reload();
                }, 2000);
              } else if (data.type === "error") {
                setError(data.message);
                if (data.hint) {
                  setError(`${data.message}\n${data.hint}`);
                }
                showToast(data.message, "error");
                setProgress(null);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error uploading file:", err);
      const errorMsg =
        err instanceof Error ? err.message : "Error al subir el archivo";
      setError(errorMsg);
      showToast(errorMsg, "error");
      setProgress(null);
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
        <label htmlFor="file-input" className="label">
          Seleccionar archivo
        </label>
        <div className="flex gap-3">
          <input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="input flex-1"
            disabled={uploading}
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="btn btn-primary px-6"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Procesando...
              </span>
            ) : (
              "📤 Importar"
            )}
          </button>
        </div>
        {file && !uploading && (
          <p className="text-sm text-white/60 mt-2">
            Archivo seleccionado: <strong>{file.name}</strong> (
            {(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      {/* Barra de progreso */}
      {progress && (
        <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-400">{progress.message}</h3>
            <span className="text-blue-300 font-bold">{progress.percent}%</span>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-black/30 rounded-full h-3 mb-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          {/* Estadísticas en tiempo real */}
          {progress.processed !== undefined && progress.total !== undefined && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="bg-black/30 rounded-lg p-2 text-center">
                <div className="text-white/60 text-xs">Procesados</div>
                <div className="text-white font-semibold">
                  {progress.processed} / {progress.total}
                </div>
              </div>
              {progress.created !== undefined && (
                <div className="bg-green-500/20 rounded-lg p-2 text-center">
                  <div className="text-green-400/80 text-xs">Creados</div>
                  <div className="text-green-300 font-semibold">
                    {progress.created}
                  </div>
                </div>
              )}
              {progress.updated !== undefined && (
                <div className="bg-yellow-500/20 rounded-lg p-2 text-center">
                  <div className="text-yellow-400/80 text-xs">Actualizados</div>
                  <div className="text-yellow-300 font-semibold">
                    {progress.updated}
                  </div>
                </div>
              )}
              {progress.errors !== undefined && progress.errors > 0 && (
                <div className="bg-red-500/20 rounded-lg p-2 text-center">
                  <div className="text-red-400/80 text-xs">Errores</div>
                  <div className="text-red-300 font-semibold">
                    {progress.errors}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
