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
    },
    nextStep: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

applicationSchema.index({ student: 1, opportunity: 1 }, { unique: true });
applicationSchema.index({ opportunity: 1, status: 1 });

module.exports = mongoose.model("Application", applicationSchema);
