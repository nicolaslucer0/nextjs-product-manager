import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import { verifyToken } from "@/lib/auth";
import { apiLimiter, writeLimiter, getIP } from "@/lib/ratelimit";

export async function GET(req: Request) {
  try {
    // Rate limiting para lectura
    if (apiLimiter) {
      try {
        const ip = getIP(req);
        const { success } = await apiLimiter.limit(ip);
        if (!success) {
          return NextResponse.json(
            { error: "Demasiadas peticiones. Intenta de nuevo más tarde." },
            { status: 429 },
          );
        }
      } catch (error) {
        console.error("Rate limiter unavailable in /api/products GET:", error);
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
    const planCanjeParam = searchParams.get("planCanje");
    const sortBy = searchParams.get("sortBy") || "newest";

    // Construir query de filtros
    const query: any = {};

    if (search) {
      query.$text = { $search: search };
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

    if (planCanjeParam === "true") {
      query.planCanje = true;
    } else if (planCanjeParam === "false") {
      query.planCanje = false;
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
    const safeLimit = Number.isFinite(limit)
      ? Math.max(1, Math.min(limit, 100))
      : 12;
    const skip = (page - 1) * safeLimit;

    const projection =
      "title description category price stock images variants featured planCanje createdAt updatedAt";

    // Ejecutar query con paginación sin countDocuments (más performante)
    const pageResults = await Product.find(query)
      .select(projection)
      .sort(sort)
      .skip(skip)
      .limit(safeLimit + 1)
      .lean();

    const hasNextPage = pageResults.length > safeLimit;
    const products = hasNextPage
      ? pageResults.slice(0, safeLimit)
      : pageResults;
    const total = skip + products.length + (hasNextPage ? 1 : 0);
    const totalPages = hasNextPage ? page + 1 : page;

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit: safeLimit,
        total,
        totalPages,
        hasNextPage,
      },
    });
  } catch (e: any) {
    if (e?.message === "Missing MONGODB_URI") {
      return NextResponse.json(
        { error: "Server DB misconfiguration: Missing MONGODB_URI" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: e?.message || "Database error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  // Rate limiting para escritura
  if (writeLimiter) {
    try {
      const ip = getIP(req);
      const { success } = await writeLimiter.limit(ip);
      if (!success) {
        return NextResponse.json(
          {
            error:
              "Demasiadas peticiones de escritura. Intenta de nuevo más tarde.",
          },
          { status: 429 },
        );
      }
    } catch (error) {
      console.error("Rate limiter unavailable in /api/products POST:", error);
    }
  }

  try {
    // Verificar que el usuario esté autenticado
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "No autorizado. Token requerido." },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Token inválido o expirado." },
        { status: 401 },
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
