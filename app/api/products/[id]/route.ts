import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import { verifyToken } from "@/lib/auth";
import { apiLimiter, writeLimiter, getIP } from "@/lib/ratelimit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  await connectDB();
  const p = await Product.findById(id);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(p);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    await connectDB();
    const data = await req.json();
    const updated = await Product.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    await connectDB();
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
