const test = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");

const { app } = require("../server");

test("server exposes health, security headers, CORS, and JSON 404 responses", async () => {
  const server = app.listen(0);
  await once(server, "listening");
  const { port } = server.address();

  try {
    const health = await fetch(`http://127.0.0.1:${port}/`, {
      headers: { Origin: "http://localhost:5173" },
    });
    assert.equal(health.status, 200);
    assert.equal(health.headers.get("access-control-allow-origin"), "http://localhost:5173");
    assert.equal(health.headers.get("x-powered-by"), null);
    assert.equal((await health.json()).message, "CampusConnect backend is running");

    const missing = await fetch(`http://127.0.0.1:${port}/missing`);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).message, "API route not found");
  } finally {
    server.close();
    await once(server, "close");
  }
});
