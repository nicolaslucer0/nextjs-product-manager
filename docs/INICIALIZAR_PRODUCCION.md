# Inicialización de Base de Datos en Producción

## Precios de Teléfonos Usados (Plan Canje)

Si después de desplegar a producción la sección de "Cotizá tu teléfono" no muestra modelos disponibles, necesitas inicializar los datos de precios de teléfonos usados.

### Pasos para inicializar:

1. **Asegúrate de estar logueado como ADMIN** en tu sitio de producción

2. **Ejecuta el seed desde tu navegador o herramienta como Postman:**

   **Opción A: Desde el navegador (consola de desarrollador)**
   ```javascript
   fetch('/api/used-phone-prices/seed', {
     method: 'POST',
     credentials: 'include',
     headers: {
       'Content-Type': 'application/json'
     }
   })
   .then(res => res.json())
   .then(data => console.log(data));
   ```

   **Opción B: Desde curl (necesitas el token de sesión)**
   ```bash
   curl -X POST https://tu-dominio.com/api/used-phone-prices/seed \
     -H "Content-Type: application/json" \
     -H "Cookie: token=TU_TOKEN_AQUI"
   ```

3. **Verificar la respuesta**
   
   Deberías recibir una respuesta como:
   ```json
   {
     "success": true,
     "message": "Seed completado exitosamente",
     "created": 55,
     "models": ["iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", ...]
   }
   ```

4. **Verifica que los datos estén disponibles**
   
   Ve a la página del admin → "Configuración de Cotización" y deberías ver todos los modelos cargados.

### Datos incluidos en el seed:

El seed incluye precios para los siguientes modelos de iPhone:
- iPhone 15 (Pro Max, Pro, Plus, estándar)
- iPhone 14 (Pro Max, Pro, Plus, estándar)
- iPhone 13 (Pro Max, Pro, estándar)
- iPhone 12 (Pro Max, Pro, estándar)
- iPhone 11 (Pro Max, Pro, estándar)

Con múltiples opciones de almacenamiento para cada modelo.

### Precios de ejemplo:

Cada entrada tiene dos precios:
- **basePrice**: Precio para teléfonos en perfectas condiciones (sin piezas cambiadas)
- **changedPartsPrice**: Precio para teléfonos con piezas cambiadas (pantalla, batería, etc.)

### Personalización:

Después del seed inicial, puedes:
1. Modificar los precios desde el panel de admin
2. Agregar nuevos modelos manualmente
3. Desactivar modelos que ya no quieras cotizar
4. Ajustar los precios según tu mercado local

### Importante:

⚠️ El endpoint de seed **solo funcionará si no hay datos previos**. Si ya existen datos, responderá con un mensaje indicándolo y no hará cambios.

Si necesitas reiniciar los datos, deberás eliminarlos manualmente desde el panel de admin o la base de datos directamente.

### Problemas comunes:

**"No autorizado"**: Asegúrate de estar logueado como ADMIN

**"Ya existen datos"**: Ya tienes precios cargados. Revisa en el panel de admin o elimínalos si quieres hacer seed de nuevo.

**"Error al hacer seed"**: Revisa los logs del servidor para más detalles.
