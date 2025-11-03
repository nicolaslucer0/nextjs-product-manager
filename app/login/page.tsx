"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      setMessage("¡Inicio de sesión exitoso! Redirigiendo...");

      // Redirigir al admin dashboard
      setTimeout(() => {
        router.push("/admin");
      }, 500);
    } else {
      setMessage(data.error || "Error al iniciar sesión");
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

          {message && (
            <div
              className={`px-4 py-4 rounded-xl backdrop-blur-xl ${
                message.includes("exitoso")
                  ? "bg-green-500/20 border border-green-500/30 text-green-300"
                  : "bg-red-500/20 border border-red-500/30 text-red-300"
              }`}
            >
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}

          <button
            className="btn btn-primary w-full text-lg py-4"
            type="submit"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
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
