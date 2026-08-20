const express = require("express");
const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const { authorize } = require("../middleware/auth");

const router = express.Router();

// Announcement routes used by the frontend announcements screens.
router.get("/", getAnnouncements);
router.get("/:id", getAnnouncementById);
router.post("/", authorize("admin"), createAnnouncement);
router.put("/:id", authorize("admin"), updateAnnouncement);
router.delete("/:id", authorize("admin"), deleteAnnouncement);

module.exports = router;
