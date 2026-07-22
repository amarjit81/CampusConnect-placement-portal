import test from "node:test";
import assert from "node:assert/strict";

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
globalThis.window = { dispatchEvent() {} };

const { ApiError, campusApi, setAuthToken } = await import("./api.js");

test("API errors preserve HTTP status and server messages", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ message: "You do not have permission" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });

  await assert.rejects(
    campusApi.createOpportunity({ company: "Example" }),
    (error) =>
      error instanceof ApiError &&
      error.status === 403 &&
      error.message === "You do not have permission" &&
      error.isNetworkError === false,
  );
});

test("network failures are distinguishable from rejected API writes", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("fetch failed");
  };

  await assert.rejects(
    campusApi.getOpportunities(),
    (error) => error instanceof ApiError && error.isNetworkError === true,
  );
});

test("authenticated requests send the current bearer token", async () => {
  setAuthToken("test-token");
  let receivedHeaders;
  globalThis.fetch = async (url, options) => {
    receivedHeaders = options.headers;
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  await campusApi.getOpportunities();
  assert.equal(receivedHeaders.Authorization, "Bearer test-token");
  setAuthToken(null);
});
