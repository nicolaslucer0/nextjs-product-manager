import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return secret;
}

export type TokenPayload = { id: string; role: "ADMIN" | "USER" };

export function signToken(
  payload: TokenPayload,
  expiresIn: string = "1d",
): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, getJwtSecret(), { expiresIn } as any);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}
