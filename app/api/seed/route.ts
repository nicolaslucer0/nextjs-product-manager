import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    // Verificar token de seguridad
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.SEED_SECRET || "change_me_seed_secret";

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Verificar si ya existe el admin
    const existingAdmin = await User.findOne({
      email: process.env.SEED_ADMIN_EMAIL,
    });

    if (existingAdmin) {
      return NextResponse.json({
        message: "Admin user already exists",
        email: existingAdmin.email,
      });
    }

    // Crear usuario admin
    const hashedPassword = await bcrypt.hash(
      process.env.SEED_ADMIN_PASSWORD || "admin1234",
      10
    );

    const adminUser = await User.create({
      name: "Admin",
      email: process.env.SEED_ADMIN_EMAIL || "admin@neotech.com",
      passwordHash: hashedPassword,
      role: "ADMIN",
      active: true,
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      admin: {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
