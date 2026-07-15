const { Event } = require("../models");
const {
  pickFields,
  sendDatabaseError,
  findDemoUser,
} = require("./controllerHelpers");

const writableFields = [
  "title",
  "description",
  "eventType",
  "opportunity",
  "company",
  "role",
  "status",
  "startsAt",
  "endsAt",
  "location",
  "audience",
  "registrationLink",
];
const eventTypeAliases = {
  "company ppt": "pre-placement-talk",
  "online assessment": "online-assessment",
  "technical interview": "interview",
  "hr interview": "interview",
  "application deadline": "deadline",
  "company activity": "company-activity",
};

function titleCase(value) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildEventFields(data, includeDefaultEnd = false) {
  const fields = pickFields(data, writableFields);
  if (data.eventTitle !== undefined) fields.title = data.eventTitle;
  if (data.notes !== undefined) fields.description = data.notes;
  if (data.dateTime !== undefined) fields.startsAt = data.dateTime;
  if (fields.eventType) {
    fields.eventType =
      eventTypeAliases[String(fields.eventType).toLowerCase()] ||
      String(fields.eventType).toLowerCase().replaceAll(" ", "-");
  }
  if (fields.status) fields.status = String(fields.status).toLowerCase();
  if (includeDefaultEnd && fields.startsAt && !fields.endsAt) {
    fields.endsAt = new Date(new Date(fields.startsAt).getTime() + 60 * 60 * 1000);
  }
  return fields;
}

function serializeEvent(document) {
  const event = document.toObject ? document.toObject() : document;
  return {
    id: String(event._id || event.id),
    title: event.title,
    eventTitle: event.title,
    description: event.description,
    notes: event.description,
    eventType: titleCase(event.eventType),
    eventTypeCode: event.eventType,
    opportunityId: event.opportunity
      ? String(event.opportunity._id || event.opportunity)
      : null,
    company: event.company,
    role: event.role,
    status: titleCase(event.status),
    statusCode: event.status,
    dateTime: event.startsAt,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    location: event.location,
    audience: event.audience,
    registrationLink: event.registrationLink,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

async function getEvents(req, res) {
  try {
    const filter = req.query.upcoming === "true" ? { startsAt: { $gte: new Date() } } : {};
    const events = await Event.find(filter).sort({ startsAt: 1 });
    return res.status(200).json(events.map(serializeEvent));
  } catch (error) {
    return sendDatabaseError(res, error, "Event");
  }
}

async function getEventById(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    return res.status(200).json(serializeEvent(event));
  } catch (error) {
    return sendDatabaseError(res, error, "Event");
  }
}

async function createEvent(req, res) {
  try {
    const admin = await findDemoUser("admin");
    const event = await Event.create({
      ...buildEventFields(req.body, true),
      createdBy: admin._id,
    });
    return res.status(201).json(serializeEvent(event));
  } catch (error) {
    return sendDatabaseError(res, error, "Event");
  }
}

async function updateEvent(req, res) {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    Object.assign(event, buildEventFields(req.body));
    await event.save();
    return res.status(200).json(serializeEvent(event));
  } catch (error) {
    return sendDatabaseError(res, error, "Event");
  }
}

async function deleteEvent(req, res) {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    return res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    return sendDatabaseError(res, error, "Event");
  }
}

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  serializeEvent,
  buildEventFields,
};
