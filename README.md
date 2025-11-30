# Product Manager

Sistema de gestión de productos completo construido con Next.js 16, MongoDB y Tailwind CSS v4.

## 🚀 Tecnologías

- **Next.js 16** con Turbopack
- **React 19**
- **MongoDB** con Mongoose
- **Tailwind CSS v4**
- **TypeScript**
- **JWT** para autenticación
- **bcrypt** para encriptación de contraseñas

## 📋 Requisitos previos

- Node.js >= 22.0.0
- pnpm
- Docker y Docker Compose (para MongoDB)

## 🛠️ Instalación

1. **Clonar el repositorio e instalar dependencias:**

```bash
pnpm install
```

2. **Configurar variables de entorno:**

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
MONGODB_URI=mongodb://localhost:27017/product_manager
JWT_SECRET=change_me_super_secret
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=admin1234
```

3. **Levantar MongoDB con Docker:**

```bash
docker-compose up mongo -d
```

4. **Sembrar datos iniciales (opcional):**

```bash
pnpm seed
```

5. **Iniciar el servidor de desarrollo:**

```bash
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del proyecto

```
product-manager/
├── app/                    # Rutas y páginas de Next.js
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Landing page (/)
│   ├── products/          # Catálogo de productos
│   ├── login/             # Página de inicio de sesión
│   ├── register/          # Página de registro
│   ├── admin/             # Panel de administración
│   └── api/               # API Routes
│       ├── auth/          # Autenticación
│       └── products/      # CRUD de productos
├── components/            # Componentes React reutilizables
│   ├── Navbar.tsx        # Barra de navegación
│   ├── ProductCard.tsx   # Tarjeta de producto
│   └── ProductForm.tsx   # Formulario de producto
├── lib/                   # Utilidades y lógica de negocio
│   ├── db.ts             # Conexión a MongoDB
│   ├── auth.ts           # Funciones de autenticación
│   └── models/           # Modelos de Mongoose
│       ├── Product.ts
│       └── User.ts
├── scripts/              # Scripts de utilidad
│   └── seed.ts          # Script para poblar la DB
└── docker-compose.yml   # Configuración de Docker
```

## 🔑 Características principales

### Autenticación

- Registro de usuarios
- Inicio de sesión con JWT
- Roles de usuario (ADMIN/USER)
- Protección de rutas

### Gestión de productos

- Listar productos
- Crear productos (solo admin)
- Editar productos (solo admin)
- Eliminar productos (solo admin)
- Ver detalles de productos

### Landing page

- Diseño moderno y responsive
- Secciones: Hero, Features, Stats, CTA, Footer
- Optimizada para conversión

## 📝 Scripts disponibles

```bash
pnpm dev          # Inicia el servidor de desarrollo
pnpm build        # Construye la aplicación para producción
pnpm start        # Inicia el servidor de producción
pnpm seed         # Puebla la base de datos con datos de prueba
```

## 🐳 Docker

Para ejecutar toda la aplicación con Docker:

```bash
docker-compose up --build
```

Esto levantará tanto MongoDB como la aplicación Next.js.

## 👤 Usuario administrador por defecto

Después de ejecutar `pnpm seed`:

- **Email:** admin@example.com
- **Password:** admin1234

## 🎨 Personalización

Consulta la [Guía de Componentes](./COMPONENTS.md) para aprender a modificar cada parte de la aplicación.

## 🛡️ Seguridad y Protección de Costos

Este proyecto incluye **múltiples capas de protección** contra ataques y control de costos:

### Protecciones Implementadas:

- ✅ **Rate Limiting** con Upstash Redis

  - API General: 100 req/10s
  - Escritura: 20 req/min
  - Autenticación: 5 intentos/min
  - Uploads: 10 archivos/min

- ✅ **Límites de Funciones** (vercel.json)

  - Timeout: 10s por defecto
  - Memoria: 1GB máximo
  - Imports: 5 minutos máx

- ✅ **Proxy Middleware**

  - Límite de payload: 10MB
  - Bloqueo de bots y scrapers
  - Headers de seguridad (XSS, CSRF, Clickjacking)
  - Protección contra path traversal

- ✅ **Estimación de costos en ataque**: < $1 USD

📖 **Documentación completa**: Ver [docs/SEGURIDAD.md](./docs/SEGURIDAD.md) y [docs/ALERTAS.md](./docs/ALERTAS.md)

## 📚 Documentación adicional

- [Guía de Componentes](./COMPONENTS.md) - Descripción detallada de cada componente
- [API Reference](./API.md) - Documentación de las rutas API
- [🛡️ Seguridad y Costos](./docs/SEGURIDAD.md) - Protecciones contra ataques
- [📊 Alertas y Monitoreo](./docs/ALERTAS.md) - Configuración de alertas
- [⚡ Rate Limiting](./docs/RATE_LIMITING.md) - Guía de límites de API

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
