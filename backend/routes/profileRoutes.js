const express = require("express");
const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");
const { authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", authorize("student"), getProfile);
router.put("/", authorize("student"), updateProfile);

module.exports = router;
