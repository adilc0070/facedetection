import mongoose from "mongoose";

const globalForMongo = globalThis;

let memoryServerPromise = null;

async function getMemoryUri() {
  if (!memoryServerPromise) {
    memoryServerPromise = (async () => {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const server = await MongoMemoryServer.create({
        instance: { dbName: "lumina" },
      });
      globalForMongo.__luminaMemoryServer = server;
      return server.getUri();
    })();
  }
  return memoryServerPromise;
}

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  let uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    uri = await getMemoryUri();
    console.info("[lumina] Using in-memory MongoDB for local demo");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { bufferCommands: false });
  return mongoose.connection;
}
