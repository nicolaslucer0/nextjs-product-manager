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

export async function POST(request: NextRequest) {
  try {
    // Verificar que sea admin
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (payload?.role !== "ADMIN") {
      return NextResponse.json({ error: "Solo admins" }, { status: 403 });
    }

    await connectDB();

    // Verificar si ya hay datos
    const existingCount = await UsedPhonePrice.countDocuments();

    if (existingCount > 0) {
      return NextResponse.json({
        message: "Ya existen datos de precios. No se hizo seed.",
        count: existingCount,
      });
    }

    // Datos de ejemplo para iPhone
    const seedData = [
      // iPhone 15 Pro Max
      {
        modelName: "iPhone 15 Pro Max",
        storage: "256GB",
        basePrice: 850,
        changedPartsPrice: 750,
        active: true,
      },
      {
        modelName: "iPhone 15 Pro Max",
        storage: "512GB",
        basePrice: 950,
        changedPartsPrice: 850,
        active: true,
      },
      {
        modelName: "iPhone 15 Pro Max",
        storage: "1TB",
        basePrice: 1050,
        changedPartsPrice: 950,
        active: true,
      },

      // iPhone 15 Pro
      {
        modelName: "iPhone 15 Pro",
        storage: "128GB",
        basePrice: 700,
        changedPartsPrice: 600,
        active: true,
      },
      {
        modelName: "iPhone 15 Pro",
        storage: "256GB",
        basePrice: 800,
        changedPartsPrice: 700,
        active: true,
      },
      {
        modelName: "iPhone 15 Pro",
        storage: "512GB",
        basePrice: 900,
        changedPartsPrice: 800,
        active: true,
      },

      // iPhone 15 Plus
      {
        modelName: "iPhone 15 Plus",
        storage: "128GB",
        basePrice: 600,
        changedPartsPrice: 500,
        active: true,
      },
      {
        modelName: "iPhone 15 Plus",
        storage: "256GB",
        basePrice: 700,
        changedPartsPrice: 600,
        active: true,
      },
      {
        modelName: "iPhone 15 Plus",
        storage: "512GB",
        basePrice: 800,
        changedPartsPrice: 700,
        active: true,
      },

      // iPhone 15
      {
        modelName: "iPhone 15",
        storage: "128GB",
        basePrice: 550,
        changedPartsPrice: 450,
        active: true,
      },
      {
        modelName: "iPhone 15",
        storage: "256GB",
        basePrice: 650,
        changedPartsPrice: 550,
        active: true,
      },
      {
        modelName: "iPhone 15",
        storage: "512GB",
        basePrice: 750,
        changedPartsPrice: 650,
        active: true,
      },

      // iPhone 14 Pro Max
      {
        modelName: "iPhone 14 Pro Max",
        storage: "128GB",
        basePrice: 700,
        changedPartsPrice: 600,
        active: true,
      },
      {
        modelName: "iPhone 14 Pro Max",
        storage: "256GB",
        basePrice: 800,
        changedPartsPrice: 700,
        active: true,
      },
      {
        modelName: "iPhone 14 Pro Max",
        storage: "512GB",
        basePrice: 900,
        changedPartsPrice: 800,
        active: true,
      },
      {
        modelName: "iPhone 14 Pro Max",
        storage: "1TB",
        basePrice: 1000,
        changedPartsPrice: 900,
        active: true,
      },

      // iPhone 14 Pro
      {
        modelName: "iPhone 14 Pro",
        storage: "128GB",
        basePrice: 600,
        changedPartsPrice: 500,
        active: true,
      },
      {
        modelName: "iPhone 14 Pro",
        storage: "256GB",
        basePrice: 700,
        changedPartsPrice: 600,
        active: true,
      },
      {
        modelName: "iPhone 14 Pro",
        storage: "512GB",
        basePrice: 800,
        changedPartsPrice: 700,
        active: true,
      },
      {
        modelName: "iPhone 14 Pro",
        storage: "1TB",
        basePrice: 900,
        changedPartsPrice: 800,
        active: true,
      },

      // iPhone 14 Plus
      {
        modelName: "iPhone 14 Plus",
        storage: "128GB",
        basePrice: 500,
        changedPartsPrice: 400,
        active: true,
      },
      {
        modelName: "iPhone 14 Plus",
        storage: "256GB",
        basePrice: 600,
        changedPartsPrice: 500,
        active: true,
      },
      {
        modelName: "iPhone 14 Plus",
        storage: "512GB",
        basePrice: 700,
        changedPartsPrice: 600,
        active: true,
      },

      // iPhone 14
      {
        modelName: "iPhone 14",
        storage: "128GB",
        basePrice: 450,
        changedPartsPrice: 350,
        active: true,
      },
      {
        modelName: "iPhone 14",
        storage: "256GB",
        basePrice: 550,
        changedPartsPrice: 450,
        active: true,
      },
      {
        modelName: "iPhone 14",
        storage: "512GB",
        basePrice: 650,
        changedPartsPrice: 550,
        active: true,
      },

      // iPhone 13 Pro Max
      {
        modelName: "iPhone 13 Pro Max",
        storage: "128GB",
        basePrice: 550,
        changedPartsPrice: 450,
        active: true,
      },
      {
        modelName: "iPhone 13 Pro Max",
        storage: "256GB",
        basePrice: 650,
        changedPartsPrice: 550,
        active: true,
      },
      {
        modelName: "iPhone 13 Pro Max",
        storage: "512GB",
        basePrice: 750,
        changedPartsPrice: 650,
        active: true,
      },
      {
        modelName: "iPhone 13 Pro Max",
        storage: "1TB",
        basePrice: 850,
        changedPartsPrice: 750,
        active: true,
      },

      // iPhone 13 Pro
      {
        modelName: "iPhone 13 Pro",
        storage: "128GB",
        basePrice: 500,
        changedPartsPrice: 400,
        active: true,
      },
      {
        modelName: "iPhone 13 Pro",
        storage: "256GB",
        basePrice: 600,
        changedPartsPrice: 500,
        active: true,
      },
      {
        modelName: "iPhone 13 Pro",
        storage: "512GB",
        basePrice: 700,
        changedPartsPrice: 600,
        active: true,
      },
      {
        modelName: "iPhone 13 Pro",
        storage: "1TB",
        basePrice: 800,
        changedPartsPrice: 700,
        active: true,
      },

      // iPhone 13
      {
        modelName: "iPhone 13",
        storage: "128GB",
        basePrice: 400,
        changedPartsPrice: 300,
        active: true,
      },
      {
        modelName: "iPhone 13",
        storage: "256GB",
        basePrice: 500,
        changedPartsPrice: 400,
        active: true,
      },
      {
        modelName: "iPhone 13",
        storage: "512GB",
        basePrice: 600,
        changedPartsPrice: 500,
        active: true,
      },

      // iPhone 12 Pro Max
      {
        modelName: "iPhone 12 Pro Max",
        storage: "128GB",
        basePrice: 450,
        changedPartsPrice: 350,
        active: true,
      },
      {
        modelName: "iPhone 12 Pro Max",
        storage: "256GB",
        basePrice: 550,
        changedPartsPrice: 450,
        active: true,
      },
      {
        modelName: "iPhone 12 Pro Max",
        storage: "512GB",
        basePrice: 650,
        changedPartsPrice: 550,
        active: true,
      },

      // iPhone 12 Pro
      {
        modelName: "iPhone 12 Pro",
        storage: "128GB",
        basePrice: 400,
        changedPartsPrice: 300,
        active: true,
      },
      {
        modelName: "iPhone 12 Pro",
        storage: "256GB",
        basePrice: 500,
        changedPartsPrice: 400,
        active: true,
      },
      {
        modelName: "iPhone 12 Pro",
        storage: "512GB",
        basePrice: 600,
        changedPartsPrice: 500,
        active: true,
      },

      // iPhone 12
      {
        modelName: "iPhone 12",
        storage: "64GB",
        basePrice: 300,
        changedPartsPrice: 200,
        active: true,
      },
      {
        modelName: "iPhone 12",
        storage: "128GB",
        basePrice: 350,
        changedPartsPrice: 250,
        active: true,
      },
      {
        modelName: "iPhone 12",
        storage: "256GB",
        basePrice: 450,
        changedPartsPrice: 350,
        active: true,
      },

      // iPhone 11 Pro Max
      {
        modelName: "iPhone 11 Pro Max",
        storage: "64GB",
        basePrice: 350,
        changedPartsPrice: 250,
        active: true,
      },
      {
        modelName: "iPhone 11 Pro Max",
        storage: "256GB",
        basePrice: 450,
        changedPartsPrice: 350,
        active: true,
      },
      {
        modelName: "iPhone 11 Pro Max",
        storage: "512GB",
        basePrice: 550,
        changedPartsPrice: 450,
        active: true,
      },

      // iPhone 11 Pro
      {
        modelName: "iPhone 11 Pro",
        storage: "64GB",
        basePrice: 300,
        changedPartsPrice: 200,
        active: true,
      },
      {
        modelName: "iPhone 11 Pro",
        storage: "256GB",
        basePrice: 400,
        changedPartsPrice: 300,
        active: true,
      },
      {
        modelName: "iPhone 11 Pro",
        storage: "512GB",
        basePrice: 500,
        changedPartsPrice: 400,
        active: true,
      },

      // iPhone 11
      {
        modelName: "iPhone 11",
        storage: "64GB",
        basePrice: 250,
        changedPartsPrice: 150,
        active: true,
      },
      {
        modelName: "iPhone 11",
        storage: "128GB",
        basePrice: 300,
        changedPartsPrice: 200,
        active: true,
      },
      {
        modelName: "iPhone 11",
        storage: "256GB",
        basePrice: 400,
        changedPartsPrice: 300,
        active: true,
      },
    ];

    // Insertar datos
    const created = await UsedPhonePrice.insertMany(seedData);

    return NextResponse.json({
      success: true,
      message: "Seed completado exitosamente",
      created: created.length,
      models: [...new Set(created.map((p) => p.modelName))],
    });
  } catch (error: any) {
    console.error("Error seeding used phone prices:", error);
    return NextResponse.json(
      { error: "Error al hacer seed", details: error.message },
      { status: 500 },
    );
  }
}
