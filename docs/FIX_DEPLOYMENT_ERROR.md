# Fix: Invalid Segment Configuration Export Error

## Problema

Al intentar deployar en Vercel con Next.js 16 + Turbopack, el build fallaba con el error:

```
⨯ Invalid segment configuration export detected. This can cause unexpected behavior from the configs not being applied. You should see the relevant failures in the logs above. Please fix them to continue.
```

## Causa Raíz

El problema estaba en el archivo `proxy.ts` (middleware de seguridad). El `export const config` tenía un formato que Next.js 16 con Turbopack no podía parsear correctamente:

### ❌ Formato Problemático

```typescript
export const config = {
  matcher: [
    String.raw`/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)`,
  ],
};
```

**Problemas:**

- Uso de `String.raw` dentro del array
- Array con un solo elemento
- Next.js 16 requiere que los exports de configuración sean parseables estáticamente

## Solución

### ✅ Formato Correcto

```typescript
export const config = {
  matcher:
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
};
```

**Mejoras:**

- String literal simple (sin `String.raw`)
- Sin array innecesario
- Escapado correcto de backslashes (`\\.` en lugar de `\.`)
- Parseable estáticamente por Turbopack

## Cambios Adicionales Aplicados

### Route Segment Config Exports

Se agregaron correctamente los exports de configuración en las rutas que lo necesitan:

1. **app/api/upload/route.ts**

   ```typescript
   export const maxDuration = 30; // 30 segundos para uploads
   ```

2. **app/api/products/import/route.ts**

   ```typescript
   export const maxDuration = 60; // 60 segundos para imports
   ```

3. **app/api/products/import-stream/route.ts**

   ```typescript
   export const maxDuration = 300; // 5 minutos para streaming imports
   ```

4. **app/page.tsx**
   ```typescript
   export const revalidate = 10; // Revalidar productos destacados cada 10s
   ```

### vercel.json

Se eliminó la sección `rewrites` que era innecesaria:

```json
{
  "headers": [
    /* ... */
  ]
}
```

## Problema Adicional: Archivo middleware.ts Duplicado

### Error
```
Error: Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected. Please use "./proxy.ts" only.
```

### Causa
Next.js 16 migró de `middleware.ts` a `proxy.ts`. Si ambos archivos existen, el build falla.

### Solución
Eliminar el archivo `middleware.ts`:

```bash
rm middleware.ts
git add -A
git commit -m "fix: Eliminar middleware.ts duplicado"
```

## Verificación

Para verificar que el build funciona correctamente:

```bash
pnpm build
```

El output debe mostrar:

```
✓ Compiled successfully
✓ Generating static pages
Route (app)                      Revalidate  Expire
┌ ○ /                                   10s      1y
├ ƒ /api/upload
├ ƒ /api/products/import
├ ƒ /api/products/import-stream
└ ...
```

## Lecciones Aprendidas

1. **Next.js 16 + Turbopack es estricto**: Requiere que los exports de configuración sean literales estáticos
2. **String.raw no es compatible**: Use strings simples con escapes normales
3. **Simplicidad**: Si un valor es único, no use array
4. **Debugging**: El error "see failures above" puede ser engañoso - no siempre hay mensajes previos específicos
5. **Migración middleware → proxy**: Next.js 16 depreca `middleware.ts` en favor de `proxy.ts`, no pueden coexistir
6. **Verificar archivos duplicados**: Siempre revisar que no existan ambos archivos antes de deployment

## Referencias

- [Next.js Route Segment Config](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config)
- [Next.js 16 Proxy Convention](https://nextjs.org/docs/messages/middleware-to-proxy)
- [Vercel Deployment](https://vercel.com/docs/deployments)
