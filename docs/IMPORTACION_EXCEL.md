# Guía de Importación de Productos desde Excel

## Formato del Archivo

El sistema acepta archivos en los siguientes formatos:

- CSV (.csv)
- Excel (.xlsx, .xls)

## Estructura Requerida

El archivo debe tener las siguientes columnas:

| Columna            | Requerido | Descripción                      | Ejemplo                               |
| ------------------ | --------- | -------------------------------- | ------------------------------------- |
| Id                 | ✅ Sí     | Identificador único del producto | PROD001, SKU-123, etc.                |
| Nombre             | ✅ Sí     | Nombre del producto              | iPhone 15 Pro                         |
| Tipo de Producto   | ❌ No     | Categoría del producto           | Electrónica, Accesorios               |
| Proveedor          | ❌ No     | Nombre del proveedor             | Apple, Samsung                        |
| Código             | ❌ No     | Código alternativo/SKU           | IP15PRO, MBA2023                      |
| Stock              | ❌ No     | Cantidad disponible              | 50                                    |
| Precio de Venta    | ❌ No     | Precio en formato decimal        | 999.99                                |
| Descripción        | ❌ No     | Descripción detallada            | Smartphone Apple de última generación |
| Activo             | ❌ No     | Estado del producto              | SI, NO                                |
| Mostrar en Ventas  | ❌ No     | Visibilidad en ventas            | SI, NO                                |
| Mostrar en Compras | ❌ No     | Visibilidad en compras           | SI, NO                                |
| Imagen             | ❌ No     | URL de la imagen                 | https://example.com/imagen.jpg        |

## Ejemplo de Archivo CSV

```csv
Id	Nombre	Tipo de Producto	Proveedor	Código	Stock	Precio de Venta	Descripción	Activo	Mostrar en Ventas	Mostrar en Compras	Imagen
PROD001	iPhone 15 Pro	Electrónica	Apple	IP15PRO	50	999.99	Smartphone Apple de última generación con chip A17 Pro	SI	SI	NO	https://example.com/iphone.jpg
PROD002	MacBook Air M2	Electrónica	Apple	MBA2023	30	1199.99	Laptop ultraligera con chip M2	SI	SI	NO	https://example.com/macbook.jpg
PROD003	AirPods Pro	Accesorios	Apple	APP2023	100	249.99	Auriculares inalámbricos con cancelación de ruido	SI	SI	NO	https://example.com/airpods.jpg
PROD004	iPad Pro 12.9	Electrónica	Apple	IPD129	25	1099.99	Tablet profesional con chip M2	SI	SI	NO	https://example.com/ipad.jpg
PROD005	Apple Watch Series 9	Wearables	Apple	AWS9	75	399.99	Smartwatch con GPS y monitoreo de salud	SI	SI	NO	https://example.com/watch.jpg
```

## Comportamiento de la Importación

### Productos Nuevos

Si el ID del producto **no existe** en la base de datos:

- Se creará un nuevo producto con toda la información proporcionada
- El campo `externalId` se guardará con el ID del Excel

### Productos Existentes

Si el ID del producto **ya existe** en la base de datos:

- Se **actualizará** el producto con la nueva información
- Se modificarán: Título, Descripción, Precio y Stock
- Las imágenes y variantes existentes se mantendrán

## Separadores Permitidos

El sistema detecta automáticamente los siguientes separadores:

- Coma (`,`)
- Punto y coma (`;`)
- Tabulación (`\t`)

## Notas Importantes

1. **Id Único**: Cada producto debe tener un ID único. Si hay IDs duplicados en el archivo, solo se procesará el primero.

2. **Formato de Números**:

   - Precio de Venta: Use punto (`.`) como separador decimal
   - Stock: Debe ser un número entero

3. **Columnas Opcionales**: Si no incluyes alguna columna opcional, el producto se creará con valores por defecto:

   - Stock: 0
   - Precio de Venta: 0
   - Descripción: vacío
   - Imagen: sin imagen

4. **Caracteres Especiales**: Evite usar el separador (coma, punto y coma, tabulación) en los textos. Si es necesario, use comillas:

   ```csv
   PROD001,"iPhone 15 Pro (256GB, Azul)","Descripción con, comas",999.99,50
   ```

5. **Separadores**: El sistema detecta automáticamente comas (,), punto y coma (;) o tabulaciones ( ). Se recomienda usar tabulaciones para archivos Excel.

6. **Errores**: Si una línea tiene errores, se reportará pero el proceso continuará con las demás líneas.

7. **Plantilla**: Puede descargar una plantilla de ejemplo desde el botón "📥 Descargar plantilla de ejemplo" en la interfaz.

## Proceso de Importación

1. Vaya a Admin → 📥 Importar Excel
2. Haga clic en "📥 Descargar plantilla de ejemplo" si necesita un formato base
3. Complete su archivo con los datos de productos
4. Seleccione el archivo usando el botón "Seleccionar archivo"
5. Haga clic en "📤 Importar"
6. Revise el resultado que mostrará:
   - Total de productos procesados
   - Productos nuevos creados
   - Productos actualizados
   - Advertencias o errores (si los hay)

## Solución de Problemas

### Error: "Faltan columnas requeridas"

**Solución**: Asegúrese de que su archivo tenga las columnas obligatorias: **Id** y **Nombre**

### Error: "Línea X: Falta ID o Nombre"

**Solución**: Revise que todas las filas tengan valores en las columnas Id y Nombre

### Error: "El archivo debe ser Excel o CSV"

**Solución**: Asegúrese de subir un archivo con extensión .csv, .xlsx o .xls

### Productos no se actualizan

**Solución**: Verifique que el Id en el Excel coincida exactamente con el producto existente

### Problemas con caracteres especiales (tildes, ñ)

**Solución**: Asegúrese de que el archivo esté codificado en UTF-8. En Excel, al guardar como CSV, seleccione "CSV UTF-8 (delimitado por comas)"
