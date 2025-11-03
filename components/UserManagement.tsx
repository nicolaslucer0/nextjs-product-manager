"use client";
import { useState } from "react";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  active: boolean;
  createdAt: string;
};

export default function UserManagement({
  users: initialUsers,
}: Readonly<{
  users: User[];
}>) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState<string | null>(null);

  async function toggleActive(userId: string, currentStatus: boolean) {
    setLoading(userId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: !currentStatus }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(users.map((u) => (u._id === userId ? updatedUser : u)));
      } else {
        const error = await res.json();
        alert(error.error || "Error al actualizar el usuario");
      }
    } catch (error) {
      alert("Error al actualizar el usuario");
    } finally {
      setLoading(null);
    }
  }

  async function deleteUser(userId: string, userName: string) {
    if (!confirm(`¿Estás seguro de eliminar a ${userName}?`)) return;

    setLoading(userId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setUsers(users.filter((u) => u._id !== userId));
      } else {
        const error = await res.json();
        alert(error.error || "Error al eliminar el usuario");
      }
    } catch (error) {
      alert("Error al eliminar el usuario");
    } finally {
      setLoading(null);
    }
  }

  const pendingUsers = users.filter((u) => !u.active && u.role !== "ADMIN");
  const activeUsers = users.filter((u) => u.active || u.role === "ADMIN");

  return (
    <div className="space-y-6">
      {/* Usuarios pendientes de activación */}
      {pendingUsers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 text-orange-600">
            Pendientes de activación ({pendingUsers.length})
          </h3>
          <div className="space-y-2">
            {pendingUsers.map((user) => (
              <div
                key={user._id}
                className="border border-orange-200 bg-orange-50 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{user.name || "Sin nombre"}</div>
                  <div className="text-sm text-white/60">{user.email}</div>
                  <div className="text-xs text-white/50 mt-1">
                    Registrado: {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(user._id, user.active)}
                    disabled={loading === user._id}
                    className="btn bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading === user._id ? "..." : "✓ Activar"}
                  </button>
                  <button
                    onClick={() => deleteUser(user._id, user.name)}
                    disabled={loading === user._id}
                    className="btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading === user._id ? "..." : "✕ Rechazar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usuarios activos */}
      <div>
        <h3 className="text-lg font-semibold mb-3">
          Usuarios activos ({activeUsers.length})
        </h3>
        <div className="space-y-2">
          {activeUsers.map((user) => (
            <div
              key={user._id}
              className="border rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {user.name || "Sin nombre"}
                  </span>
                  {user.role === "ADMIN" && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                      ADMIN
                    </span>
                  )}
                  {user.active && user.role !== "ADMIN" && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                      Activo
                    </span>
                  )}
                </div>
                <div className="text-sm text-white/60">{user.email}</div>
                <div className="text-xs text-white/50 mt-1">
                  Registrado: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
              {user.role !== "ADMIN" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleActive(user._id, user.active)}
                    disabled={loading === user._id}
                    className={`btn ${
                      user.active
                        ? "bg-white/10 hover:bg-white/20"
                        : "bg-green-600 hover:bg-green-700"
                    } text-white disabled:opacity-50`}
                  >
                    {loading === user._id
                      ? "..."
                      : user.active
                      ? "Desactivar"
                      : "Activar"}
                  </button>
                  <button
                    onClick={() => deleteUser(user._id, user.name)}
                    disabled={loading === user._id}
                    className="btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading === user._id ? "..." : "Eliminar"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-white/50">
          No hay usuarios registrados
        </div>
      )}
    </div>
  );
}
