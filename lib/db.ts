import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongoose:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

function getMongoUri(): string {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("Missing MONGODB_URI");
  return mongoUri;
}

export async function connectDB() {
  globalThis._mongoose ??= { conn: null, promise: null };

  if (globalThis._mongoose.conn) return globalThis._mongoose.conn;

  globalThis._mongoose.promise ??= mongoose
    .connect(getMongoUri(), {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1,
    })
    .catch((error) => {
      globalThis._mongoose!.promise = null;
      throw error;
    });

  globalThis._mongoose.conn = await globalThis._mongoose.promise;
  return globalThis._mongoose.conn;
}
