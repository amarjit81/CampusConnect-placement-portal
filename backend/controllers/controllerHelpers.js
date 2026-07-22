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

module.exports = { pickFields, sendDatabaseError };
