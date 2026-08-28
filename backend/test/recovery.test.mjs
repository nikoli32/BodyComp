import assert from "node:assert/strict";
import test from "node:test";
import { calculateRecovery } from "../dist/recovery.js";

test("an untrained muscle is ready", () => {
  assert.deepEqual(calculateRecovery(null, 72, new Date("2026-08-27T12:00:00Z")), { status: "ready", recoveredAt: null });
});

test("a muscle remains in recovery before its deadline", () => {
  const result = calculateRecovery(new Date("2026-08-25T12:00:00Z"), 72, new Date("2026-08-27T12:00:00Z"));
  assert.equal(result.status, "needs_recovery");
  assert.equal(result.recoveredAt?.toISOString(), "2026-08-28T12:00:00.000Z");
});

test("a muscle is ready exactly at its recovery deadline", () => {
  const result = calculateRecovery(new Date("2026-08-24T12:00:00Z"), 72, new Date("2026-08-27T12:00:00Z"));
  assert.equal(result.status, "ready");
});
