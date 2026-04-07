import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SiteConfig from "@/lib/models/SiteConfig";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    let config = await SiteConfig.findOne().lean();
    if (!config) {
      const created = await SiteConfig.create({ dollarRate: 0, paymentMessage: "", shippingMessage: "" });
      config = created.toObject();
    }
    // Garantizar que campos nuevos siempre existan (docs creados antes de agregarlos)
    const response = {
      ...config,
      paymentMessage: (config as any).paymentMessage ?? "",
      shippingMessage: (config as any).shippingMessage ?? "",
    };
    return NextResponse.json(response, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
    });
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
    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (body.dollarRate != null) {
      if (body.dollarRate < 0) {
        return NextResponse.json({ error: "Valor de dólar inválido" }, { status: 400 });
      }
      update.dollarRate = body.dollarRate;
    }

    if (body.paymentMessage != null) {
      update.paymentMessage = body.paymentMessage;
    }

    if (body.shippingMessage != null) {
      update.shippingMessage = body.shippingMessage;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 });
    }

    const config = await SiteConfig.findOneAndUpdate(
      {},
      { $set: update },
      { upsert: true, new: true },
    );

    return NextResponse.json(config);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
