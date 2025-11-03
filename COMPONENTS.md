# Guía de Componentes

Esta guía te ayudará a entender y modificar cada componente del proyecto Product Manager.

## 📄 Páginas principales

### 🏠 Landing Page (`app/page.tsx`)

**Ubicación:** `/app/page.tsx`  
**Ruta:** `/`

La página principal de bienvenida con diseño moderno.

**Secciones:**

1. **Hero Section** - Título principal y llamada a la acción
2. **Features Section** - Características del producto (3 tarjetas)
3. **Stats Section** - Estadísticas (10K+ productos, 500+ usuarios, etc.)
4. **CTA Section** - Llamada a la acción final
5. **Footer** - Enlaces y información legal

**Cómo modificar:**

```tsx
// Cambiar el título principal
<h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
  Tu nuevo título aquí
</h1>

// Cambiar las estadísticas
<div className="text-5xl font-bold text-gray-900 mb-2">10K+</div>
<div className="text-gray-600 font-medium">Tu métrica aquí</div>

// Agregar una nueva sección de características
<div className="card hover:shadow-lg transition-shadow">
  <div className="bg-gray-600 w-16 h-16 rounded-xl mb-4"></div>
  <h3 className="text-2xl font-semibold mb-3">Nueva Característica</h3>
  <p className="text-gray-600">Descripción de la característica</p>
</div>
```

---

### 🛍️ Catálogo de Productos (`app/products/page.tsx`)

**Ubicación:** `/app/products/page.tsx`  
**Ruta:** `/products`

Muestra todos los productos disponibles en una cuadrícula.

**Funcionalidad:**

- Conecta a MongoDB
- Obtiene todos los productos ordenados por fecha
- Muestra mensaje si no hay productos
- Usa el componente `ProductCard` para cada producto

**Cómo modificar:**

```tsx
// Cambiar el número de columnas
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* 4 columnas en pantallas grandes */}
</div>;

// Filtrar solo productos en stock
const products = await Product.find({ stock: { $gt: 0 } })
  .sort({ createdAt: -1 })
  .lean();

// Limitar cantidad de productos mostrados
const products = await Product.find().sort({ createdAt: -1 }).limit(12).lean();
```

---

### 🔐 Login (`app/login/page.tsx`)

**Ubicación:** `/app/login/page.tsx`  
**Ruta:** `/login`

Formulario de inicio de sesión.

**Funcionalidad:**

- Valida email y contraseña
- Envía petición a `/api/auth/login`
- Guarda el token JWT en localStorage
- Muestra mensajes de éxito/error

**Cómo modificar:**

```tsx
// Redirigir después de login exitoso
if (res.ok) {
  localStorage.setItem("token", data.token);
  window.location.href = "/admin"; // Redirigir a admin
}

// Agregar "Recordar sesión"
const [rememberMe, setRememberMe] = useState(false);

// Personalizar mensajes
if (res.ok) {
  setMessage("¡Bienvenido de vuelta!");
} else {
  setMessage(data.error || "Credenciales incorrectas");
}
```

---

### 📝 Registro (`app/register/page.tsx`)

**Ubicación:** `/app/register/page.tsx`  
**Ruta:** `/register`

Formulario de registro de nuevos usuarios.

**Funcionalidad:**

- Campos: nombre, email, contraseña
- Envía petición a `/api/auth/register`
- Muestra mensaje de éxito/error

**Cómo modificar:**

```tsx
// Agregar confirmación de contraseña
const [confirmPassword, setConfirmPassword] = useState("");

// Validar antes de enviar
if (password !== confirmPassword) {
  setMessage("Las contraseñas no coinciden");
  return;
}

// Redirigir automáticamente al login después de registro
if (res.ok) {
  setMessage("¡Registro exitoso! Redirigiendo...");
  setTimeout(() => {
    window.location.href = "/login";
  }, 2000);
}
```

---

### ⚙️ Panel Admin (`app/admin/page.tsx`)

**Ubicación:** `/app/admin/page.tsx`  
**Ruta:** `/admin`

Panel de administración para gestionar productos.

**Funcionalidad:**

- Listar todos los productos
- Crear nuevo producto
- Editar producto existente
- Eliminar producto
- Usa Server Actions de Next.js

**Cómo modificar:**

```tsx
// Agregar búsqueda de productos
const [searchTerm, setSearchTerm] = useState("");
const filteredProducts = products.filter((p) =>
  p.title.toLowerCase().includes(searchTerm.toLowerCase())
);

// Agregar paginación
const itemsPerPage = 10;
const [currentPage, setCurrentPage] = useState(1);

// Agregar estadísticas
const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
```

---

## 🧩 Componentes Reutilizables

### 🧭 Navbar (`components/Navbar.tsx`)

**Ubicación:** `/components/Navbar.tsx`

Barra de navegación superior con enlaces y autenticación.

**Funcionalidad:**

- Muestra logo/nombre del proyecto
- Enlaces a Productos y Admin
- Botones de Login/Register o Logout
- Detecta si el usuario está autenticado

**Cómo modificar:**

```tsx
// Agregar más enlaces
<Link href="/about" className="text-gray-600 hover:text-gray-900">
  Acerca de
</Link>

// Cambiar el logo
<Link href="/" className="text-xl font-bold">
  <img src="/logo.png" alt="Logo" className="h-8" />
</Link>

// Mostrar nombre del usuario
const [userName, setUserName] = useState("");
useEffect(() => {
  const name = localStorage.getItem("userName");
  setUserName(name || "");
}, []);
```

---

### 🎴 ProductCard (`components/ProductCard.tsx`)

**Ubicación:** `/components/ProductCard.tsx`

