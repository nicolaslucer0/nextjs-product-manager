import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Sube una imagen a Cloudinary
 * @param buffer - Buffer de la imagen
 * @param folder - Carpeta en Cloudinary (opcional)
 * @returns Objeto con la URL pública y el public_id
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string = "product-manager"
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        format: "webp", // Forzar formato WebP (mejor compresión)
        quality: "auto:good", // Optimización automática de calidad
        fetch_format: "auto", // Formato automático según el cliente
      },
      (error, result) => {
        if (error) {
          reject(new Error(error.message || "Upload failed"));
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error("Upload failed"));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Elimina una imagen de Cloudinary
 * @param publicId - Public ID de la imagen en Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}
