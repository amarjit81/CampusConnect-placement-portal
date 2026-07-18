const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    type: { type: String, trim: true },
    url: {
      type: String,
      trim: true,
      match: [/^https?:\/\//i, "Attachment URL must start with http:// or https://"],
    },
  },
  { _id: false },
);

const announcementSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    important: {
      type: Boolean,
      default: false,
      index: true,
    },
    audience: {
      type: String,
      enum: ["all", "students", "admins"],
      default: "all",
      index: true,
    },
    attachment: attachmentSchema,
    publishedAt: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

announcementSchema.index({ audience: 1, publishedAt: -1 });

module.exports = mongoose.model("Announcement", announcementSchema);
