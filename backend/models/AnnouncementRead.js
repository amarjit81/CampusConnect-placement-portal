const mongoose = require("mongoose");

const announcementReadSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    announcement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Announcement",
      required: true,
      index: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true },
);

announcementReadSchema.index(
  { student: 1, announcement: 1 },
  { unique: true },
);

module.exports = mongoose.model("AnnouncementRead", announcementReadSchema);
