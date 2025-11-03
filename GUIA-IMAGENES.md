# Guía: Cómo usar imágenes del logo y landing

## 📍 Ubicación de las carpetas

```
public/
  ├── images/
  │   ├── logo/          ← Coloca tus logos aquí
  │   │   ├── logo.svg
  │   │   ├── logo-white.svg
  │   │   └── favicon.ico
  │   │
  │   └── landing/       ← Coloca imágenes de la landing aquí
  │       ├── hero-bg.jpg
  │       ├── feature-1.jpg
  │       └── about-us.jpg
  │
  └── uploads/           ← NO tocar (para productos)
```

---

## 🎯 Ejemplo 1: Agregar logo al Navbar

### Paso 1: Sube tu logo

Coloca tu archivo `logo.svg` o `logo.png` en:

```
/public/images/logo/logo.svg
```

### Paso 2: Actualiza el Navbar

Reemplaza el texto "NeoTech" por una imagen:

```tsx
// components/Navbar.tsx

<Link
  href="/"
  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
>
  <img src="/images/logo/logo.svg" alt="NeoTech" className="h-8 w-auto" />
</Link>
```

O si tienes logo de texto + icono:

```tsx
<Link href="/" className="flex items-center gap-2">
  <img src="/images/logo/icon.svg" alt="NeoTech Icon" className="h-8 w-8" />
  <span className="text-2xl font-bold text-white">NeoTech</span>
</Link>
```

---

## 🏠 Ejemplo 2: Agregar imagen de fondo al Hero

### Paso 1: Sube tu imagen

Coloca `hero-bg.jpg` en:

```
/public/images/landing/hero-bg.jpg
```

### Paso 2: Actualiza la landing page

En `app/page.tsx`:

```tsx
{
  /* Hero Section */
}
<section
  className="min-h-screen flex items-center justify-center relative overflow-hidden"
  style={{
    backgroundImage: "url(/images/landing/hero-bg.jpg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* Overlay oscuro para mejor legibilidad */}
  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

  {/* Contenido */}
  <div className="relative z-10 text-center">
    <h1 className="text-6xl font-bold mb-6">Bienvenido a NeoTech</h1>
    <p className="text-xl text-white/80">La mejor tecnología al mejor precio</p>
  </div>
</section>;
```

---

## 🎨 Ejemplo 3: Sección "Acerca de" con imagen

```tsx
<section className="py-20">
  <div className="container mx-auto">
    <div className="grid md:grid-cols-2 gap-12 items-center">
      {/* Imagen */}
      <div className="rounded-2xl overflow-hidden">
        <img
          src="/images/landing/about-us.jpg"
          alt="Sobre nosotros"
          className="w-full h-auto"
        />
      </div>

      {/* Texto */}
      <div>
        <h2 className="text-4xl font-bold mb-4">Sobre NeoTech</h2>
        <p className="text-white/70 text-lg">
          Somos una empresa dedicada a ofrecer...
        </p>
      </div>
    </div>
  </div>
</section>
```

---

## 🔧 Ejemplo 4: Favicon

### Paso 1: Coloca tu favicon

```
/public/images/logo/favicon.ico
```

### Paso 2: Actualiza layout.tsx

En `app/layout.tsx`:

```tsx
export const metadata = {
  title: "NeoTech - Tecnología Premium",
  description: "Los mejores productos tech",
  icons: {
    icon: "/images/logo/favicon.ico",
  },
};
```

---

## ✅ Checklist para subir imágenes

- [ ] Optimiza las imágenes (usa TinyPNG, ImageOptim)
- [ ] Renombra con nombres descriptivos (sin espacios)
- [ ] Logo en formato SVG (escalable)
- [ ] Fotos en JPG (mejor compresión)
- [ ] Tamaño < 500KB por imagen
- [ ] Coloca en la carpeta correcta:
  - `/public/images/logo/` → Logos
  - `/public/images/landing/` → Landing page
- [ ] Usa rutas absolutas: `/images/...`

---

## 📏 Tamaños recomendados

| Tipo            | Tamaño          | Formato  |
| --------------- | --------------- | -------- |
| Logo (navbar)   | 200-400px ancho | SVG, PNG |
| Favicon         | 32x32px         | ICO, PNG |
| Hero background | 1920x1080px     | JPG      |
| Feature images  | 800x600px       | JPG, PNG |
| Icons           | 64x64px         | SVG, PNG |

---

## 💡 Tips

1. **SVG para logos**: Escalable, perfecto para retina displays
2. **JPG para fotos**: Mejor compresión que PNG
3. **PNG para transparencias**: Logos con fondo transparente
4. **WebP para web moderna**: Mejor que JPG (opcional)

¿Necesitas ayuda para implementar algo específico? ¡Avísame!
