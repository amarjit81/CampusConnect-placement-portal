const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "applied",
        "shortlisted",
        "in-progress",
        "selected",
        "rejected",
        "withdrawn",
      ],
      default: "applied",
      index: true,
    },
    currentRound: {
      type: String,
      trim: true,
      default: "Application Submitted",
      maxlength: 160,
    },
    nextStep: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true },
);

applicationSchema.index({ student: 1, opportunity: 1 }, { unique: true });
applicationSchema.index({ opportunity: 1, status: 1 });

module.exports = mongoose.model("Application", applicationSchema);
