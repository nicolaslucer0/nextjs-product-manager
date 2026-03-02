import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { signToken } from "@/lib/auth";
import { authLimiter, getIP } from "@/lib/ratelimit";

export async function POST(req: Request) {
  // Rate limiting
  if (authLimiter) {
    try {
      const ip = getIP(req);
      const { success, limit, remaining, reset } = await authLimiter.limit(ip);

      if (!success) {
        return NextResponse.json(
          {
            error:
              "Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde.",
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": new Date(reset).toISOString(),
            },
          },
        );
      }
    } catch (error) {
      console.error("Rate limiter unavailable in /api/auth/login:", error);
    }
  }

  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Verificar si el usuario está activo
    if (!user.active)
      return NextResponse.json(
        {
          error: "Tu cuenta está pendiente de activación por un administrador",
        },
        { status: 403 },
      );

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });

    const token = signToken({ id: String(user._id), role: user.role });

    // Crear respuesta con cookie
    const response = NextResponse.json({ token, role: user.role });

    // Guardar token en cookie HTTP-only
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    });

    return response;
  } catch (e: any) {
    if (e?.message === "Missing JWT_SECRET") {
      return NextResponse.json(
        { error: "Server auth misconfiguration: Missing JWT_SECRET" },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
