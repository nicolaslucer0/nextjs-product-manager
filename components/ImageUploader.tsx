"use client";
import { useState, useRef } from "react";

type ImageUploaderProps = {
  readonly onImageUploaded: (url: string) => void;
  readonly currentImages?: string[];
  readonly maxImages?: number;
  readonly label?: string;
};

export default function ImageUploader({
  onImageUploaded,
  currentImages = [],
  maxImages = 5,
  label = "Imágenes del producto",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUploadMore = currentImages.length < maxImages;

  const handleAddUrl = () => {
    if (!urlInput.trim()) {
      setError("Por favor, ingresa una URL");
      return;
    }

    // Validación básica de URL
    try {
      new URL(urlInput);
      onImageUploaded(urlInput.trim());
      setUrlInput("");
      setError("");
    } catch {
      setError("URL no válida");
    }
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al subir la imagen");
      }

      onImageUploaded(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) {
      uploadImage(file);
    } else {
      setError("Por favor, arrastra solo archivos de imagen");
    }
  };

  return (
    <div className="space-y-3">
      <label className="label">
        {label}{" "}
        <span className="text-white/40 text-sm font-normal">
          ({currentImages.length}/{maxImages})
        </span>
      </label>

      {canUploadMore && (
        <div className="space-y-3">
          {/* Tabs de modo */}
          <div className="flex gap-2 border-b border-white/10">
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`pb-2 px-4 font-medium transition-colors border-b-2 ${
                mode === "url"
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-white/50 hover:text-white/70"
              }`}
            >
              🔗 URL
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`pb-2 px-4 font-medium transition-colors border-b-2 ${
                mode === "upload"
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-white/50 hover:text-white/70"
              }`}
            >
              📤 Subir archivo
            </button>
          </div>

          {/* Modo URL */}
          {mode === "url" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="input flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="btn bg-blue-600 text-white hover:bg-blue-700 px-6"
                >
                  Agregar
                </button>
              </div>
              <p className="text-xs text-white/50">
                Pega la URL de una imagen externa (recomendado para mejor
                rendimiento)
              </p>
            </div>
          )}

          {/* Modo Upload */}
          {mode === "upload" && (
            <button
              type="button"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-blue-400 bg-blue-500/10"
                  : "border-white/20 hover:border-white/40 bg-white/5"
              } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={uploading}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />

              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-white/60">Subiendo imagen...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <svg
                    className="w-12 h-12 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <div>
                    <p className="text-white/80 font-medium mb-1">
                      Haz clic o arrastra una imagen
                    </p>
                    <p className="text-sm text-white/50">
                      PNG, JPG, WebP o GIF (máx. 5MB)
                    </p>
                  </div>
                </div>
              )}
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-400/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {!canUploadMore && (
        <p className="text-sm text-white/50">
          Has alcanzado el límite de {maxImages} imágenes
        </p>
      )}
    </div>
  );
}
