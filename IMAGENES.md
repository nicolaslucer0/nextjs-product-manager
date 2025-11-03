# Sistema de Carga de Imágenes

## Características

- ✅ Carga local de imágenes en el servidor
- ✅ Almacenamiento en `/public/uploads`
- ✅ Drag & Drop (arrastra y suelta)
- ✅ Validación de tipo (solo imágenes)
- ✅ Validación de tamaño (máx. 5MB)
- ✅ Múltiples imágenes por producto (hasta 5)
- ✅ Imagen por variante (opcional)
- ✅ Vista previa antes de guardar
- ✅ Eliminación de imágenes

## Uso

### En ProductForm

1. **Imágenes del Producto**: Puedes subir hasta 5 imágenes
2. **Imágenes de Variantes**: Cada variante puede tener 1 imagen

### Formatos Soportados

- JPEG / JPG
- PNG
- WebP
- GIF

### Tamaño Máximo

- 5MB por imagen

## API Endpoint

**POST** `/api/upload`

### Request

- Content-Type: `multipart/form-data`
- Body: `file` (File)

### Response

```json
{
  "success": true,
  "url": "/uploads/1234567890-abc123.jpg",
  "filename": "1234567890-abc123.jpg"
}
```

### Errores

```json
{
  "error": "Mensaje de error"
}
```

## Estructura de Archivos

```
public/
  uploads/
    .gitignore          # Ignora las imágenes en git
    [timestamp]-[random].[ext]  # Imágenes subidas
```

## Notas Importantes

- Las imágenes se guardan con nombres únicos: `timestamp-random.extension`
- Las imágenes NO se suben a git (ver `.gitignore`)
- Para producción, considera usar un CDN como Cloudinary o AWS S3
- El directorio `/public/uploads` se crea automáticamente si no existe
