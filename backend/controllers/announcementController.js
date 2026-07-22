const { Announcement } = require("../models");

const writableFields = [
  "title",
  "message",
  "body",
  "important",
  "audience",
  "publishedAt",
];

function buildAnnouncementFields(data) {
  const fields = Object.fromEntries(
    writableFields
      .filter((field) => data[field] !== undefined)
      .map((field) => [field, data[field]]),
  );

  if (data.date !== undefined) fields.publishedAt = data.date;
  if (!fields.body && fields.message) fields.body = fields.message;

  const attachment = {
    name: data.attachmentName,
    type: data.attachmentType,
    url: data.attachmentUrl,
  };
  if (Object.values(attachment).some(Boolean)) fields.attachment = attachment;

  return fields;
}

function serializeAnnouncement(document) {
  const announcement = document.toObject ? document.toObject() : document;
  const attachment = announcement.attachment || {};

  return {
    id: String(announcement._id || announcement.id),
    title: announcement.title,
    message: announcement.message,
    body: announcement.body,
    date: announcement.publishedAt,
    important: announcement.important,
    audience: announcement.audience,
    attachmentName: attachment.name,
    attachmentType: attachment.type,
    attachmentUrl: attachment.url,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
  };
}

function sendDatabaseError(res, error) {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: error.message });
  }

  console.error("Announcement API error:", error);
  return res.status(500).json({ message: "Unable to process announcement" });
}

async function getAnnouncements(req, res) {
  try {
    const announcements = await Announcement.find().sort({ publishedAt: -1 });
    return res.status(200).json(announcements.map(serializeAnnouncement));
  } catch (error) {
    return sendDatabaseError(res, error);
  }
}

async function getAnnouncementById(req, res) {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.status(200).json(serializeAnnouncement(announcement));
  } catch (error) {
    return sendDatabaseError(res, error);
  }
}

async function createAnnouncement(req, res) {
  try {
    const announcement = await Announcement.create({
      ...buildAnnouncementFields(req.body),
      createdBy: req.user._id,
    });

    return res.status(201).json(serializeAnnouncement(announcement));
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return sendDatabaseError(res, error);
  }
}

async function updateAnnouncement(req, res) {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      buildAnnouncementFields(req.body),
      { new: true, runValidators: true },
    );

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.status(200).json(serializeAnnouncement(announcement));
  } catch (error) {
    return sendDatabaseError(res, error);
  }
}

async function deleteAnnouncement(req, res) {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    return res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
}

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  serializeAnnouncement,
};
