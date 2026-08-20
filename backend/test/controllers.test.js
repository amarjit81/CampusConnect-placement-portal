const test = require("node:test");
const assert = require("node:assert/strict");

const {
  Opportunity,
  Announcement,
  AnnouncementRead,
} = require("../models");
const opportunityController = require("../controllers/opportunityController");
const announcementController = require("../controllers/announcementController");

function createResponse() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function opportunityRecord(overrides = {}) {
  return {
    _id: "507f1f77bcf86cd799439011",
    company: "TechNova",
    role: "Engineer",
    description: "Build useful products.",
    opportunityType: "full-time",
    location: "Bengaluru",
    package: "Rs. 8 LPA",
    eligibleBranches: ["CSE"],
    minimumCgpa: 7,
    maximumBacklogs: 0,
    graduationYear: 2027,
    deadline: new Date("2026-08-20T18:29:59.000Z"),
    applicationLink: "https://example.com/apply",
    status: "active",
    ...overrides,
  };
}

function announcementRecord(overrides = {}) {
  return {
    _id: "507f1f77bcf86cd799439012",
    title: "Interview schedule",
    message: "The schedule is available.",
    body: "Check your assigned interview time.",
    important: true,
    audience: "students",
    publishedAt: new Date("2026-07-15T09:00:00.000Z"),
    attachment: {
      name: "schedule.pdf",
      type: "PDF",
      url: "https://example.com/schedule.pdf",
    },
    ...overrides,
  };
}

async function withMock(target, method, implementation, callback) {
  const original = target[method];
  target[method] = implementation;
  try {
    await callback();
  } finally {
    target[method] = original;
  }
}

test("opportunity list is read from MongoDB and serialized for React", async () => {
  await withMock(
    Opportunity,
    "find",
    () => ({ sort: async () => [opportunityRecord()] }),
    async () => {
      const res = createResponse();
      await opportunityController.getOpportunities({}, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body[0].id, "507f1f77bcf86cd799439011");
      assert.equal(res.body[0].deadline, "2026-08-20");
      assert.equal(res.body[0]._id, undefined);
    },
  );
});

test("opportunity can be fetched by id", async () => {
  await withMock(
    Opportunity,
    "findById",
    async () => opportunityRecord(),
    async () => {
      const res = createResponse();
      await opportunityController.getOpportunityById(
        { params: { id: "507f1f77bcf86cd799439011" } },
        res,
      );

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.company, "TechNova");
    },
  );
});

test("opportunity creation assigns the authenticated admin and ignores protected fields", async () => {
  let createdData;
  await withMock(
    Opportunity,
    "create",
    async (data) => {
      createdData = data;
      return opportunityRecord(data);
    },
    async () => {
      const res = createResponse();
      await opportunityController.createOpportunity(
        {
          user: { _id: "admin-id", role: "admin" },
          body: {
            ...opportunityRecord(),
            _id: "malicious-id",
            createdBy: "another-user",
          },
        },
        res,
      );

      assert.equal(res.statusCode, 201);
      assert.equal(createdData.createdBy, "admin-id");
      assert.equal(createdData._id, undefined);
    },
  );
});

test("opportunity update enables schema validation", async () => {
  let options;
  await withMock(
    Opportunity,
    "findByIdAndUpdate",
    async (id, updates, receivedOptions) => {
      options = receivedOptions;
      return opportunityRecord({ company: updates.company });
    },
    async () => {
      const res = createResponse();
      await opportunityController.updateOpportunity(
        { params: { id: "id" }, body: { company: "Updated", createdBy: "x" } },
        res,
      );

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.company, "Updated");
      assert.deepEqual(options, { new: true, runValidators: true });
    },
  );
});

test("opportunity delete returns 404 when the record does not exist", async () => {
  await withMock(
    Opportunity,
    "findByIdAndDelete",
    async () => null,
    async () => {
      const res = createResponse();
      await opportunityController.deleteOpportunity(
        { params: { id: "missing" } },
        res,
      );
      assert.equal(res.statusCode, 404);
    },
  );
});

test("announcement list is sorted by publication date and flattened for React", async () => {
  let sort;
  await withMock(
    Announcement,
    "find",
    () => ({
      sort: async (value) => {
        sort = value;
        return [announcementRecord()];
      },
    }),
    async () => {
      const res = createResponse();
      await announcementController.getAnnouncements({}, res);

      assert.equal(res.statusCode, 200);
      assert.deepEqual(sort, { publishedAt: -1 });
      assert.equal(res.body[0].attachmentName, "schedule.pdf");
      assert.equal(res.body[0].id, "507f1f77bcf86cd799439012");
    },
  );
});

test("announcement can be fetched by id", async () => {
  await withMock(
    Announcement,
    "findById",
    async () => announcementRecord(),
    async () => {
      const res = createResponse();
      await announcementController.getAnnouncementById(
        { params: { id: "507f1f77bcf86cd799439012" } },
        res,
      );
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.title, "Interview schedule");
    },
  );
});

test("announcement creation uses the authenticated admin and maps frontend fields", async () => {
  let createdData;
  await withMock(
    Announcement,
    "create",
    async (data) => {
      createdData = data;
      return announcementRecord(data);
    },
    async () => {
      const res = createResponse();
      await announcementController.createAnnouncement(
        {
          user: { _id: "admin-id", role: "admin" },
          body: {
            title: "New notice",
            message: "Read this notice.",
            date: "2026-07-20",
            important: false,
          },
        },
        res,
      );

      assert.equal(res.statusCode, 201);
      assert.equal(createdData.createdBy, "admin-id");
      assert.equal(createdData.body, "Read this notice.");
      assert.equal(createdData.publishedAt, "2026-07-20");
    },
  );
});

test("announcement update enables validation", async () => {
  let options;
  await withMock(
    Announcement,
    "findByIdAndUpdate",
    async (id, updates, receivedOptions) => {
      options = receivedOptions;
      return announcementRecord({ title: updates.title });
    },
    async () => {
      const res = createResponse();
      await announcementController.updateAnnouncement(
        { params: { id: "id" }, body: { title: "Updated notice" } },
        res,
      );
      assert.equal(res.body.title, "Updated notice");
      assert.deepEqual(options, { new: true, runValidators: true });
    },
  );
});

test("announcement can be deleted", async () => {
  await withMock(
    AnnouncementRead,
    "deleteMany",
    async (filter) => {
      assert.equal(String(filter.announcement), "507f1f77bcf86cd799439012");
    },
    async () => {
      await withMock(
        Announcement,
        "findByIdAndDelete",
        async () => announcementRecord(),
        async () => {
          const res = createResponse();
          await announcementController.deleteAnnouncement(
            { params: { id: "id" } },
            res,
          );
          assert.equal(res.statusCode, 200);
          assert.match(res.body.message, /deleted/i);
        },
      );
    },
  );
});

test("Mongoose validation failures return an API-safe 400 response", async () => {
  const validationError = new Error("Company is required");
  validationError.name = "ValidationError";

  await withMock(
    Opportunity,
    "findByIdAndUpdate",
    async () => {
      throw validationError;
    },
    async () => {
      const res = createResponse();
      await opportunityController.updateOpportunity(
        { params: { id: "id" }, body: { company: "" } },
        res,
      );
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.message, "Company is required");
    },
  );
});
