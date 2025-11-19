"use client";
import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";

export default function RegisterPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      showToast("Las contraseñas no coinciden", "warning");
      return;
    }

    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      showToast("La contraseña debe tener al menos 6 caracteres", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setMessage(
          "¡Registro exitoso! Tu cuenta está pendiente de activación por un administrador. Te notificaremos cuando puedas iniciar sesión."
        );
        showToast("¡Registro exitoso!", "success");
      } else {
        setError(data.error || "Error al registrar el usuario");
        showToast(data.error || "Error al registrar el usuario", "error");
      }
    } catch (error) {
      setError("Error al registrar el usuario");
      showToast("Error al registrar el usuario", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="card max-w-md w-full">
        {isSuccess ? (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Registro Exitoso!
            </h2>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6">
              <p className="text-sm leading-relaxed">{message}</p>
            </div>

            <div className="space-y-3">
              <Link href="/login" className="btn btn-primary w-full block">
                Ir a Iniciar Sesión
              </Link>
              <Link
                href="/"
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 w-full block"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Crear Cuenta
              </h1>
              <p className="text-gray-600">
                Completa el formulario para registrarte
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label htmlFor="name" className="label">
                  Nombre completo
                </label>
                <input
                  id="name"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ingresa tu nombre"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Contraseña
                </label>
                <input
                  id="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  className="input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="Repite tu contraseña"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
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
                    Registrando...
                  </span>
                ) : (
                  "Registrarse"
                )}
              </button>

              <div className="text-center text-sm text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Inicia sesión
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
