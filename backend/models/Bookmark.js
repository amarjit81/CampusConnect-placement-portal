const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
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
    },
  },
  { timestamps: true },
);

bookmarkSchema.index({ student: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
