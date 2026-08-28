const assert = require("node:assert/strict");
const test = require("node:test");
const { nextMuscleIndex, recoveryLabel } = require("../ui-utils.js");

test("keyboard map navigation wraps across visible muscle groups", () => {
  assert.equal(nextMuscleIndex(-1, "next", 9), 0);
  assert.equal(nextMuscleIndex(8, "next", 9), 0);
  assert.equal(nextMuscleIndex(0, "previous", 9), 8);
  assert.equal(nextMuscleIndex(-1, "previous", 9), 8);
  assert.equal(nextMuscleIndex(3, "first", 9), 0);
  assert.equal(nextMuscleIndex(3, "last", 9), 8);
});

test("recovery state has clear accessible text", () => {
  assert.equal(recoveryLabel("ready"), "ready to train");
  assert.equal(recoveryLabel("needs_recovery"), "recovering");
  assert.equal(recoveryLabel(undefined), "recovery status loading");
});
