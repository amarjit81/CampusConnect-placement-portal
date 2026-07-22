const express = require("express");
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");
const { authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", getEvents);
router.get("/:id", getEventById);
router.post("/", authorize("admin"), createEvent);
router.put("/:id", authorize("admin"), updateEvent);
router.delete("/:id", authorize("admin"), deleteEvent);

module.exports = router;
