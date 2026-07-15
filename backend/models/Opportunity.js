const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    opportunityType: {
      type: String,
      enum: ["internship", "full-time", "internship-and-full-time"],
      default: "full-time",
      index: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    package: {
      type: String,
      required: true,
      trim: true,
    },
    eligibleBranches: {
      type: [String],
      required: true,
      validate: {
        validator: (branches) => branches.length > 0,
        message: "At least one eligible branch is required",
      },
      set: (branches) => [
        ...new Set(
          branches
            .map((branch) => branch.trim().toUpperCase())
            .filter(Boolean),
        ),
      ],
    },
    minimumCgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    maximumBacklogs: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Maximum backlogs must be a whole number",
      },
    },
    graduationYear: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
      validate: {
        validator: Number.isInteger,
        message: "Graduation year must be a whole number",
      },
    },
    deadline: {
      type: Date,
      required: true,
      index: true,
    },
    applicationLink: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^https?:\/\//i,
        "Application link must start with http:// or https://",
      ],
    },
    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft",
      index: true,
    },
  },
  { timestamps: true },
);

opportunitySchema.index({ status: 1, deadline: 1 });
opportunitySchema.index({ company: "text", role: "text", description: "text" });

module.exports = mongoose.model("Opportunity", opportunitySchema);
