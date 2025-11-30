import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import * as XLSX from "xlsx";

export const maxDuration = 300;

const BATCH_SIZE = 50; // Procesar 50 productos a la vez

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await connectDB();

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: "No se proporcionó ningún archivo",
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        // Validar tipo de archivo
        const validTypes = [
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/csv",
        ];

        if (!validTypes.includes(file.type)) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: "El archivo debe ser Excel (.xlsx, .xls) o CSV",
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        // Enviar progreso inicial
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "progress",
              message: "Leyendo archivo...",
              percent: 0,
            })}\n\n`
          )
        );

        // Leer el archivo
        const buffer = await file.arrayBuffer();
        let headers: string[] = [];
        let rows: string[][] = [];

        // Procesar archivo según tipo
        if (file.type.includes("spreadsheet") || file.type.includes("excel")) {
          const workbook = XLSX.read(buffer, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json<string[]>(firstSheet, {
            header: 1,
          });

          if (data.length === 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  message: "El archivo Excel está vacío",
                })}\n\n`
              )
            );
            controller.close();
            return;
          }

          headers = (data[0] as string[]).map((h) =>
            String(h || "")
              .trim()
              .toLowerCase()
          );
          rows = data.slice(1) as string[][];
        } else {
          const decoder = new TextDecoder("utf-8");
          const text = decoder.decode(buffer);
          const lines = text.split("\n").filter((line) => line.trim());

          if (lines.length === 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "error",
                  message: "El archivo CSV está vacío",
                })}\n\n`
              )
            );
            controller.close();
            return;
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

        // Validar headers
        const requiredHeaders = ["id", "nombre"];
        const missingHeaders = requiredHeaders.filter(
          (h) => !headers.includes(h)
        );

        if (missingHeaders.length > 0) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: `Faltan columnas requeridas: ${missingHeaders.join(
                  ", "
                )}`,
                hint: `Headers encontrados: ${headers.join(", ")}`,
              })}\n\n`
            )
          );
          controller.close();
          return;
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "progress",
              message: `Procesando ${rows.length} productos...`,
              percent: 10,
              total: rows.length,
            })}\n\n`
          )
        );

        let created = 0;
        let updated = 0;
        const errors: string[] = [];

        // Procesar en lotes
        const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

        for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
          const batchStart = batchIndex * BATCH_SIZE;
          const batchEnd = Math.min(batchStart + BATCH_SIZE, rows.length);
          const batchRows = rows.slice(batchStart, batchEnd);

          // Procesar lote en paralelo usando Promise.allSettled
          const batchPromises = batchRows.map(async (values, localIndex) => {
            const globalIndex = batchStart + localIndex;
            try {
              const row: Record<string, string> = {};
              headers.forEach((header, index) => {
                row[header] = String(values[index] || "").trim();
              });

              if (!row.id || !row.nombre) {
                throw new Error("Falta ID o Nombre");
              }

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
                category:
                  row["tipo de producto"] || row.categoria || row.tipo || "",
                price:
                  Number.parseFloat(
                    row["precio de venta"] || row.precio || "0"
                  ) || 0,
                stock: Number.parseInt(row.stock || "0", 10) || 0,
                images: hasValidImage ? [row.imagen.trim()] : [],
              };

              const existingProduct = await Product.findOne({
                externalId: row.id,
              });

              if (existingProduct) {
                await Product.findOneAndUpdate(
                  { externalId: row.id },
                  {
                    ...productData,
                    updatedAt: new Date(),
                  }
                );
                return { type: "updated", index: globalIndex };
              } else {
                await Product.create(productData);
                return { type: "created", index: globalIndex };
              }
            } catch (error) {
              return {
                type: "error",
                index: globalIndex,
                message:
                  error instanceof Error ? error.message : "Error desconocido",
              };
            }
          });

          // Esperar a que el lote termine
          const batchResults = await Promise.allSettled(batchPromises);

          // Procesar resultados del lote
          batchResults.forEach((result) => {
            if (result.status === "fulfilled") {
              if (result.value.type === "created") {
                created++;
              } else if (result.value.type === "updated") {
                updated++;
              } else if (result.value.type === "error") {
                errors.push(
                  `Línea ${result.value.index + 2}: ${result.value.message}`
                );
              }
            } else {
              errors.push(`Error en lote: ${result.reason}`);
            }
          });

          // Enviar progreso del lote
          const processed = batchEnd;
          const percent = Math.round((processed / rows.length) * 90) + 10; // 10-100%

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "progress",
                message: `Procesados ${processed} de ${rows.length} productos...`,
                percent,
                created,
                updated,
                errors: errors.length,
                processed,
                total: rows.length,
              })}\n\n`
            )
          );

          // Pequeña pausa entre lotes para no saturar la DB
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Enviar resultado final
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "complete",
              success: true,
              message: `Importación completada: ${created} creados, ${updated} actualizados`,
              created,
              updated,
              total: created + updated,
              errors: errors.length > 0 ? errors : undefined,
            })}\n\n`
          )
        );

        controller.close();
      } catch (error) {
        console.error("Error importing products:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Error al importar productos",
            })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
