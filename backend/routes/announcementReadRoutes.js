const express = require("express");
const {
  getReadAnnouncements,
  markAnnouncementRead,
  markAnnouncementUnread,
} = require("../controllers/announcementReadController");

const router = express.Router();

router.get("/", getReadAnnouncements);
router.put("/:announcementId", markAnnouncementRead);
router.delete("/:announcementId", markAnnouncementUnread);

module.exports = router;
