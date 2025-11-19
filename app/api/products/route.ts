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

  // Obtener parámetros de paginación y filtros
  const { searchParams } = new URL(req.url);
  const page = Number.parseInt(searchParams.get("page") || "1", 10);
  const limit = Number.parseInt(searchParams.get("limit") || "12", 10);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const inStock = searchParams.get("inStock") === "true";
  const sortBy = searchParams.get("sortBy") || "newest";

  // Construir query de filtros
  const query: any = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (category && category !== "all") {
    query.category = category;
  }

  if (minPrice) {
    query.price = { ...query.price, $gte: Number.parseFloat(minPrice) };
  }

  if (maxPrice) {
    query.price = { ...query.price, $lte: Number.parseFloat(maxPrice) };
  }

  if (inStock) {
    query.stock = { $gt: 0 };
  }

  // Definir ordenamiento
  let sort: any = { createdAt: -1 };
  switch (sortBy) {
    case "price-asc":
      sort = { price: 1 };
      break;
    case "price-desc":
      sort = { price: -1 };
      break;
    case "name-asc":
      sort = { title: 1 };
      break;
    case "name-desc":
      sort = { title: -1 };
      break;
  }

  // Calcular skip para paginación
  const skip = (page - 1) * limit;

  // Ejecutar query con paginación
  const [products, total] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ]);

  return NextResponse.json({
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: Request) {
  // Rate limiting para escritura
  if (writeLimiter) {
    const ip = getIP(req);
    const { success } = await writeLimiter.limit(ip);
    if (!success) {
      return NextResponse.json(
        {
          error:
            "Demasiadas peticiones de escritura. Intenta de nuevo más tarde.",
        },
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
