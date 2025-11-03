"use server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";

export async function deleteAllProducts() {
  try {
    await connectDB();
    const result = await Product.deleteMany({});
    return {
      success: true,
      deletedCount: result.deletedCount,
      message: `Se eliminaron ${result.deletedCount} productos exitosamente`,
    };
  } catch (error) {
    console.error("Error deleting all products:", error);
    return {
      success: false,
      error: "Error al eliminar los productos",
    };
  }
}
