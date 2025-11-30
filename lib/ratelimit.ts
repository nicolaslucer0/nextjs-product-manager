import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Crear instancia de Redis
// Si no tienes Upstash Redis configurado, usará in-memory (solo para desarrollo)
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    })
  : undefined;

// Rate limiter para APIs generales (lectura)
// 100 requests por 10 segundos
export const apiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "10 s"),
      analytics: true,
      prefix: "@upstash/ratelimit:api",
    })
  : null;

// Rate limiter estricto para operaciones de escritura (crear, actualizar, eliminar)
// 20 requests por minuto
export const writeLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit:write",
    })
  : null;

// Rate limiter para autenticación
// 5 intentos por minuto
export const authLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit:auth",
    })
  : null;

// Rate limiter para uploads
// 10 uploads por minuto
export const uploadLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit:upload",
    })
  : null;

// Función helper para obtener IP del cliente
export function getIP(request: Request): string {
  // En Vercel, usar x-real-ip o x-forwarded-for
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  const xff = request.headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0].trim() : "127.0.0.1";
}

// Función para verificar rate limit y devolver respuesta con headers
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ success: boolean; response?: Response }> {
  if (!limiter) return { success: true };

  const { success, limit, remaining, reset } = await limiter.limit(identifier);

  if (!success) {
    const headers = new Headers({
      "Content-Type": "application/json",
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
      "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
    });

    return {
      success: false,
      response: new Response(
        JSON.stringify({
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers,
        }
      ),
    };
  }

  return { success: true };
}
