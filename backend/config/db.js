const mongoose = require("mongoose");

const connectDB = async (retries = 3) => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("❌ MONGO_URI is missing");
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
  };


  const connectWithRetry = async (attempt = 1) => {
    try {

      await mongoose.connect(uri, options);

      console.log("✅ MongoDB Connected Successfully");
      console.log(`📦 Database: ${mongoose.connection.name}`);
      console.log(`🌍 Host: ${mongoose.connection.host}`);

      return mongoose.connection;

    } catch (error) {

      console.error(
        `❌ MongoDB connection failed (Attempt ${attempt}/${retries})`
      );

      console.error(error.message);


      if (attempt < retries) {

        const delay = attempt * 3000;

        console.log(`🔄 Retrying in ${delay / 1000}s...`);

        await new Promise(resolve =>
          setTimeout(resolve, delay)
        );

        return connectWithRetry(attempt + 1);
      }


      throw error;
    }
  };


  mongoose.connection.on("connected", () => {
    console.log("🟢 Mongoose connected");
  });


  mongoose.connection.on("error", (error) => {
    console.error(
      "❌ MongoDB error:",
      error.message
    );
  });


  mongoose.connection.on("disconnected", () => {
    console.warn(
      "⚠️ MongoDB disconnected"
    );
  });


  return connectWithRetry();

};


module.exports = connectDB;