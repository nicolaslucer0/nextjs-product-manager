import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Configuración de seguridad
const BLOCKED_USER_AGENTS = [
  "bot",
  "crawler",
  "spider",
  "scraper",
  "curl",
  "wget",
  "python-requests",
  "axios",
  "go-http-client",
];

const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB

// Esta es la función proxy que Next.js ejecutará para cada request
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Verificar tamaño de request para endpoints de API
  if (pathname.startsWith("/api/")) {
    const contentLength = request.headers.get("content-length");
    if (contentLength && Number.parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        { error: "Request too large" },
        {
          status: 413,
          headers: {
            "Content-Type": "application/json",
            "X-Request-Rejected": "payload-too-large",
          },
        }
      );
    }
  }

  // 2. Bloquear user agents sospechosos en producción
  if (process.env.NODE_ENV === "production") {
    const userAgent = request.headers.get("user-agent")?.toLowerCase() || "";
    const isSuspicious = BLOCKED_USER_AGENTS.some((agent) =>
      userAgent.includes(agent)
    );

    if (isSuspicious && pathname.startsWith("/api/")) {
      console.warn(
        `Blocked suspicious user agent: ${userAgent} accessing ${pathname}`
      );
      return NextResponse.json(
        { error: "Access denied" },
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            "X-Request-Rejected": "suspicious-user-agent",
          },
        }
      );
    }
  }

  // 3. Protección contra path traversal
  if (pathname.includes("..") || pathname.includes("%2e%2e")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  // 4. Agregar headers de seguridad
  const response = NextResponse.next();

  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // El rate limiting se aplicará en las rutas API individuales
  return response;
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
    String.raw`/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)`,
  ],
};
