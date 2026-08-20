const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    enrollmentNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    activeBacklogs: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Active backlogs must be a whole number",
      },
    },
    graduationYear: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
      index: true,
      validate: {
        validator: Number.isInteger,
        message: "Graduation year must be a whole number",
      },
    },
    phone: {
      type: String,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
      set: (skills) => [
        ...new Set(skills.map((skill) => skill.trim()).filter(Boolean)),
      ],
    },
    resumeUrl: {
      type: String,
      trim: true,
      match: [
        /^(?:https?:\/\/.*)?$/i,
        "Resume URL must start with http:// or https://",
      ],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
