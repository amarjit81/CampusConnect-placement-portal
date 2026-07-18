const express = require("express");
const {
  getBookmarks,
  createBookmark,
  deleteBookmark,
} = require("../controllers/bookmarkController");

const router = express.Router();

router.get("/", getBookmarks);
router.post("/:opportunityId", createBookmark);
router.delete("/:opportunityId", deleteBookmark);

module.exports = router;
