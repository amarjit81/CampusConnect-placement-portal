const express = require("express");
const {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} = require("../controllers/opportunityController");
const { authorize } = require("../middleware/auth");

const router = express.Router();

// Each route connects an HTTP method and URL to a controller function.
router.get("/", getOpportunities);
router.get("/:id", getOpportunityById);
router.post("/", authorize("admin"), createOpportunity);
router.put("/:id", authorize("admin"), updateOpportunity);
router.delete("/:id", authorize("admin"), deleteOpportunity);

module.exports = router;
