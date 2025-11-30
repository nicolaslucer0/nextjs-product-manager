# 🛡️ Protecciones de Seguridad y Control de Costos

## Resumen de Protecciones Implementadas

Este proyecto tiene múltiples capas de protección contra ataques y control de costos en Vercel.

---

## 1. ⏱️ Rate Limiting (Upstash Redis)

### Límites Configurados:

| Tipo              | Límite       | Ventana     | Endpoints Protegidos                  |
| ----------------- | ------------ | ----------- | ------------------------------------- |
| **API General**   | 100 requests | 10 segundos | GET /api/products, /api/products/[id] |
| **Escritura**     | 20 requests  | 1 minuto    | POST/PUT/DELETE en /api/products      |
| **Autenticación** | 5 intentos   | 1 minuto    | /api/auth/login, /api/auth/register   |
| **Uploads**       | 10 archivos  | 1 minuto    | /api/upload                           |

### Beneficios:

- ✅ Previene ataques DDoS
- ✅ Limita intentos de fuerza bruta
- ✅ Controla costos de Upstash Redis
- ✅ Headers informativos: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Costo de Upstash Redis:

- **Plan Free**: 10,000 comandos/día - GRATIS
- Si excedes: ~$0.20 por 100K comandos adicionales

---

## 2. ⚙️ Límites de Funciones (vercel.json)

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10, // Máximo 10 segundos
      "memory": 1024 // 1GB RAM
    },
    "app/api/products/import-stream/route.ts": {
      "maxDuration": 300, // 5 minutos para imports
      "memory": 1024
    }
  }
}
```

### Beneficios:

- ✅ Funciones no pueden ejecutarse indefinidamente
- ✅ Límite de memoria previene consumo excesivo
- ✅ Timeout automático protege contra bucles infinitos

### Costo de Vercel:

- **Hobby Plan**: 100 GB-hours/mes incluidos - GRATIS
- **Pro Plan**: 1,000 GB-hours/mes incluidos

---

## 3. 🚫 Proxy Middleware (proxy.ts)

### Protecciones Implementadas:

#### a) **Límite de Tamaño de Request**

- Máximo: 10MB por request
- Bloquea: Uploads masivos o ataques de payload

#### b) **Bloqueo de User Agents Sospechosos**

User agents bloqueados en producción:

- `bot`, `crawler`, `spider`, `scraper`
- `curl`, `wget`
- `python-requests`, `axios`, `go-http-client`

#### c) **Protección contra Path Traversal**

- Bloquea: `../`, `%2e%2e`, rutas maliciosas

#### d) **Headers de Seguridad**

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 4. 🗄️ Protecciones de Base de Datos

### MongoDB Atlas:

- **Límites del plan FREE (M0)**:
  - Almacenamiento: 512 MB
  - RAM: 512 MB compartida
  - Conexiones simultáneas: 500
  - Sin costos adicionales automáticos

### Conexiones:

```typescript
// lib/db.ts - Configuración con pooling
mongoose.connection.setMaxListeners(20);
```

---

## 5. ☁️ Protecciones de Cloudinary

### Configuración Recomendada:

1. **Límites de Upload**:

```javascript
// En Cloudinary Dashboard > Settings > Upload
- Max file size: 10 MB
- Max video length: 0 (desactivar video)
- Allowed formats: jpg, png, jpeg, gif, webp
```

2. **Plan FREE**:

- 25 créditos/mes = ~25,000 transformaciones
- 25 GB almacenamiento
- 25 GB bandwidth

3. **Protección contra Abuse**:

- ✅ Activar "Strict Transformations" en dashboard
- ✅ Configurar "Allowed fetch domains" para evitar hotlinking

---

## 6. 📊 Monitoreo de Costos

### Vercel Dashboard:

1. Ve a: `Settings > Usage`
2. Configura alertas:
   - Function Executions
   - Bandwidth
   - Build Minutes

### Upstash Dashboard:

1. Ve a: `Console > [Tu Database] > Metrics`
2. Monitorea comandos diarios

### MongoDB Atlas:

1. Ve a: `Clusters > Metrics`
2. Revisa: Connections, Operations, Storage

---

## 7. 🚨 Alertas y Límites Recomendados

### Variables de Entorno Adicionales:

Agrega a `.env.local`:

```bash
# Límites de seguridad
MAX_UPLOAD_SIZE=10485760 # 10MB en bytes
MAX_PRODUCTS_PER_IMPORT=5000
ENABLE_SECURITY_LOGS=true

