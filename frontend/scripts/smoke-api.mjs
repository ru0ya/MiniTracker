#!/usr/bin/env node
// Integration smoke tests for the MiniTracker Django API.
// Zero dependencies; requires Node 18+ (global fetch) and a running backend.
//
// Usage (from anywhere in the repo, with the backend running):
//   node frontend/scripts/smoke-api.mjs
//   BACKEND_URL=http://localhost:8000 node frontend/scripts/smoke-api.mjs

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

let failed = 0;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function api(path, init = {}) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  const body = await res.json().catch(() => null);
  return { res, body };
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`PASS  ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL  ${name}: ${err.message}`);
  }
}

const suffix = Date.now();
let createdId;

await test("create a ticket", async () => {
  const { res, body } = await api("/tickets/", {
    method: "POST",
    body: JSON.stringify({
      title: `smoke ${suffix}`,
      description: "created by integration test",
      status: "open",
      priority: "high",
    }),
  });
  assert(res.ok, `expected 2xx, got ${res.status}`);
  assert(body.id, "response should include an id");
  assert(body.created_at, "response should include created_at");
  assert(body.status === "open" && body.priority === "high", "status and priority should round-trip");
  createdId = body.id;
});

if (!createdId) {
  console.error("\nAborting: could not create a ticket.");
  process.exit(1);
}

await test("list includes the created ticket", async () => {
  const { res, body } = await api("/tickets/?limit=100");
  assert(res.ok, `expected 2xx, got ${res.status}`);
  assert(Array.isArray(body.results), "expected a paginated results array");
  assert(
    body.results.some((ticket) => ticket.id === createdId),
    "created ticket not found in the list",
  );
});

await test("update a ticket's status", async () => {
  const { res, body } = await api(`/tickets/${createdId}/`, {
    method: "PATCH",
    body: JSON.stringify({ status: "in_progress" }),
  });
  assert(res.ok, `expected 2xx, got ${res.status}`);
  assert(body.status === "in_progress", "status should have been updated");
});

await test("stats endpoint reports status counts", async () => {
  const [statsResult, listResult] = await Promise.all([
    api("/tickets/stats/"),
    api("/tickets/?limit=1"),
  ]);
  assert(statsResult.res.ok, `expected 2xx, got ${statsResult.res.status}`);
  assert(Array.isArray(statsResult.body), "expected an array of {status, count}");
  assert(statsResult.body.length > 0, "expected at least one status entry");
  const valid = new Set(["open", "in_progress", "closed"]);
  for (const entry of statsResult.body) {
    assert(valid.has(entry.status), `unexpected status "${entry.status}"`);
    assert(
      Number.isInteger(entry.count) && entry.count >= 0,
      "counts should be non-negative integers",
    );
  }
  const statsTotal = statsResult.body.reduce((sum, entry) => sum + entry.count, 0);
  assert(
    statsTotal === listResult.body.count,
    `stats total (${statsTotal}) should equal list count (${listResult.body.count})`,
  );
});

await test("delete the created ticket (cleanup)", async () => {
  const { res } = await api(`/tickets/${createdId}/`, { method: "DELETE" });
  assert(res.status === 204, `expected 204, got ${res.status}`);
});

if (failed > 0) {
  console.error(`\n${failed} test(s) failed.`);
  process.exit(1);
}
console.log("\nAll tests passed.");