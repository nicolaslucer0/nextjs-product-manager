# Rate Limiting Configuration

Este proyecto usa `@upstash/ratelimit` para proteger las APIs contra abusos y ataques.

## Configuración

### 1. Crear cuenta en Upstash (Recomendado para producción)

1. Ve a [https://upstash.com](https://upstash.com) y crea una cuenta gratuita
2. Crea una nueva base de datos Redis
3. Copia las credenciales (REST URL y REST TOKEN)
4. Agrega las variables de entorno en Vercel o tu `.env.local`:

```env
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

### 2. Modo de desarrollo (Sin Redis)

Si no configuras Upstash, el rate limiting **NO se aplicará** en desarrollo (modo in-memory deshabilitado).
Esto está bien para desarrollo local, pero **debes configurar Upstash para producción**.

## Límites configurados

### API General (Lectura)

- **Límite**: 100 requests por 10 segundos
- **Aplica a**: GET /api/products, GET /api/products/[id]
- **Uso**: Protege contra scraping excesivo

### Escritura (Crear/Actualizar/Eliminar)

- **Límite**: 20 requests por minuto
- **Aplica a**: POST/PUT/DELETE en productos
- **Uso**: Evita spam de creación/modificación de productos

### Autenticación

- **Límite**: 5 intentos por minuto
- **Aplica a**: POST /api/auth/login, POST /api/auth/register
- **Uso**: Protege contra ataques de fuerza bruta

### Uploads

- **Límite**: 10 uploads por minuto
- **Aplica a**: POST /api/upload
- **Uso**: Previene abuso del servicio de imágenes

## Respuesta cuando se alcanza el límite

Código de estado: **429 Too Many Requests**

```json
{
  "error": "Demasiadas peticiones. Intenta de nuevo más tarde."
}
```

Headers incluidos:

- `X-RateLimit-Limit`: Número máximo de requests permitidos
- `X-RateLimit-Remaining`: Requests restantes en la ventana actual
- `X-RateLimit-Reset`: Timestamp cuando se resetea el límite

## Configurar en Vercel

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Redeploy el proyecto

## Modificar límites

Edita el archivo `lib/ratelimit.ts` para ajustar los límites según tus necesidades:

```typescript
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "10 s"), // Cambia estos valores
  analytics: true,
});
```

Opciones de ventana:

- `"10 s"` - 10 segundos
- `"1 m"` - 1 minuto
- `"1 h"` - 1 hora
- `"1 d"` - 1 día

## Plan gratuito de Upstash

El plan gratuito incluye:

- 10,000 comandos por día
- 256 MB de almacenamiento
- Suficiente para la mayoría de aplicaciones pequeñas/medianas

## Monitoreo

Upstash proporciona analytics en tiempo real:

- Dashboard con métricas de uso
- Logs de rate limiting
- Alertas cuando te acercas a los límites
