const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildEventFields,
  serializeEvent,
} = require("../controllers/eventController");
const {
  buildApplicationFields,
  serializeApplication,
} = require("../controllers/applicationController");
const { serializeProfile } = require("../controllers/profileController");

test("event API maps the existing frontend field names", () => {
  const fields = buildEventFields(
    {
      eventTitle: "Assessment",
      notes: "Bring a college ID.",
      eventType: "Online Assessment",
      status: "Confirmed",
      dateTime: "2026-08-20T10:00:00.000Z",
      location: "Lab 3",
      createdBy: "not-allowed",
    },
    true,
  );

  assert.equal(fields.title, "Assessment");
  assert.equal(fields.description, "Bring a college ID.");
  assert.equal(fields.eventType, "online-assessment");
  assert.equal(fields.status, "confirmed");
  assert.equal(fields.createdBy, undefined);
  assert.equal(
    new Date(fields.endsAt) - new Date(fields.startsAt),
    60 * 60 * 1000,
  );
});

test("event API returns both canonical and frontend-compatible fields", () => {
  const event = serializeEvent({
    _id: "event-id",
    title: "Interview",
    description: "Arrive early.",
    eventType: "interview",
    status: "scheduled",
    startsAt: new Date("2026-08-20T10:00:00.000Z"),
    endsAt: new Date("2026-08-20T11:00:00.000Z"),
    location: "T&P Cell",
  });

  assert.equal(event.eventTitle, "Interview");
  assert.equal(event.notes, "Arrive early.");
  assert.equal(event.eventType, "Interview");
  assert.equal(event.eventTypeCode, "interview");
  assert.equal(event.status, "Scheduled");
});

test("application API maps tracker fields and statuses", () => {
  const fields = buildApplicationFields({
    company: "Example Co",
    role: "Developer",
    appliedDate: "2026-07-15",
    applicationStatus: "In Progress",
  });
  assert.equal(fields.appliedAt, "2026-07-15");
  assert.equal(fields.status, "in-progress");

  const application = serializeApplication({
    _id: "application-id",
    company: fields.company,
    role: fields.role,
    appliedAt: new Date("2026-07-15T00:00:00.000Z"),
    currentRound: "Application Review",
    status: fields.status,
  });
  assert.equal(application.applicationStatus, "In Progress");
  assert.equal(application.company, "Example Co");
});

test("profile API exposes names used by the current student JSON", () => {
  const profile = serializeProfile(
    {
      _id: "profile-id",
      enrollmentNumber: "CSE2027-042",
      branch: "CSE",
      cgpa: 7.8,
      activeBacklogs: 0,
      graduationYear: 2027,
      skills: [],
    },
    { _id: "student-id", name: "Aarav Sharma", email: "student@example.com" },
  );

  assert.equal(profile.rollNumber, "CSE2027-042");
  assert.equal(profile.backlogs, 0);
  assert.equal(profile.name, "Aarav Sharma");
});
