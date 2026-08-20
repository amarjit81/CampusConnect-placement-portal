const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

let connectionPromise;

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (connectionPromise) {
    return connectionPromise;
  }

  const databaseUri = process.env.MONGODB_URI;

  if (!databaseUri) {
    throw new Error("MONGODB_URI is missing from backend/.env");
  }

  mongoose.set("autoIndex", process.env.NODE_ENV !== "production");
  connectionPromise = mongoose.connect(databaseUri)
    .then(() => {
      console.log(`MongoDB connected: ${mongoose.connection.name}`);
      return mongoose.connection;
    })
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
}

module.exports = connectDatabase;
