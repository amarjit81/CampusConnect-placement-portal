const { Bookmark, Opportunity } = require("../models");
const { serializeOpportunity } = require("./opportunityController");
const { sendDatabaseError } = require("./controllerHelpers");

function serializeBookmark(document) {
  const bookmark = document.toObject ? document.toObject() : document;
  const opportunity = bookmark.opportunity;
  return {
    id: String(bookmark._id || bookmark.id),
    opportunityId: String(opportunity?._id || opportunity),
    opportunity:
      opportunity && typeof opportunity === "object"
        ? serializeOpportunity(opportunity)
        : undefined,
    createdAt: bookmark.createdAt,
  };
}

async function getBookmarks(req, res) {
  try {
    const student = req.user;
    const bookmarks = await Bookmark.find({ student: student._id })
      .populate("opportunity")
      .sort({ createdAt: -1 });
    return res.status(200).json(bookmarks.map(serializeBookmark));
  } catch (error) {
    return sendDatabaseError(res, error, "Bookmark");
  }
}

async function createBookmark(req, res) {
  try {
    const student = req.user;
    const opportunity = await Opportunity.findById(req.params.opportunityId);
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    const bookmark = await Bookmark.create({
      student: student._id,
      opportunity: opportunity._id,
    });
    return res.status(201).json(
      serializeBookmark({ ...bookmark.toObject(), opportunity }),
    );
  } catch (error) {
    return sendDatabaseError(res, error, "Bookmark");
  }
}

async function deleteBookmark(req, res) {
  try {
    const student = req.user;
    const bookmark = await Bookmark.findOneAndDelete({
      student: student._id,
      opportunity: req.params.opportunityId,
    });
    if (!bookmark) return res.status(404).json({ message: "Bookmark not found" });
    return res.status(200).json({ message: "Bookmark deleted successfully" });
  } catch (error) {
    return sendDatabaseError(res, error, "Bookmark");
  }
}

module.exports = { getBookmarks, createBookmark, deleteBookmark, serializeBookmark };
