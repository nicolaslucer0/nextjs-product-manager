# API Reference

Documentación completa de todas las rutas API disponibles en Product Manager.

## 🔐 Autenticación

Todas las rutas de autenticación están bajo `/api/auth/`.

### POST `/api/auth/register`

Registra un nuevo usuario en el sistema.

**Body (JSON):**

```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa (200):**

```json
{
  "id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "email": "juan@example.com"
}
```

**Errores posibles:**

- `400` - Faltan credenciales
- `409` - Email ya registrado
- `500` - Error del servidor

**Ejemplo con fetch:**

```javascript
const response = await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Juan Pérez",
    email: "juan@example.com",
    password: "contraseña123",
  }),
});

const data = await response.json();
console.log(data);
```

---

### POST `/api/auth/login`

Inicia sesión y obtiene un token JWT.

**Body (JSON):**

```json
{
  "email": "juan@example.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa (200):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "email": "juan@example.com",
    "role": "USER"
  }
}
```

**Errores posibles:**

- `400` - Faltan credenciales
- `401` - Email o contraseña incorrectos
- `500` - Error del servidor

**Ejemplo con fetch:**

```javascript
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "juan@example.com",
    password: "contraseña123",
  }),
});

const data = await response.json();

if (response.ok) {
  // Guardar el token
  localStorage.setItem("token", data.token);
  console.log("Login exitoso:", data.user);
}
```

---

## 📦 Productos

Todas las rutas de productos están bajo `/api/products/`.

### GET `/api/products`

Obtiene la lista completa de productos.

**Query params (opcionales):**

- Ninguno (por ahora)

**Respuesta exitosa (200):**

```json
[
  {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "title": "Leather Wallet",
    "description": "Handmade leather wallet",
    "price": 49.9,
    "stock": 20,
    "images": [],
    "createdAt": "2024-10-31T12:00:00.000Z",
    "updatedAt": "2024-10-31T12:00:00.000Z"
  },
  {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
    "title": "Canvas Backpack",
    "description": "Durable everyday backpack",
    "price": 89.0,
    "stock": 12,
    "images": [],
    "createdAt": "2024-10-31T12:00:00.000Z",
    "updatedAt": "2024-10-31T12:00:00.000Z"
  }
]
```

**Ejemplo con fetch:**

```javascript
const response = await fetch("/api/products");
const products = await response.json();

products.forEach((product) => {
  console.log(`${product.title} - $${product.price}`);
});
```

---

### POST `/api/products`

Crea un nuevo producto (requiere autenticación).

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "title": "Nuevo Producto",
  "description": "Descripción del producto",
  "price": 99.99,
  "stock": 50,
  "images": ["https://example.com/image1.jpg"]
}
```

**Respuesta exitosa (201):**

```json
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
  "title": "Nuevo Producto",
  "description": "Descripción del producto",
  "price": 99.99,
  "stock": 50,
  "images": ["https://example.com/image1.jpg"],
  "createdAt": "2024-10-31T14:30:00.000Z",
  "updatedAt": "2024-10-31T14:30:00.000Z"
}
```

**Errores posibles:**

- `401` - No autenticado
- `500` - Error del servidor

**Ejemplo con fetch:**

```javascript
const token = localStorage.getItem("token");

const response = await fetch("/api/products", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: "Nuevo Producto",
    description: "Descripción del producto",
    price: 99.99,
    stock: 50,
    images: [],
  }),
});

const newProduct = await response.json();
console.log("Producto creado:", newProduct);
```

---

### GET `/api/products/[id]`

Obtiene los detalles de un producto específico.

**Parámetros de ruta:**

- `id` - ID del producto (MongoDB ObjectId)

**Respuesta exitosa (200):**

```json
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "title": "Leather Wallet",
  "description": "Handmade leather wallet",
  "price": 49.9,
  "stock": 20,
  "images": [],
  "createdAt": "2024-10-31T12:00:00.000Z",
  "updatedAt": "2024-10-31T12:00:00.000Z"
}
```

**Errores posibles:**

- `404` - Producto no encontrado
- `500` - Error del servidor

**Ejemplo con fetch:**

```javascript
const productId = "64f1a2b3c4d5e6f7g8h9i0j1";
const response = await fetch(`/api/products/${productId}`);

if (response.ok) {
  const product = await response.json();
  console.log("Producto encontrado:", product);
} else {
  console.log("Producto no encontrado");
}
```

---

### PUT `/api/products/[id]`

Actualiza un producto existente (requiere autenticación).

**Parámetros de ruta:**

