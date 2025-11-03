import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SocialLinks from "@/lib/models/SocialLinks";

export async function GET() {
  try {
    await connectDB();
    let socialLinks = await SocialLinks.findOne().lean();

    // Si no existe, crear uno por defecto
    if (!socialLinks) {
      socialLinks = await SocialLinks.create({
        instagram: "https://instagram.com",
        whatsapp: "+1234567890",
        tiktok: "https://tiktok.com",
        locationAddress: "Av. Principal 123",
        locationCity: "Ciudad, País",
        locationSchedule: "Lun - Sáb: 9AM - 8PM",
        locationMap: "",
      });
    }

    return NextResponse.json(JSON.parse(JSON.stringify(socialLinks)));
  } catch (error) {
    console.error("Error fetching social links:", error);
    return NextResponse.json(
      { error: "Error al obtener los enlaces" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    let socialLinks = await SocialLinks.findOne();

    if (!socialLinks) {
      socialLinks = await SocialLinks.create(body);
    } else {
      socialLinks = await SocialLinks.findOneAndUpdate({}, body, {
        new: true,
        runValidators: true,
      });
    }

    return NextResponse.json(JSON.parse(JSON.stringify(socialLinks)));
  } catch (error) {
    console.error("Error updating social links:", error);
    return NextResponse.json(
      { error: "Error al actualizar los enlaces" },
      { status: 500 }
    );
  }
}
