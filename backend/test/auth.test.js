const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("../models");
const authController = require("../controllers/authController");
const { authenticate, authorize } = require("../middleware/auth");

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

async function withMock(target, method, implementation, callback) {
  const original = target[method];
  target[method] = implementation;
  try {
    await callback();
  } finally {
    target[method] = original;
  }
}

function userRecord(overrides = {}) {
  return {
    _id: "507f1f77bcf86cd799439011",
    name: "Aarav Sharma",
    email: "student@campusconnect.edu",
    role: "student",
    isActive: true,
    lastLoginAt: undefined,
    async save() {},
    ...overrides,
  };
}

test("login requires both an email and password", async () => {
  const res = createResponse();
  await authController.login({ body: { email: "" } }, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /required/i);
});

test("login returns a signed token and a safe user payload", async () => {
  const passwordHash = await bcrypt.hash("Student@123", 4);
  const user = userRecord({ passwordHash });

  await withMock(
    User,
    "findOne",
    (query) => ({
      select: async (selection) => {
        assert.deepEqual(query, { email: "student@campusconnect.edu" });
        assert.equal(selection, "+passwordHash");
        return user;
      },
    }),
    async () => {
      const res = createResponse();
      await authController.login(
        {
          body: {
            email: "  STUDENT@campusconnect.edu ",
            password: "Student@123",
          },
        },
        res,
      );

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.user.email, "student@campusconnect.edu");
      assert.equal(res.body.user.passwordHash, undefined);
      assert.ok(user.lastLoginAt instanceof Date);

      const payload = jwt.verify(res.body.token, authController.getJwtSecret(), {
        issuer: "campusconnect",
      });
      assert.equal(payload.sub, String(user._id));
      assert.equal(payload.role, "student");
    },
  );
});

test("login rejects bad credentials and inactive accounts", async () => {
  const passwordHash = await bcrypt.hash("Student@123", 4);

  for (const user of [
    userRecord({ passwordHash }),
    userRecord({ passwordHash, isActive: false }),
  ]) {
    const password = user.isActive ? "wrong-password" : "Student@123";
    await withMock(
      User,
      "findOne",
      () => ({ select: async () => user }),
      async () => {
        const res = createResponse();
        await authController.login(
          { body: { email: user.email, password } },
          res,
        );
        assert.equal(res.statusCode, 401);
        assert.equal(res.body.message, "Invalid email or password");
      },
    );
  }
});

test("authenticate rejects requests without a bearer token", async () => {
  const req = { get: () => undefined };
  const res = createResponse();
  let nextCalled = false;

  await authenticate(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});

test("authenticate verifies the token and loads the active user", async () => {
  const user = userRecord();
  const token = jwt.sign(
    { sub: String(user._id), role: user.role },
    authController.getJwtSecret(),
    { expiresIn: "5m", issuer: "campusconnect" },
  );

  await withMock(
    User,
    "findOne",
    (query) => ({
      select: async (selection) => {
        assert.deepEqual(query, { _id: String(user._id), isActive: true });
        assert.equal(selection, "_id name email role isActive");
        return user;
      },
    }),
    async () => {
      const req = { get: () => `Bearer ${token}` };
      const res = createResponse();
      let nextCalled = false;

      await authenticate(req, res, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, true);
      assert.equal(req.user, user);
      assert.equal(res.body, undefined);
    },
  );
});

test("authenticate rejects invalid tokens", async () => {
  const req = { get: () => "Bearer not-a-valid-token" };
  const res = createResponse();

  await authenticate(req, res, () => assert.fail("next must not be called"));

  assert.equal(res.statusCode, 401);
  assert.match(res.body.message, /invalid or expired/i);
});

test("current-user endpoint serializes the authenticated account", () => {
  const res = createResponse();
  authController.getCurrentUser({ user: userRecord() }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.user, {
    id: "507f1f77bcf86cd799439011",
    name: "Aarav Sharma",
    email: "student@campusconnect.edu",
    role: "student",
  });
});

test("authorize allows matching roles and rejects other roles", () => {
  const adminOnly = authorize("admin");
  let nextCalled = false;
  adminOnly({ user: { role: "admin" } }, createResponse(), () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);

  const res = createResponse();
  adminOnly({ user: { role: "student" } }, res, () => {
    assert.fail("next must not be called");
  });
  assert.equal(res.statusCode, 403);
  assert.match(res.body.message, /permission/i);
});
