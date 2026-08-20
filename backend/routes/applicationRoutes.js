const express = require("express");
const {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
} = require("../controllers/applicationController");
const { authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", authorize("student", "admin"), getApplications);
router.get("/:id", authorize("student", "admin"), getApplicationById);
router.post("/", authorize("student"), createApplication);
router.put("/:id", authorize("student"), updateApplication);
router.delete("/:id", authorize("student"), deleteApplication);

module.exports = router;