- `id` - ID del producto (MongoDB ObjectId)

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "title": "Leather Wallet - Updated",
  "price": 59.99,
  "stock": 15
}
```

**Respuesta exitosa (200):**

```json
{
  "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "title": "Leather Wallet - Updated",
  "description": "Handmade leather wallet",
  "price": 59.99,
  "stock": 15,
  "images": [],
  "createdAt": "2024-10-31T12:00:00.000Z",
  "updatedAt": "2024-10-31T15:00:00.000Z"
}
```

**Errores posibles:**

- `401` - No autenticado
- `404` - Producto no encontrado
- `500` - Error del servidor

**Ejemplo con fetch:**

```javascript
const token = localStorage.getItem("token");
const productId = "64f1a2b3c4d5e6f7g8h9i0j1";

const response = await fetch(`/api/products/${productId}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    price: 59.99,
    stock: 15,
  }),
});

const updatedProduct = await response.json();
console.log("Producto actualizado:", updatedProduct);
```

---

### DELETE `/api/products/[id]`

Elimina un producto (requiere autenticación).

**Parámetros de ruta:**

- `id` - ID del producto (MongoDB ObjectId)

**Headers:**

```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**

```json
{
  "ok": true
}
```

**Errores posibles:**

- `401` - No autenticado
- `404` - Producto no encontrado
- `500` - Error del servidor

**Ejemplo con fetch:**

```javascript
const token = localStorage.getItem("token");
const productId = "64f1a2b3c4d5e6f7g8h9i0j1";

const response = await fetch(`/api/products/${productId}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

if (response.ok) {
  console.log("Producto eliminado exitosamente");
}
```

---

## 🔒 Autenticación con JWT

Para rutas protegidas, incluye el token JWT en el header `Authorization`:

```javascript
const token = localStorage.getItem("token");

fetch("/api/products", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(productData),
});
```

### Verificar token

El token contiene:

```json
{
  "id": "user_id_aqui",
  "role": "ADMIN" // o "USER"
}
```

### Decodificar el token (cliente)

```javascript
function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

const token = localStorage.getItem("token");
const decoded = parseJwt(token);
console.log("User ID:", decoded.id);
console.log("Role:", decoded.role);
```

---

## 📊 Códigos de estado HTTP

| Código | Significado                                |
| ------ | ------------------------------------------ |
| 200    | OK - Solicitud exitosa                     |
| 201    | Created - Recurso creado exitosamente      |
| 400    | Bad Request - Datos inválidos              |
| 401    | Unauthorized - No autenticado              |
| 403    | Forbidden - No autorizado                  |
| 404    | Not Found - Recurso no encontrado          |
| 409    | Conflict - Conflicto (ej: email duplicado) |
| 500    | Internal Server Error - Error del servidor |

---

## 🛠️ Herramientas recomendadas

### Postman

Importa esta colección para probar las APIs:

```json
{
  "info": {
    "name": "Product Manager API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "http://localhost:3000/api/auth/register",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"admin1234\"\n}"
            },
            "url": {
              "raw": "http://localhost:3000/api/auth/login",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Products",
      "item": [
        {
          "name": "Get All Products",
          "request": {
            "method": "GET",
            "url": {
              "raw": "http://localhost:3000/api/products",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "products"]
            }
          }
        },
        {
          "name": "Get Product by ID",
          "request": {
            "method": "GET",
            "url": {
              "raw": "http://localhost:3000/api/products/{{product_id}}",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "products", "{{product_id}}"]
            }
          }
        },
        {
          "name": "Create Product",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"New Product\",\n  \"description\": \"Product description\",\n  \"price\": 99.99,\n  \"stock\": 50,\n  \"images\": []\n}"
            },
            "url": {
              "raw": "http://localhost:3000/api/products",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "products"]
            }
          }
        },
        {
          "name": "Update Product",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"price\": 79.99,\n  \"stock\": 30\n}"
            },
            "url": {
              "raw": "http://localhost:3000/api/products/{{product_id}}",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "products", "{{product_id}}"]
            }
          }
        },
        {
          "name": "Delete Product",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": {
              "raw": "http://localhost:3000/api/products/{{product_id}}",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "products", "{{product_id}}"]
            }
          }
        }
      ]
    }
  ]
}
```

### cURL Examples

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin1234"}'

# Get Products
curl http://localhost:3000/api/products

# Create Product (replace TOKEN)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"New Product","price":99.99,"stock":10}'
```

---

## 💡 Consejos

1. **Siempre valida los datos** antes de enviarlos al servidor
2. **Maneja errores correctamente** en el cliente
3. **Usa try-catch** para peticiones asíncronas
4. **Guarda el token de forma segura** (considera usar httpOnly cookies en producción)
5. **Implementa rate limiting** en producción para prevenir abuso

---

**¿Preguntas?** Consulta el código fuente de las rutas API en `/app/api/`.
