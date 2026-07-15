const mongoose = require("mongoose");
const connectDatabase = require("../config/database");
const models = require("../models");

async function verifyDatabase() {
  await connectDatabase();

  const counts = {};
  for (const [name, Model] of Object.entries(models)) {
    counts[name] = await Model.countDocuments();
  }

  const sampleApplication = await models.Application.findOne()
    .populate("student", "name email role")
    .populate("opportunity", "company role status")
    .lean();

  console.log("Collection counts:", counts);
  console.log("Relationship check:", sampleApplication);
}

verifyDatabase()
  .catch((error) => {
    console.error("Database verification failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
