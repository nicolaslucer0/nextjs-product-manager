import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, WebP, GIF)",
        },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Máximo 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Comprimir imagen con sharp
    // Convierte a WebP (mejor compresión), redimensiona a máximo 1920x1920 y optimiza calidad
    const compressedBuffer = await sharp(buffer)
      .resize(1920, 1920, {
        fit: "inside", // Mantiene aspect ratio
        withoutEnlargement: true, // No agranda imágenes pequeñas
      })
      .webp({ quality: 85 }) // Convierte a WebP con 85% de calidad
      .toBuffer();

    console.log(
      `Imagen comprimida: ${Math.round(buffer.length / 1024)}KB → ${Math.round(
        compressedBuffer.length / 1024
      )}KB (${Math.round(
        (1 - compressedBuffer.length / buffer.length) * 100
      )}% reducción)`
    );

    // Subir a Cloudinary
    const { url, publicId } = await uploadToCloudinary(
      compressedBuffer,
      "product-manager/products"
    );

    return NextResponse.json({
      success: true,
      url: url,
      publicId: publicId,
      filename: publicId.split("/").pop() || "image",
    });
  } catch (error) {
    console.error("Error al subir archivo:", error);
    return NextResponse.json(
      { error: "Error al procesar la imagen" },
      { status: 500 }
    );
  }
}
