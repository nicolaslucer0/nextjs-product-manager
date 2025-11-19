import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import { verifyToken } from "@/lib/auth";
import { apiLimiter, writeLimiter, getIP } from "@/lib/ratelimit";

export async function GET(req: Request) {
  // Rate limiting para lectura
  if (apiLimiter) {
    const ip = getIP(req);
    const { success } = await apiLimiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Demasiadas peticiones. Intenta de nuevo más tarde." },
        { status: 429 }
      );
    }
  }

  await connectDB();
  const products = await Product.find().sort({ createdAt: -1 });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  // Rate limiting para escritura
  if (writeLimiter) {
    const ip = getIP(req);
    const { success } = await writeLimiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Demasiadas peticiones de escritura. Intenta de nuevo más tarde." },
        { status: 429 }
      );
    }
  }

  try {
    // Verificar que el usuario esté autenticado
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "No autorizado. Token requerido." },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Token inválido o expirado." },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await req.json();
    const product = await Product.create(data);
    return NextResponse.json(product, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
