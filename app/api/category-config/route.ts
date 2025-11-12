import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CategoryConfig from "@/lib/models/CategoryConfig";

// GET: Obtener todas las configuraciones de categorías
export async function GET() {
  try {
    await connectDB();
    const configs = await CategoryConfig.find({}).sort({ category: 1 });
    return NextResponse.json(configs);
  } catch (error) {
    console.error("Error fetching category configs:", error);
    return NextResponse.json(
      { error: "Error al obtener configuraciones" },
      { status: 500 }
    );
  }
}

// POST: Crear o actualizar configuración de categoría
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { category, warrantyMessage } = body;

    if (!category) {
      return NextResponse.json(
        { error: "La categoría es requerida" },
        { status: 400 }
      );
    }

    // Buscar si existe configuración para esta categoría
    const existingConfig = await CategoryConfig.findOne({ category });

    if (existingConfig) {
      // Actualizar existente
      existingConfig.warrantyMessage = warrantyMessage || "Garantía de 30 días";
      await existingConfig.save();
      return NextResponse.json(existingConfig);
    } else {
      // Crear nueva
      const newConfig = await CategoryConfig.create({
        category,
        warrantyMessage: warrantyMessage || "Garantía de 30 días",
      });
      return NextResponse.json(newConfig);
    }
  } catch (error) {
    console.error("Error saving category config:", error);
    return NextResponse.json(
      { error: "Error al guardar configuración" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar configuración específica
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { category, warrantyMessage } = body;

    if (!category) {
      return NextResponse.json(
        { error: "La categoría es requerida" },
        { status: 400 }
      );
    }

    const config = await CategoryConfig.findOneAndUpdate(
      { category },
      { warrantyMessage, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error updating category config:", error);
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}
