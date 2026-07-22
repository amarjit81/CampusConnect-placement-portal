const express = require("express");
const {
  getReadAnnouncements,
  markAnnouncementRead,
  markAnnouncementUnread,
} = require("../controllers/announcementReadController");
const { authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", authorize("student"), getReadAnnouncements);
router.put("/:announcementId", authorize("student"), markAnnouncementRead);
router.delete("/:announcementId", authorize("student"), markAnnouncementUnread);

module.exports = router;
