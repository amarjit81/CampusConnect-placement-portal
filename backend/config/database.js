const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

async function connectDatabase() {
  const databaseUri = process.env.MONGODB_URI;

  if (!databaseUri) {
    throw new Error("MONGODB_URI is missing from backend/.env");
  }

  mongoose.set("autoIndex", process.env.NODE_ENV !== "production");
  await mongoose.connect(databaseUri);

  console.log(`MongoDB connected: ${mongoose.connection.name}`);
  return mongoose.connection;
}

module.exports = connectDatabase;
