const { Application, Opportunity } = require("../models");
const { pickFields, sendDatabaseError } = require("./controllerHelpers");

const writableFields = [
  "company",
  "role",
  "status",
  "currentRound",
  "nextStep",
  "notes",
  "appliedAt",
];
const statusAliases = {
  "in progress": "in-progress",
  accepted: "selected",
};

function buildApplicationFields(data) {
  const fields = pickFields(data, writableFields);
  if (data.appliedDate !== undefined) fields.appliedAt = data.appliedDate;
  if (data.applicationStatus !== undefined) fields.status = data.applicationStatus;
  if (fields.status) {
    fields.status =
      statusAliases[String(fields.status).toLowerCase()] ||
      String(fields.status).toLowerCase().replaceAll(" ", "-");
  }
  return fields;
}

function titleCaseStatus(status) {
  if (status === "in-progress") return "In Progress";
  if (status === "selected") return "Accepted";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function serializeApplication(document) {
  const application = document.toObject ? document.toObject() : document;
  const opportunity = application.opportunity;
  return {
    id: String(application._id || application.id),
    opportunityId: opportunity
      ? String(opportunity._id || opportunity)
      : null,
    company: application.company || opportunity?.company,
    role: application.role || opportunity?.role,
    appliedDate: new Date(application.appliedAt).toISOString().slice(0, 10),
    currentRound: application.currentRound,
    applicationStatus: titleCaseStatus(application.status),
    status: application.status,
    nextStep: application.nextStep,
    notes: application.notes,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
  };
}

async function getApplications(req, res) {
  try {
    const student = req.user;
    const applications = await Application.find({ student: student._id })
      .populate("opportunity", "company role")
      .sort({ appliedAt: -1 });
    return res.status(200).json(applications.map(serializeApplication));
  } catch (error) {
    return sendDatabaseError(res, error, "Application");
  }
}

async function getApplicationById(req, res) {
  try {
    const student = req.user;
    const application = await Application.findOne({
      _id: req.params.id,
      student: student._id,
    }).populate("opportunity", "company role");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    return res.status(200).json(serializeApplication(application));
  } catch (error) {
    return sendDatabaseError(res, error, "Application");
  }
}

async function createApplication(req, res) {
  try {
    const student = req.user;
    const fields = buildApplicationFields(req.body);
    let opportunity;
    if (req.body.opportunityId) {
      opportunity = await Opportunity.findById(req.body.opportunityId);
      if (!opportunity) {
        return res.status(404).json({ message: "Opportunity not found" });
      }
      fields.opportunity = opportunity._id;
    }
    const application = await Application.create({
      ...fields,
      student: student._id,
    });
    return res.status(201).json(
      serializeApplication(
        opportunity
          ? { ...application.toObject(), opportunity }
          : application,
      ),
    );
  } catch (error) {
    return sendDatabaseError(res, error, "Application");
  }
}

async function updateApplication(req, res) {
  try {
    const student = req.user;
    const application = await Application.findOne({
      _id: req.params.id,
      student: student._id,
    });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    Object.assign(application, buildApplicationFields(req.body));
    await application.save();
    if (application.opportunity) {
      await application.populate("opportunity", "company role");
    }
    return res.status(200).json(serializeApplication(application));
  } catch (error) {
    return sendDatabaseError(res, error, "Application");
  }
}

async function deleteApplication(req, res) {
  try {
    const student = req.user;
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      student: student._id,
    });
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    return res.status(200).json({ message: "Application deleted successfully" });
  } catch (error) {
    return sendDatabaseError(res, error, "Application");
  }
}

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  serializeApplication,
  buildApplicationFields,
};
