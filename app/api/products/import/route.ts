import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar que sea un archivo Excel
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "El archivo debe ser Excel (.xlsx, .xls) o CSV" },
        { status: 400 }
      );
    }

    // Leer el archivo
    const buffer = await file.arrayBuffer();

    let headers: string[] = [];
    let rows: string[][] = [];

    // Detectar si es Excel binario (.xlsx, .xls) o CSV
    if (file.type.includes("spreadsheet") || file.type.includes("excel")) {
      // Procesar archivo Excel con la librería xlsx
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<string[]>(firstSheet, {
        header: 1,
      });

      if (data.length === 0) {
        return NextResponse.json(
          { error: "El archivo Excel está vacío" },
          { status: 400 }
        );
      }

      headers = (data[0] as string[]).map((h) =>
        String(h || "")
          .trim()
          .toLowerCase()
      );
      rows = data.slice(1) as string[][];
    } else {
      // Procesar archivo CSV
      const decoder = new TextDecoder("utf-8");
      const text = decoder.decode(buffer);
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        return NextResponse.json(
          { error: "El archivo CSV está vacío" },
          { status: 400 }
        );
      }

      const firstLine = lines[0];
      const delimiter = firstLine.includes("\t")
        ? "\t"
        : firstLine.includes(";")
        ? ";"
        : ",";

      headers = firstLine
        .split(delimiter)
        .map((h) => h.trim().toLowerCase().replaceAll(/\r/g, ""));

      rows = lines
        .slice(1)
        .map((line) =>
          line.split(delimiter).map((v) => v.trim().replaceAll(/\r/g, ""))
        );
    }

    console.log("Headers detectados:", headers);

    // Validar headers requeridos - adaptado a las columnas del Excel del usuario
    const requiredHeaders = ["id", "nombre"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          error: `Faltan columnas requeridas: ${missingHeaders.join(", ")}`,
          hint: `El archivo debe tener al menos las columnas: Id, Nombre. Headers encontrados: ${headers.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    const products = [];
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    // Procesar cada fila
    for (let i = 0; i < rows.length; i++) {
      try {
        const values = rows[i];
        const row: Record<string, string> = {};

        headers.forEach((header, index) => {
          row[header] = String(values[index] || "").trim();
        });

        // Validar datos requeridos
        if (!row.id || !row.nombre) {
          errors.push(`Línea ${i + 1}: Falta ID o Nombre`);
          continue;
        }

        // Mapear las columnas del Excel al formato del producto
        const imagenValue = row.imagen?.trim().toLowerCase() || "";
        const hasValidImage =
          imagenValue &&
          imagenValue !== "no" &&
          imagenValue !== "n/a" &&
          imagenValue !== "null" &&
          imagenValue !== "undefined" &&
          imagenValue !== "-";

        const productData = {
          externalId: row.id,
          title: row.nombre,
          description: row.descripción || row.descripcion || "",
          category: row["tipo de producto"] || row.categoria || row.tipo || "",
          price:
            Number.parseFloat(row["precio de venta"] || row.precio || "0") || 0,
          stock: Number.parseInt(row.stock || "0", 10) || 0,
          images: hasValidImage ? [row.imagen.trim()] : [],
        };

        // Buscar si el producto existe por externalId
        const existingProduct = await Product.findOne({ externalId: row.id });

        if (existingProduct) {
          // Actualizar producto existente
          await Product.findOneAndUpdate(
            { externalId: row.id },
            {
              title: productData.title,
              description: productData.description,
              category: productData.category,
              price: productData.price,
              stock: productData.stock,
              images: productData.images,
              updatedAt: new Date(),
            }
          );
          updated++;
        } else {
          // Crear nuevo producto
          await Product.create(productData);
          created++;
        }

        products.push(productData);
      } catch (error) {
        errors.push(
          `Línea ${i + 1}: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Importación completada: ${created} creados, ${updated} actualizados`,
      created,
      updated,
      total: products.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error importing products:", error);
    return NextResponse.json(
      { error: "Error al importar productos" },
      { status: 500 }
    );
  }
}
