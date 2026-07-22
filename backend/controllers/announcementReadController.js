const { Announcement, AnnouncementRead } = require("../models");
const { sendDatabaseError } = require("./controllerHelpers");

async function getReadAnnouncements(req, res) {
  try {
    const student = req.user;
    const records = await AnnouncementRead.find({ student: student._id }).lean();
    return res.status(200).json(
      records.map((record) => String(record.announcement)),
    );
  } catch (error) {
    return sendDatabaseError(res, error, "Announcement read status");
  }
}

async function markAnnouncementRead(req, res) {
  try {
    const student = req.user;
    const announcement = await Announcement.findById(req.params.announcementId);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    const record = await AnnouncementRead.findOneAndUpdate(
      { student: student._id, announcement: announcement._id },
      { student: student._id, announcement: announcement._id, readAt: new Date() },
      { upsert: true, new: true, runValidators: true },
    );
    return res.status(200).json({
      announcementId: String(record.announcement),
      read: true,
      readAt: record.readAt,
    });
  } catch (error) {
    return sendDatabaseError(res, error, "Announcement read status");
  }
}

async function markAnnouncementUnread(req, res) {
  try {
    const student = req.user;
    await AnnouncementRead.findOneAndDelete({
      student: student._id,
      announcement: req.params.announcementId,
    });
    return res.status(200).json({
      announcementId: req.params.announcementId,
      read: false,
    });
  } catch (error) {
    return sendDatabaseError(res, error, "Announcement read status");
  }
}

module.exports = {
  getReadAnnouncements,
  markAnnouncementRead,
  markAnnouncementUnread,
};
