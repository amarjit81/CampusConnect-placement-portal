const { Opportunity } = require("../models");

const writableFields = [
  "company",
  "role",
  "description",
  "opportunityType",
  "location",
  "package",
  "eligibleBranches",
  "minimumCgpa",
  "maximumBacklogs",
  "graduationYear",
  "deadline",
  "applicationLink",
  "status",
];

function pickWritableFields(data) {
  return Object.fromEntries(
    writableFields
      .filter((field) => data[field] !== undefined)
      .map((field) => [field, data[field]]),
  );
}

function serializeOpportunity(document) {
  const opportunity = document.toObject ? document.toObject() : document;
  const deadline = opportunity.deadline
    ? new Date(opportunity.deadline).toISOString().slice(0, 10)
    : null;

  return {
    id: String(opportunity._id || opportunity.id),
    company: opportunity.company,
    role: opportunity.role,
    description: opportunity.description,
    opportunityType: opportunity.opportunityType,
    location: opportunity.location,
    package: opportunity.package,
    eligibleBranches: opportunity.eligibleBranches,
    minimumCgpa: opportunity.minimumCgpa,
    maximumBacklogs: opportunity.maximumBacklogs,
    graduationYear: opportunity.graduationYear,
    deadline,
    applicationLink: opportunity.applicationLink,
    status: opportunity.status,
    createdAt: opportunity.createdAt,
    updatedAt: opportunity.updatedAt,
  };
}

function sendDatabaseError(res, error) {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }

  console.error("Opportunity API error:", error);
  return res.status(500).json({ message: "Unable to process opportunity" });
}

async function getOpportunities(req, res) {
  try {
    const opportunities = await Opportunity.find().sort({ createdAt: -1 });
    return res.status(200).json(opportunities.map(serializeOpportunity));
  } catch (error) {
    return sendDatabaseError(res, error);
  }
}

async function getOpportunityById(req, res) {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    return res.status(200).json(serializeOpportunity(opportunity));
  } catch (error) {
    return sendDatabaseError(res, error);
  }
}

async function createOpportunity(req, res) {
  try {
    const opportunity = await Opportunity.create({
      ...pickWritableFields(req.body),
      createdBy: req.user._id,
    });

    return res.status(201).json(serializeOpportunity(opportunity));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return sendDatabaseError(res, error);
  }
}

async function updateOpportunity(req, res) {
  try {
    const opportunity = await Opportunity.findByIdAndUpdate(
      req.params.id,
      pickWritableFields(req.body),
      { new: true, runValidators: true },
    );

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    return res.status(200).json(serializeOpportunity(opportunity));
  } catch (error) {
    return sendDatabaseError(res, error);
  }
}

async function deleteOpportunity(req, res) {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    return res.status(200).json({ message: "Opportunity deleted successfully" });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
}

module.exports = {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  serializeOpportunity,
};
