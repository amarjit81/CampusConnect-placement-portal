const test = require("node:test");
const assert = require("node:assert/strict");

const { Announcement, Application, Event, Opportunity } = require("../models");
const applicationController = require("../controllers/applicationController");
const announcementController = require("../controllers/announcementController");
const eventController = require("../controllers/eventController");
const opportunityController = require("../controllers/opportunityController");

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

async function withMock(target, method, implementation, callback) {
  const original = target[method];
  target[method] = implementation;
  try { await callback(); } finally { target[method] = original; }
}

test("student opportunity list excludes drafts", async () => {
  let receivedFilter;
  await withMock(
    Opportunity,
    "find",
    (filter) => {
      receivedFilter = filter;
      return { sort: async () => [] };
    },
    async () => {
      await opportunityController.getOpportunities(
        { user: { role: "student" } },
        createResponse(),
      );
    },
  );
  assert.deepEqual(receivedFilter, { status: { $ne: "draft" } });
});

test("student announcement list includes only student-visible audiences", async () => {
  let receivedFilter;
  await withMock(
    Announcement,
    "find",
    (filter) => {
      receivedFilter = filter;
      return { sort: async () => [] };
    },
    async () => {
      await announcementController.getAnnouncements(
        { user: { role: "student" } },
        createResponse(),
      );
    },
  );
  assert.deepEqual(receivedFilter, {
    audience: { $in: ["all", "students"] },
  });
});

test("student event list combines audience and upcoming filters", async () => {
  let receivedFilter;
  await withMock(
    Event,
    "find",
    (filter) => {
      receivedFilter = filter;
      return { sort: async () => [] };
    },
    async () => {
      await eventController.getEvents(
        { user: { role: "student" }, query: { upcoming: "true" } },
        createResponse(),
      );
    },
  );
  assert.deepEqual(receivedFilter.audience, { $in: ["all", "students"] });
  assert.ok(receivedFilter.startsAt.$gte instanceof Date);
});

test("students cannot open draft or admin-only records by id", async () => {
  await withMock(
    Opportunity,
    "findById",
    async () => ({ _id: "opportunity-id", status: "draft" }),
    async () => {
      const res = createResponse();
      await opportunityController.getOpportunityById(
        { user: { role: "student" }, params: { id: "opportunity-id" } },
        res,
      );
      assert.equal(res.statusCode, 404);
    },
  );

  await withMock(
    Announcement,
    "findById",
    async () => ({ _id: "announcement-id", audience: "admins" }),
    async () => {
      const res = createResponse();
      await announcementController.getAnnouncementById(
        { user: { role: "student" }, params: { id: "announcement-id" } },
        res,
      );
      assert.equal(res.statusCode, 404);
    },
  );
});

test("application list is user-scoped for students and complete for admins", async () => {
  const receivedFilters = [];
  await withMock(
    Application,
    "find",
    (filter) => {
      receivedFilters.push(filter);
      return {
        populate() { return this; },
        async sort() { return []; },
      };
    },
    async () => {
      await applicationController.getApplications(
        { user: { _id: "student-id", role: "student" } },
        createResponse(),
      );
      await applicationController.getApplications(
        { user: { _id: "admin-id", role: "admin" } },
        createResponse(),
      );
    },
  );
  assert.deepEqual(receivedFilters, [{ student: "student-id" }, {}]);
});
