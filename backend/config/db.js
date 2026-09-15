// ============================================================
// BuyUKUsed
// MongoDB Database Connection
// ============================================================

const mongoose = require("mongoose");

// ============================================================
// MongoDB Connection
// ============================================================

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error(
      "❌ MONGO_URI is missing in environment variables"
    );
  }

  // ----------------------------------------------------------
  // Already connected
  // ----------------------------------------------------------

  if (mongoose.connection.readyState === 1) {
    console.log("✅ MongoDB already connected");
    return mongoose.connection;
  }

  // ----------------------------------------------------------
  // Connection options
  // ----------------------------------------------------------

  const options = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,

    maxPoolSize: 10,
    minPoolSize: 2,

    retryWrites: true,
    retryReads: true,
  };

  // ----------------------------------------------------------
  // Connect
  // ----------------------------------------------------------

  try {
    console.log("🔌 Connecting to MongoDB Atlas...");

    await mongoose.connect(uri, options);

    console.log("✅ MongoDB Connected Successfully");
    console.log(`📦 Database: ${mongoose.connection.name}`);
    console.log(`🌍 Host: ${mongoose.connection.host}`);

    return mongoose.connection;
  } catch (error) {
    console.error(
      "❌ MongoDB connection failed:",
      error.message
    );

    throw error;
  }
};

// ============================================================
// MongoDB Event Listeners
// ============================================================

mongoose.connection.on("connected", () => {
  console.log("🟢 Mongoose connected");
});

mongoose.connection.on("error", (error) => {
  console.error(
    "❌ MongoDB runtime error:",
    error.message
  );
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected");
});

// ============================================================
// Graceful Shutdown
// ============================================================

const gracefulShutdown = async (signal) => {
  try {
    console.log(
      `\n🛑 ${signal} received. Shutting down gracefully...`
    );

    if (
      mongoose.connection.readyState ===
      mongoose.ConnectionStates.connected
    ) {
      await mongoose.connection.close();
      console.log("💤 MongoDB connection closed gracefully");
    }

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Error during MongoDB shutdown:",
      error.message
    );

    process.exit(1);
  }
};

process.on("SIGINT", () => {
  gracefulShutdown("SIGINT");
});

process.on("SIGTERM", () => {
  gracefulShutdown("SIGTERM");
});

// ============================================================
// Export
// ============================================================

module.exports = connectDB;