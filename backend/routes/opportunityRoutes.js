const express = require("express");
const {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} = require("../controllers/opportunityController");

const router = express.Router();

// Each route connects an HTTP method and URL to a controller function.
router.get("/", getOpportunities);
router.get("/:id", getOpportunityById);
router.post("/", createOpportunity);
router.put("/:id", updateOpportunity);
router.delete("/:id", deleteOpportunity);

module.exports = router;
