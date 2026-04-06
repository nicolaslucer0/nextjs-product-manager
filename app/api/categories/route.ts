import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 }).lean();
    return NextResponse.json(categories);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    await connectDB();
    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json({ error: "La categoría ya existe" }, { status: 409 });
    }

    const category = await Category.create({ name: name.trim() });
    return NextResponse.json(category, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    await connectDB();
    const { id, name } = await request.json();

    if (!id || !name?.trim()) {
      return NextResponse.json({ error: "ID y nombre son requeridos" }, { status: 400 });
    }

    const trimmed = name.trim();

    const duplicate = await Category.findOne({ name: trimmed, _id: { $ne: id } });
    if (duplicate) {
      return NextResponse.json({ error: "Ya existe una categoría con ese nombre" }, { status: 409 });
    }

    const old = await Category.findById(id);
    if (!old) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
    }

    const oldName = old.name;
    old.name = trimmed;
    await old.save();

    // Actualizar productos que tenían la categoría anterior
    if (oldName !== trimmed) {
      await Product.updateMany({ category: oldName }, { category: trimmed });
    }

    return NextResponse.json(old);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    await connectDB();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
