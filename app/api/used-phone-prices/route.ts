import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import UsedPhonePrice from "@/lib/models/UsedPhonePrice";

function getTokenFromRequest(request: NextRequest): string | null {
  const cookieToken = request.cookies.get("token")?.value;
  if (cookieToken) return cookieToken;

  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;

  return authHeader.replace("Bearer ", "");
}

function ensureAdmin(
  request: NextRequest,
): { ok: true } | { ok: false; response: NextResponse } {
  const token = getTokenFromRequest(request);

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    };
  }

  const payload = verifyToken(token);

  if (payload?.role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json({ error: "No autorizado" }, { status: 403 }),
    };
  }

  return { ok: true };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "1";

    const query = includeInactive ? {} : { active: true };

    const rows = await UsedPhonePrice.find(query)
      .sort({ modelName: 1, storage: 1 })
      .lean();

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching used phone prices:", error);
    return NextResponse.json(
      { error: "Error al obtener cotizaciones" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = ensureAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const body = await request.json();

    const modelName = String(body.modelName || "").trim();
    const storage = String(body.storage || "").trim();
    const basePrice = Number(body.basePrice || 0);
    const changedPartsPrice = Number(body.changedPartsPrice || 0);
    const active = body.active !== false;

    if (!modelName || !storage) {
      return NextResponse.json(
        { error: "Modelo y memoria son requeridos" },
        { status: 400 },
      );
    }

    const created = await UsedPhonePrice.create({
      modelName,
      storage,
      basePrice,
      changedPartsPrice,
      active,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "Ya existe una fila para ese modelo y memoria" },
        { status: 409 },
      );
    }

    console.error("Error creating used phone price:", error);
    return NextResponse.json(
      { error: "Error al crear cotización" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = ensureAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const body = await request.json();

    const id = String(body.id || "");
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const modelName = String(body.modelName || "").trim();
    const storage = String(body.storage || "").trim();
    const basePrice = Number(body.basePrice || 0);
    const changedPartsPrice = Number(body.changedPartsPrice || 0);
    const active = body.active !== false;

    if (!modelName || !storage) {
      return NextResponse.json(
        { error: "Modelo y memoria son requeridos" },
        { status: 400 },
      );
    }

    const updated = await UsedPhonePrice.findByIdAndUpdate(
      id,
      {
        modelName,
        storage,
        basePrice,
        changedPartsPrice,
        active,
      },
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Registro no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "Ya existe una fila para ese modelo y memoria" },
        { status: 409 },
      );
    }

    console.error("Error updating used phone price:", error);
    return NextResponse.json(
      { error: "Error al actualizar cotización" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const auth = ensureAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || "";

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    await UsedPhonePrice.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting used phone price:", error);
    return NextResponse.json(
      { error: "Error al eliminar cotización" },
      { status: 500 },
    );
  }
}
