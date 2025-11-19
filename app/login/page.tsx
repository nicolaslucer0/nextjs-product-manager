"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";

export default function LoginPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        showToast("¡Inicio de sesión exitoso! Redirigiendo...", "success");

        // Redirigir al admin dashboard
        setTimeout(() => {
          router.push("/admin");
        }, 500);
      } else {
        showToast(data.error || "Error al iniciar sesión", "error");
        setLoading(false);
      }
    } catch (error) {
      showToast("Error al iniciar sesión", "error");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 container">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">Iniciar Sesión</h1>
          <p className="text-white/60">Ingresa tus credenciales para acceder</p>
        </div>

        <form onSubmit={submit} className="space-y-6">
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
              disabled={loading}
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
              placeholder="Tu contraseña"
              required
              disabled={loading}
            />
          </div>

          <button
            className="btn btn-primary w-full text-lg py-4"
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
                Iniciando sesión...
              </span>
            ) : (
              "Iniciar Sesión"
            )}
          </button>

          <div className="text-center text-sm text-white/60">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-white hover:text-white/80 font-semibold"
            >
              Regístrate
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
