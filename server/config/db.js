const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  try {
    // Reuse existing connection in serverless environment
    if (isConnected || mongoose.connection.readyState === 1) {
      return;
    }

    const connection = await mongoose.connect(
      process.env.MONGO_URI
    );

    isConnected = true;

    console.log(
      `🍃 MongoDB connected: ${connection.connection.host}`
    );
  } catch (error) {
    console.error(
      "❌ MongoDB connection failed:",
      error.message
    );

    throw error;
  }
};

module.exports = connectDB;