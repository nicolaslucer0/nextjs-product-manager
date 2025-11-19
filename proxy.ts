import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Esta es la función proxy que Next.js ejecutará para cada request
export function proxy(request: NextRequest) {
  // Por ahora, solo devolvemos la respuesta normal
  // El rate limiting se aplicará en las rutas API individuales
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
