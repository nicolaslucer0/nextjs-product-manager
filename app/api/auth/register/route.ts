import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { authLimiter, getIP } from "@/lib/ratelimit";

export async function POST(req: Request) {
  // Rate limiting
  if (authLimiter) {
    try {
      const ip = getIP(req);
      const { success, limit, remaining, reset } = await authLimiter.limit(ip);

      if (!success) {
        return NextResponse.json(
          {
            error:
              "Demasiados intentos de registro. Intenta de nuevo más tarde.",
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": new Date(reset).toISOString(),
            },
          },
        );
      }
    } catch (error) {
      console.error("Rate limiter unavailable in /api/auth/register:", error);
    }
  }

  try {
    await connectDB();
    const { name, email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 },
      );

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing)
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
    });
    return NextResponse.json({ id: user._id, email: user.email });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