Tarjeta para mostrar un producto individual.

**Props:**

- `product` - Objeto con datos del producto (título, precio, stock, imágenes)

**Cómo modificar:**

```tsx
// Agregar badge de "Nuevo"
{
  product.isNew && (
    <span className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs">
      Nuevo
    </span>
  );
}

// Mostrar descuento
{
  product.discount > 0 && (
    <div className="text-red-500">-{product.discount}%</div>
  );
}

// Agregar botón "Agregar al carrito"
<button className="btn btn-primary w-full mt-2">Agregar al carrito</button>;
```

---

### 📋 ProductForm (`components/ProductForm.tsx`)

**Ubicación:** `/components/ProductForm.tsx`

Formulario para crear o editar productos.

**Props:**

- `initialData` (opcional) - Datos del producto para edición

**Cómo modificar:**

```tsx
// Agregar campo de categoría
const [category, setCategory] = useState(initialData?.category || "");

<select
  className="input"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  <option value="electronics">Electrónicos</option>
  <option value="clothing">Ropa</option>
  <option value="food">Alimentos</option>
</select>;

// Agregar validación de precio mínimo
if (price < 0) {
  alert("El precio debe ser mayor a 0");
  return;
}

// Subir imágenes
const [imageFiles, setImageFiles] = useState<File[]>([]);

<input
  type="file"
  accept="image/*"
  multiple
  onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
/>;
```

---

## 🗄️ Modelos de datos

### 📦 Product (`lib/models/Product.ts`)

**Ubicación:** `/lib/models/Product.ts`

Modelo de producto en MongoDB.

**Campos:**

- `title` - Nombre del producto
- `description` - Descripción
- `price` - Precio
- `stock` - Cantidad disponible
- `images` - Array de URLs de imágenes
- `createdAt` - Fecha de creación
- `updatedAt` - Fecha de última actualización

**Cómo modificar:**

```tsx
// Agregar nuevos campos
const ProductSchema = new Schema({
  // ...campos existentes
  category: { type: String, required: true },
  brand: { type: String, default: "" },
  sku: { type: String, unique: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviews: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

// Agregar método personalizado
ProductSchema.methods.isInStock = function () {
  return this.stock > 0;
};

// Actualizar el tipo TypeScript
export type ProductType = {
  _id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string; // Nuevo campo
  brand: string; // Nuevo campo
  // ...
};
```

---

### 👤 User (`lib/models/User.ts`)

**Ubicación:** `/lib/models/User.ts`

Modelo de usuario en MongoDB.

**Campos:**

- `name` - Nombre del usuario
- `email` - Email (único)
- `passwordHash` - Contraseña encriptada
- `role` - Rol (ADMIN o USER)

**Cómo modificar:**

```tsx
// Agregar más campos
const UserSchema = new Schema({
  // ...campos existentes
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  avatar: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

// Agregar más roles
role: {
  type: String,
  enum: ["ADMIN", "USER", "MODERATOR", "SELLER"],
  default: "USER"
}
```

---

## 🎨 Estilos globales

### Tailwind CSS (`app/globals.css`)

**Ubicación:** `/app/globals.css`

Configuración de Tailwind CSS v4 y utilidades personalizadas.

**Clases personalizadas:**

- `.container` - Contenedor centrado con padding
- `.card` - Tarjeta con borde y sombra
- `.btn` - Botón base
- `.btn-primary` - Botón primario (negro)
- `.input` - Campo de entrada
- `.label` - Etiqueta de formulario

**Cómo modificar:**

```css
/* Cambiar colores del tema */
body {
  @apply bg-white text-gray-900;
}

/* Crear nueva variante de botón */
.btn-secondary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

/* Agregar nueva utilidad */
.badge {
  @apply inline-block px-3 py-1 text-xs font-semibold rounded-full;
}

.badge-success {
  @apply badge bg-green-100 text-green-800;
}
```

---

## 🔌 API Routes

### Autenticación

**Login:** `/app/api/auth/login/route.ts`

- POST - Inicia sesión y devuelve JWT

**Register:** `/app/api/auth/register/route.ts`

- POST - Registra nuevo usuario

### Productos

**Lista/Crear:** `/app/api/products/route.ts`

- GET - Obtiene todos los productos
- POST - Crea un nuevo producto

**Ver/Editar/Eliminar:** `/app/api/products/[id]/route.ts`

- GET - Obtiene un producto específico
- PUT - Actualiza un producto
- DELETE - Elimina un producto

**Cómo modificar:**

```tsx
// Agregar filtros a GET /api/products
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const filter = category ? { category } : {};
  const products = await Product.find(filter);

  return NextResponse.json(products);
}

// Agregar validación
export async function POST(req: Request) {
  const data = await req.json();

  if (data.price < 0) {
    return NextResponse.json(
      { error: "El precio debe ser positivo" },
      { status: 400 }
    );
  }

  // ...crear producto
}
```

---

## 💡 Tips de personalización

### Cambiar colores del tema

Modifica `app/globals.css`:

```css
.btn-primary {
  @apply bg-purple-600 text-white hover:bg-purple-700;
}
```

### Agregar autenticación a una página

```tsx
"use client";
import { useEffect } from "react";

export default function ProtectedPage() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  return <div>Contenido protegido</div>;
}
```

### Conectar con API externa

```tsx
// En cualquier componente
const fetchExternalData = async () => {
  const res = await fetch("https://api.example.com/data");
  const data = await res.json();
  return data;
};
```

---

## 📚 Recursos adicionales

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [React Documentation](https://react.dev/)

---

**¿Necesitas ayuda?** Revisa el código de los componentes existentes - están bien documentados y son fáciles de entender.
