import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Product from "@/lib/models/Product";
import bcrypt from "bcrypt";

async function main() {
  await connectDB();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@neotech.com";
  const adminPass = process.env.SEED_ADMIN_PASSWORD || "4dm1n-n3073ch";

  // Seed Admin User
  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    console.log("Admin already exists:", adminEmail);
  } else {
    const passwordHash = await bcrypt.hash(adminPass, 10);
    await User.create({
      name: "Admin",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
      active: true,
    });
    console.log("✅ Seeded admin:", adminEmail, adminPass);
  }

  // Seed Products with Variants
  const productsCount = await Product.countDocuments();

  if (productsCount === 0) {
    const sampleProducts = [
      {
        title: "iPhone 15 Pro",
        description:
          "El iPhone más avanzado con titanio de calidad aeroespacial, chip A17 Pro y cámara principal de 48 MP.",
        price: 999.0,
        stock: 15,
        images: [
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&h=600",
        ],
        variants: [
          {
            name: "Titanio Natural",
            type: "color",
            price: 0,
            stock: 5,
            image:
              "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
          },
          {
            name: "Titanio Azul",
            type: "color",
            price: 0,
            stock: 4,
            image:
              "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
          },
          {
            name: "Titanio Negro",
            type: "color",
            price: 0,
            stock: 6,
            image:
              "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
          },
          {
            name: "128GB",
            type: "storage",
            price: 0,
            stock: 8,
            image: "",
          },
          {
            name: "256GB",
            type: "storage",
            price: 100,
            stock: 5,
            image: "",
          },
          {
            name: "512GB",
            type: "storage",
            price: 200,
            stock: 2,
            image: "",
          },
        ],
      },
      {
        title: "MacBook Air M3",
        description:
          "Laptop ultradelgada con chip M3, pantalla Liquid Retina de 13 pulgadas y hasta 18 horas de batería.",
        price: 1299.0,
        stock: 8,
        images: [
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
        ],
        variants: [
          {
            name: "Gris Espacial",
            type: "color",
            price: 0,
            stock: 4,
            image:
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
          },
          {
            name: "Plata",
            type: "color",
            price: 0,
            stock: 2,
            image:
              "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
          },
          {
            name: "Medianoche",
            type: "color",
            price: 0,
            stock: 2,
            image:
              "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
          },
          {
            name: "256GB SSD",
            type: "storage",
            price: 0,
            stock: 5,
            image: "",
          },
          {
            name: "512GB SSD",
            type: "storage",
            price: 200,
            stock: 3,
            image: "",
          },
        ],
      },
      {
        title: "AirPods Pro 2",
        description:
          "Audífonos inalámbricos con cancelación activa de ruido, audio espacial personalizado y estuche MagSafe.",
        price: 249.0,
        stock: 25,
        images: [
          "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800",
        ],
        variants: [
          {
            name: "Blanco",
            type: "color",
            price: 0,
            stock: 25,
            image:
              "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800",
          },
        ],
      },
      {
        title: 'iPad Pro 12.9"',
        description:
          "Tablet profesional con chip M2, pantalla Liquid Retina XDR y compatibilidad con Apple Pencil Pro.",
        price: 1099.0,
        stock: 6,
        images: [
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
        ],
        variants: [
          {
            name: "Gris Espacial",
            type: "color",
            price: 0,
            stock: 3,
            image:
              "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
          },
          {
            name: "Plata",
            type: "color",
            price: 0,
            stock: 3,
            image:
              "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800",
          },
          {
            name: "128GB",
            type: "storage",
            price: 0,
            stock: 2,
            image: "",
          },
          {
            name: "256GB",
            type: "storage",
            price: 100,
            stock: 2,
            image: "",
          },
          {
            name: "512GB",
            type: "storage",
            price: 200,
            stock: 2,
            image: "",
          },
        ],
      },
      {
        title: "Apple Watch Series 9",
        description:
          "Reloj inteligente con pantalla siempre activa, sensor de temperatura y detección de accidentes.",
        price: 399.0,
        stock: 12,
        images: [
          "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800",
        ],
        variants: [
          {
            name: "Medianoche",
            type: "color",
            price: 0,
            stock: 4,
            image:
              "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800",
          },
          {
            name: "Luz Estelar",
            type: "color",
            price: 0,
            stock: 4,
            image:
              "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800",
          },
          {
            name: "Rojo",
            type: "color",
            price: 0,
            stock: 4,
            image:
              "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800",
          },
          {
            name: "41mm",
            type: "storage",
            price: 0,
            stock: 6,
            image: "",
          },
          {
            name: "45mm",
            type: "storage",
            price: 30,
            stock: 6,
            image: "",
          },
        ],
      },
    ];

    await Product.insertMany(sampleProducts);
    console.log(`✅ Seeded ${sampleProducts.length} products with variants`);
  } else {
    console.log(`Products already exist (${productsCount} products found)`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
