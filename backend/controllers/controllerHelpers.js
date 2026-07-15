const { User } = require("../models");

function pickFields(data, allowedFields) {
  return Object.fromEntries(
    allowedFields
      .filter((field) => data[field] !== undefined)
      .map((field) => [field, data[field]]),
  );
}

function sendDatabaseError(res, error, resource) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: `${resource} already exists` });
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }

  console.error(`${resource} API error:`, error);
  return res.status(500).json({ message: `Unable to process ${resource.toLowerCase()}` });
}

async function findDemoUser(role) {
  const user = await User.findOne({ role, isActive: true }).select(
    "_id name email role",
  );
  if (!user) {
    const error = new Error(
      `No active ${role} account exists. Run npm run db:seed first.`,
    );
    error.statusCode = 503;
    throw error;
  }
  return user;
}

module.exports = { pickFields, sendDatabaseError, findDemoUser };
