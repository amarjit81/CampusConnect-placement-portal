const express = require("express");
const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

const router = express.Router();

// Announcement routes used by the frontend announcements screens.
router.get("/", getAnnouncements);
router.get("/:id", getAnnouncementById);
router.post("/", createAnnouncement);
router.put("/:id", updateAnnouncement);
router.delete("/:id", deleteAnnouncement);

module.exports = router;
