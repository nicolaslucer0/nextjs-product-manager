# Configuración de Alertas en Vercel

## Cómo configurar alertas para evitar sorpresas de costos

### 1. Alertas de Uso (Usage Alerts)

Ve a tu proyecto en Vercel > **Settings** > **Usage**

#### Configurar alertas para:

**a) Function Executions**

- Límite recomendado: 80% del plan (ej: 80,000 para 100K del Hobby)
- Email: Tu correo principal

**b) Bandwidth**

- Límite recomendado: 80GB (80% de 100GB free)
- Email: Tu correo principal

**c) Build Minutes**

- Límite recomendado: 80 minutos (80% de 100min free)

### 2. Integración con Email

Vercel te enviará correos cuando:

- ✅ Se alcance el 80% del límite configurado
- ✅ Se alcance el 100% del límite
- ✅ Haya un error 500 en producción
- ✅ Un deployment falle

### 3. Monitoreo Manual Recomendado

**Frecuencia**: Revisar cada semana

1. **Vercel Dashboard**:

   - Functions ejecutadas
   - Bandwidth consumido
   - Errores en logs

2. **Upstash Dashboard** (https://console.upstash.com):
   - Comandos diarios usados
   - Gráfico de uso por hora
3. **MongoDB Atlas** (https://cloud.mongodb.com):
   - Conexiones activas
   - Storage usado
   - Operaciones/segundo

### 4. Script de Monitoreo (Opcional)

Puedes crear un endpoint para verificar el estado:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    // Aquí podrías agregar métricas custom
  });
}
```

Y usar un servicio como UptimeRobot (gratis) para:

- Monitorear disponibilidad cada 5 minutos
- Enviar alertas si el sitio cae
- Dashboard de uptime

### 5. Límites de Emergencia

Si detectas un ataque o uso anormal:

**Opción 1: Reducir límites temporalmente**

```bash
# Editar lib/ratelimit.ts
limiter: Ratelimit.slidingWindow(5, "1 m"), // Muy restrictivo
```

**Opción 2: Pausar deployment**

```bash
vercel --prod --pause
```

**Opción 3: Activar "Deployment Protection"**
En Vercel > Settings > Deployment Protection

- Requiere autenticación para acceder al sitio

### 6. Presupuesto Mensual Sugerido

Para estar tranquilo con todos los servicios:

| Servicio                 | Plan    | Costo Mensual |
| ------------------------ | ------- | ------------- |
| Vercel                   | Hobby   | $0            |
| Upstash Redis            | Free    | $0            |
| MongoDB Atlas            | M0 Free | $0            |
| Cloudinary               | Free    | $0            |
| **Total Mensual**        |         | **$0**        |
| **Buffer por seguridad** |         | **+$5**       |
| **Total con buffer**     |         | **~$5/mes**   |

Con las protecciones implementadas, es **muy improbable** que superes los planes gratuitos.

### 7. Cuando Considerar Upgrade

Considera pagar un plan si:

- ✅ Tienes más de 10,000 usuarios/mes consistentes
- ✅ Superas 100GB bandwidth/mes regularmente
- ✅ Necesitas más de 100,000 function executions/mes
- ✅ Quieres soporte prioritario

**Vercel Pro**: $20/mes - Para aplicaciones de producción serias
**Upstash Pay-as-you-go**: Solo pagas lo que usas después del free tier

### 8. Contactos de Soporte

**Vercel**:

- Email: support@vercel.com
- Discord: https://vercel.com/discord
- Docs: https://vercel.com/docs

**Upstash**:

- Discord: https://upstash.com/discord
- Email: support@upstash.com

**MongoDB**:

- Support: https://www.mongodb.com/support
- Community: https://www.mongodb.com/community/forums/

---

## ✅ Checklist Final

- [ ] Configurar alertas de uso en Vercel Dashboard
- [ ] Agregar email de notificaciones
- [ ] Revisar uso semanal en dashboards
- [ ] Configurar UptimeRobot o similar (opcional)
- [ ] Documentar presupuesto mensual
- [ ] Guardar contactos de soporte
