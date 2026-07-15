const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const {
  StudentProfile,
  Opportunity,
  Application,
  Announcement,
  Event,
} = require("../models");

const userId = new mongoose.Types.ObjectId();
const opportunityId = new mongoose.Types.ObjectId();

function validOpportunity(overrides = {}) {
  return new Opportunity({
    createdBy: userId,
    company: "TechNova",
    role: "Engineer",
    description: "Build useful software.",
    location: "Bengaluru",
    package: "Rs. 8 LPA",
    eligibleBranches: [" cse ", "CSE", " it "],
    minimumCgpa: 7,
    maximumBacklogs: 0,
    graduationYear: 2027,
    deadline: new Date("2026-08-20"),
    applicationLink: "https://example.com/apply",
    status: "active",
    ...overrides,
  });
}

test("opportunity normalizes and removes duplicate branch names", async () => {
  const opportunity = validOpportunity();
  await opportunity.validate();
  assert.deepEqual(opportunity.eligibleBranches, ["CSE", "IT"]);
});

test("opportunity rejects fractional backlog limits and unsafe links", async () => {
  const opportunity = validOpportunity({
    maximumBacklogs: 1.5,
    applicationLink: "javascript:alert(1)",
  });
  const error = await opportunity.validate().catch((validationError) => validationError);
  assert.ok(error.errors.maximumBacklogs);
  assert.ok(error.errors.applicationLink);
});

test("student profile requires whole-number backlogs and normalizes skills", async () => {
  const profile = new StudentProfile({
    user: userId,
    enrollmentNumber: "cse2027-042",
    branch: "cse",
    cgpa: 7.8,
    activeBacklogs: 0,
    graduationYear: 2027,
    skills: [" React ", "React", " Node.js "],
  });
  await profile.validate();
  assert.equal(profile.enrollmentNumber, "CSE2027-042");
  assert.equal(profile.branch, "CSE");
  assert.deepEqual(profile.skills, ["React", "Node.js"]);

  profile.activeBacklogs = 0.5;
  const error = await profile.validate().catch((validationError) => validationError);
  assert.ok(error.errors.activeBacklogs);
});

test("application limits tracker text lengths", async () => {
  const application = new Application({
    student: userId,
    opportunity: opportunityId,
    currentRound: "x".repeat(161),
    nextStep: "x".repeat(501),
  });
  const error = await application.validate().catch((validationError) => validationError);
  assert.ok(error.errors.currentRound);
  assert.ok(error.errors.nextStep);
});

test("announcement rejects non-HTTP attachment URLs", async () => {
  const announcement = new Announcement({
    createdBy: userId,
    title: "Schedule",
    message: "Schedule available.",
    body: "Check the schedule.",
    attachment: { url: "file:///schedule.pdf" },
  });
  const error = await announcement.validate().catch((validationError) => validationError);
  assert.ok(error.errors["attachment.url"]);
});

test("event supports placement workflow fields and validates its time range", async () => {
  const event = new Event({
    createdBy: userId,
    opportunity: opportunityId,
    title: "Online assessment",
    description: "Complete the assessment.",
    company: "TechNova",
    role: "Engineer",
    eventType: "online-assessment",
    status: "confirmed",
    startsAt: new Date("2026-08-20T10:00:00.000Z"),
    endsAt: new Date("2026-08-20T11:00:00.000Z"),
    location: "Online",
  });
  await event.validate();
  assert.equal(event.status, "confirmed");

  event.endsAt = new Date("2026-08-20T09:00:00.000Z");
  const error = await event.validate().catch((validationError) => validationError);
  assert.ok(error.errors.endsAt);
});