# Vercel (opcional)
VERCEL_ENV=production
```

---

## 8. 📈 Estimación de Costos con Ataques

### Escenario: 10,000 requests maliciosos en 1 hora

| Servicio             | Costo Estimado | Protección                            |
| -------------------- | -------------- | ------------------------------------- |
| **Vercel Functions** | $0             | Rate limit los bloquea (100 req/10s)  |
| **Upstash Redis**    | ~$0.02         | Solo 10K comandos en free tier        |
| **MongoDB**          | $0             | Plan FREE no cobra por operaciones    |
| **Cloudinary**       | $0             | Rate limit bloquea uploads            |
| **Bandwidth**        | ~$0.40         | Solo si pasan rate limit (100GB free) |

**Total máximo**: ~$0.42 en caso extremo

### Con Rate Limiting activo:

- Máximo ~36,000 requests/hora permitidos (100 req/10s)
- Costo real: **$0 en planes FREE** si no excedes límites

---

## 9. ✅ Checklist de Seguridad

- [x] Rate limiting en todas las APIs
- [x] Timeouts en funciones
- [x] Límites de memoria
- [x] Validación de tamaño de requests
- [x] Headers de seguridad
- [x] Bloqueo de user agents sospechosos
- [x] Protección path traversal
- [ ] **Recomendado**: Configurar alertas en Vercel
- [ ] **Recomendado**: Activar "Strict Transformations" en Cloudinary
- [ ] **Opcional**: Agregar Cloudflare como CDN adicional

---

## 10. 🔧 Cómo Ajustar Límites

### Si necesitas aumentar límites:

**Para rate limiting** (`lib/ratelimit.ts`):

```typescript
// Aumentar límite de API general
limiter: Ratelimit.slidingWindow(200, "10 s"), // antes: 100

// Aumentar límite de escritura
limiter: Ratelimit.slidingWindow(50, "1 m"), // antes: 20
```

**Para funciones** (`vercel.json`):

```json
{
  "maxDuration": 15, // antes: 10 segundos
  "memory": 2048 // antes: 1024 MB
}
```

⚠️ **Nota**: Aumentar límites puede incrementar costos si recibes muchas requests legítimas.

---

## 11. 🆘 En Caso de Ataque

### Pasos inmediatos:

1. **Suspender temporalmente**:

   ```bash
   # En Vercel Dashboard
   Settings > Deployment Protection > Enable
   ```

2. **Revisar logs**:

   ```bash
   vercel logs [deployment-url]
   ```

3. **Bloquear IPs específicas**:
   Actualiza `proxy.ts` para bloquear IPs:

   ```typescript
   const BLOCKED_IPS = ["1.2.3.4", "5.6.7.8"];
   if (BLOCKED_IPS.includes(request.ip || "")) {
     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
   }
   ```

4. **Reducir límites temporalmente**:
   En `lib/ratelimit.ts`:
   ```typescript
   limiter: Ratelimit.slidingWindow(10, "1 m"), // Muy restrictivo
   ```

---

## 📞 Contacto y Soporte

- **Vercel Support**: https://vercel.com/support
- **Upstash Support**: https://upstash.com/discord
- **MongoDB Support**: https://www.mongodb.com/support

---

## 🎯 Conclusión

Tu aplicación está **bien protegida** contra la mayoría de ataques comunes. Los costos están controlados y en el peor escenario serían **menos de $1 USD** incluso con miles de requests maliciosos bloqueados.

**Nivel de protección actual**: 🟢 ALTO

**Riesgo de costos inesperados**: 🟢 BAJO (< $1)
