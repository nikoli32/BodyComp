const assert = require("node:assert/strict");
const test = require("node:test");
const {
  leanMassKg,
  nextMuscleIndex,
  recoveryLabel,
  weightFromKg,
  weightToKg,
} = require("../ui-utils.js");

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

test("lean mass is calculated from weight and body fat", () => {
  assert.equal(leanMassKg(80, 20), 64);
  assert.equal(leanMassKg(80.25, 18.5), 65.4);
});

test("weight conversion rounds to stored precision", () => {
  assert.equal(weightToKg(180, "lb"), 81.65);
  assert.equal(weightFromKg(81.65, "lb"), 180.01);
  assert.equal(weightToKg(72.34, "kg"), 72.34);
  assert.equal(weightFromKg(72.34, "kg"), 72.34);
});
