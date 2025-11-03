# Estructura de Imágenes Estáticas

Esta carpeta contiene las imágenes estáticas del sitio web.

## 📁 Estructura

```
public/
  images/
    logo/           ← Logos de la empresa (PNG, SVG)
      logo.svg
      logo-white.svg
      logo-dark.svg
      favicon.ico

    landing/        ← Imágenes de la landing page
      hero-bg.jpg
      feature-1.jpg
      feature-2.jpg
      about-us.jpg

    uploads/        ← Imágenes de productos (subidas por usuarios)
      [timestamp]-[random].[ext]
```

## 🎯 Uso

### Logo

Coloca aquí los logos en diferentes variantes:

- `logo.svg` - Logo principal (SVG recomendado)
- `logo-white.svg` - Logo en blanco (para fondos oscuros)
- `logo-dark.svg` - Logo oscuro (para fondos claros)
- `favicon.ico` - Favicon del sitio

**Uso en código:**

```tsx
<img src="/images/logo/logo.svg" alt="Logo" />
```

### Landing

Imágenes para secciones de la landing:

- Hero/Banner principal
- Features/Características
- About us/Acerca de
- Testimonios
- Footer

**Uso en código:**

```tsx
<img src="/images/landing/hero-bg.jpg" alt="Hero" />
```

### Uploads (Productos)

⚠️ No colocar archivos manualmente aquí.
Esta carpeta es para imágenes subidas por usuarios desde el dashboard.

## 💡 Recomendaciones

1. **Formatos:**

   - Logo: SVG (escalable, tamaño pequeño)
   - Fotos: JPG (mejor compresión)
   - Gráficos: PNG (transparencia)
   - Iconos: SVG

2. **Optimización:**

   - Comprime las imágenes antes de subirlas
   - Usa herramientas como TinyPNG o ImageOptim
   - Tamaño recomendado: < 500KB por imagen

3. **Nombres:**
   - Usa nombres descriptivos en inglés
   - Sin espacios (usa guiones)
   - Minúsculas
   - Ejemplo: `hero-background.jpg`, `logo-white.svg`
