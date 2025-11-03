import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import User from "@/lib/models/User";
import AdminDashboard from "@/components/AdminDashboard";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  // Verificar autenticación
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  const payload = verifyToken(token);

  if (!payload) {
    redirect("/login");
  }

  const isAdmin = payload.role === "ADMIN";

  await connectDB();
  const productsRaw = await Product.find().sort({ createdAt: -1 }).lean();

  // Solo cargar usuarios si es ADMIN
  const usersRaw = isAdmin
    ? await User.find().select("-passwordHash").lean()
    : [];

  // Convertir a plain objects (serialización completa)
  const products = JSON.parse(JSON.stringify(productsRaw));
  const users = JSON.parse(JSON.stringify(usersRaw));

  const stats = {
    totalProducts: products.length,
    totalUsers: users.length,
    activeUsers: users.filter((u: any) => u.active).length,
    pendingUsers: users.filter((u: any) => !u.active).length,
    lowStockProducts: products.filter((p: any) => p.stock < 10).length,
  };

  return <AdminDashboard products={products} users={users} stats={stats} />;
}
