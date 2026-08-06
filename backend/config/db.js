const mongoose = require("mongoose");

const connectDB = async (retries = 3) => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("❌ MONGO_URI is missing in environment variables");
  }

  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    console.log("✅ MongoDB already connected");
    return mongoose.connection;
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
  };

  let attempt = 0;
  while (attempt < retries) {
    attempt++;
    try {
      await mongoose.connect(uri, options);
      console.log("✅ MongoDB Connected Successfully");
      console.log(`📦 Database: ${mongoose.connection.name}`);
      console.log(`🌍 Host: ${mongoose.connection.host}`);
      return mongoose.connection;
    } catch (error) {
      console.error(
        `❌ MongoDB connection failed (Attempt ${attempt}/${retries}):`,
        error.message
      );
      if (attempt === retries) {
        throw new Error(
          `MongoDB connection failed after ${retries} attempts: ${error.message}`
        );
      }
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`🔄 Retrying in ${delay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// Event listeners
mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose connected");
});

mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB runtime error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected – attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected");
});

// Graceful shutdown
const gracefulShutdown = async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log("💤 MongoDB connection closed gracefully");
  }
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

module.exports = connectDB;