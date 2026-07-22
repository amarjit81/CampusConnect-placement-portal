const express = require("express");
const {
  getBookmarks,
  createBookmark,
  deleteBookmark,
} = require("../controllers/bookmarkController");
const { authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", authorize("student"), getBookmarks);
router.post("/:opportunityId", authorize("student"), createBookmark);
router.delete("/:opportunityId", authorize("student"), deleteBookmark);

module.exports = router;
