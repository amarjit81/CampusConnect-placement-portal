const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
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
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    eventType: {
      type: String,
      enum: ["placement-drive", "interview", "workshop", "deadline", "other"],
      default: "other",
      index: true,
    },
    startsAt: {
      type: Date,
      required: true,
      index: true,
    },
    endsAt: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return !this.startsAt || value >= this.startsAt;
        },
        message: "Event end time must be after its start time",
      },
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    audience: {
      type: String,
      enum: ["all", "students", "admins"],
      default: "students",
    },
    registrationLink: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

eventSchema.index({ audience: 1, startsAt: 1 });

module.exports = mongoose.model("Event", eventSchema);
