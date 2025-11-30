# ✅ Checklist de Deployment Seguro

## Antes de hacer deploy a Vercel

### 1. Variables de Entorno

Asegúrate de configurar en Vercel > Settings > Environment Variables:

#### Requeridas:

- [ ] `MONGODB_URI` - URL de MongoDB Atlas (NO usar localhost)
- [ ] `JWT_SECRET` - String aleatorio de 32+ caracteres
- [ ] `UPSTASH_REDIS_REST_URL` - URL de Upstash Redis
- [ ] `UPSTASH_REDIS_REST_TOKEN` - Token de Upstash Redis
- [ ] `CLOUDINARY_CLOUD_NAME` - Nombre del cloud de Cloudinary
- [ ] `CLOUDINARY_API_KEY` - API Key de Cloudinary
- [ ] `CLOUDINARY_API_SECRET` - API Secret de Cloudinary

#### Opcionales:

- [ ] `SEED_ADMIN_EMAIL` - Email del admin inicial
- [ ] `SEED_ADMIN_PASSWORD` - Password del admin inicial

### 2. Seguridad de MongoDB Atlas

- [ ] IP Whitelist configurado (agregar 0.0.0.0/0 para Vercel)
- [ ] Usuario de BD con permisos mínimos necesarios
- [ ] TLS/SSL habilitado
- [ ] Backups automáticos activados

### 3. Seguridad de Cloudinary

En Cloudinary Dashboard > Settings:

- [ ] **Upload Presets**: Crear preset con:

  - Modo: `unsigned` o `signed` (recomendado: signed)
  - Carpeta: `product-manager`
  - Max file size: 10MB
  - Allowed formats: jpg, png, jpeg, gif, webp

- [ ] **Security**:
  - Activar "Strict Transformations"
  - Configurar "Allowed fetch domains"
  - Rate limiting en uploads

### 4. Configuración de Upstash Redis

- [ ] Plan Free activado (10K comandos/día)
- [ ] TLS habilitado
- [ ] Región cercana a tu deployment (ej: us-east-1)

### 5. Vercel Settings

- [ ] **General**:
  - Node Version: 22.x
  - Build Command: `pnpm build`
  - Output Directory: `.next`
- [ ] **Functions**:
  - Region: Cercana a tu base de datos
- [ ] **Deployment Protection** (opcional):

  - Activar para staging
  - Password protect para demos

- [ ] **Git Integration**:
  - Auto-deploy en `main` branch
  - Preview deployments en PRs

### 6. Alertas y Monitoreo

- [ ] Configurar alertas de uso en Vercel:

  - Function Executions: 80% del límite
  - Bandwidth: 80GB
  - Build Minutes: 80min

- [ ] Configurar notificaciones por email

- [ ] (Opcional) UptimeRobot o similar para monitoring

### 7. Testing Pre-Deploy

```bash
# Verificar build local
pnpm build

# Verificar rate limiting
curl -X GET http://localhost:3000/api/products

# Verificar autenticación
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin1234"}'
```

### 8. Post-Deploy

- [ ] Verificar que el sitio carga correctamente
- [ ] Probar login/registro
- [ ] Probar creación de producto
- [ ] Probar upload de imágenes
- [ ] Verificar rate limiting (hacer muchas requests)
- [ ] Revisar logs en Vercel Dashboard
- [ ] Verificar métricas en Upstash Dashboard

### 9. Optimizaciones de Costos

- [ ] Revisar que `vercel.json` tenga límites correctos
- [ ] Confirmar rate limiting activo
- [ ] Verificar que imágenes usen Cloudinary (no Vercel)
- [ ] Confirmar que uploads grandes están bloqueados

### 10. Documentación

- [ ] README.md actualizado con URL de producción
- [ ] Variables de entorno documentadas
- [ ] Credenciales de admin seguras (cambiar defaults)

---

## 🚀 Comando de Deploy

```bash
# Verificar que todo está bien
pnpm build

# Deploy a producción
vercel --prod

# O via Git
git push origin main  # Auto-deploy si está configurado
```

---

## 🔐 Seguridad Post-Deploy

### Cambiar credenciales por defecto:

1. **Admin User**:

   - Login con: admin@example.com / admin1234
   - Ir a perfil y cambiar password
   - (Opcional) Cambiar email

2. **JWT Secret**:

   - Usar un generador seguro:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   - Actualizar en Vercel Environment Variables

3. **Cloudinary**:
   - Rotar API keys si fueron expuestas
   - Revisar logs de uso

---

## 📊 Primeras 24 horas

Monitorear:

- [ ] Errores en Vercel Logs
- [ ] Uso de functions (debería ser bajo si no hay tráfico)
- [ ] Bandwidth usado
- [ ] Comandos Redis en Upstash
- [ ] Conexiones MongoDB en Atlas
- [ ] Storage usado en Cloudinary

---

## 🆘 Troubleshooting

### Error: "Rate limit exceeded"

- ✅ Normal si estás testeando mucho
- Espera 10-60 segundos y reintenta

### Error: "MongoDB connection failed"

- Verificar IP Whitelist en Atlas
- Verificar MONGODB_URI correcto
- Verificar usuario/password

### Error: "Cloudinary upload failed"

- Verificar API credentials
- Verificar límites de upload
- Revisar formato de archivo

### Sitio muy lento

- Verificar región de Functions en Vercel
- Verificar latencia a MongoDB
- Considerar CDN adicional (Cloudflare)

---

## 📈 Escalamiento

Si tu app crece y necesitas mejorar:

### Tráfico Moderado (1K-10K usuarios/mes):

- ✅ Los planes FREE deberían ser suficientes
- Monitorear uso semanal
- Considerar Vercel Pro si superas límites

### Tráfico Alto (10K+ usuarios/mes):

- Upgrade a Vercel Pro ($20/mes)
- Considerar MongoDB Atlas M10 ($0.08/hora)
- Cloudinary Pro ($99/mes) o ajustar transformaciones
- Implementar CDN adicional

---

## ✅ Deploy Completado

Una vez completado este checklist:

- 🟢 Tu app está **protegida** contra ataques comunes
- 🟢 Los **costos están controlados** (< $1 en ataques)
- 🟢 Tienes **monitoreo** configurado
- 🟢 La app es **escalable** cuando sea necesario

**¡Felicidades! 🎉**
