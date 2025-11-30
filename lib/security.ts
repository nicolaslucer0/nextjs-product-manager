import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getIP } from "./ratelimit";
import type { Ratelimit } from "@upstash/ratelimit";

/**
 * Middleware wrapper para aplicar rate limiting a una ruta
 *
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   return withRateLimit(request, apiLimiter, async () => {
 *     // Tu lógica aquí
 *     return NextResponse.json({ data: "..." });
 *   });
 * }
 * ```
 */
export async function withRateLimit(
  request: NextRequest,
  limiter: Ratelimit | null,
  handler: () => Promise<Response>
): Promise<Response> {
  const ip = getIP(request);
  const { success, response } = await checkRateLimit(limiter, ip);

  if (!success && response) {
    return response;
  }

  try {
    return await handler();
  } catch (error) {
    console.error("Error in rate-limited handler:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Decorator para proteger múltiples métodos HTTP
 */
export function withRateLimits(limiterConfig: {
  GET?: Ratelimit | null;
  POST?: Ratelimit | null;
  PUT?: Ratelimit | null;
  DELETE?: Ratelimit | null;
  PATCH?: Ratelimit | null;
}) {
  return {
    async GET(request: NextRequest, handler: () => Promise<Response>) {
      if (!limiterConfig.GET) return handler();
      return withRateLimit(request, limiterConfig.GET, handler);
    },
    async POST(request: NextRequest, handler: () => Promise<Response>) {
      if (!limiterConfig.POST) return handler();
      return withRateLimit(request, limiterConfig.POST, handler);
    },
    async PUT(request: NextRequest, handler: () => Promise<Response>) {
      if (!limiterConfig.PUT) return handler();
      return withRateLimit(request, limiterConfig.PUT, handler);
    },
    async DELETE(request: NextRequest, handler: () => Promise<Response>) {
      if (!limiterConfig.DELETE) return handler();
      return withRateLimit(request, limiterConfig.DELETE, handler);
    },
    async PATCH(request: NextRequest, handler: () => Promise<Response>) {
      if (!limiterConfig.PATCH) return handler();
      return withRateLimit(request, limiterConfig.PATCH, handler);
    },
  };
}

/**
 * Validar tamaño del body para prevenir payloads grandes
 */
export async function validateRequestSize(
  request: NextRequest,
  maxSizeBytes: number = 10 * 1024 * 1024 // 10MB por defecto
): Promise<{ valid: boolean; error?: Response }> {
  const contentLength = request.headers.get("content-length");

  if (contentLength && Number.parseInt(contentLength) > maxSizeBytes) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: "Payload too large",
          maxSize: `${maxSizeBytes / 1024 / 1024}MB`,
        },
        { status: 413 }
      ),
    };
  }

  return { valid: true };
}

/**
 * Validar Content-Type
 */
export function validateContentType(
  request: NextRequest,
  allowedTypes: string[]
): { valid: boolean; error?: Response } {
  const contentType = request.headers.get("content-type") || "";

  const isValid = allowedTypes.some((type) =>
    contentType.toLowerCase().includes(type.toLowerCase())
  );

  if (!isValid) {
    return {
      valid: false,
      error: NextResponse.json(
        {
          error: "Invalid content type",
          allowed: allowedTypes,
          received: contentType,
        },
        { status: 415 }
      ),
    };
  }

  return { valid: true };
}

/**
 * Logger de seguridad para eventos sospechosos
 */
export function logSecurityEvent(event: {
  type: "rate_limit" | "invalid_auth" | "suspicious_request" | "blocked_ip";
  ip: string;
  endpoint: string;
  details?: string;
}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    ...event,
  };

  // En producción, podrías enviar esto a un servicio como Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === "production") {
    console.warn("[SECURITY]", JSON.stringify(logEntry));
  } else {
    console.log("[SECURITY]", logEntry);
  }

  // Opcional: Descomentar para enviar a servicio de analytics/monitoring
  // if (process.env.SECURITY_WEBHOOK_URL) {
  //   await fetch(process.env.SECURITY_WEBHOOK_URL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(logEntry)
  //   }).catch(err => console.error('Failed to send security log:', err));
  // }
}
