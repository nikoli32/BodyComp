import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMuscleRecovery,
  calculateRecovery,
  deriveStrengthBaseline,
  estimatePersonalRecoveryHours,
  recoveryDemandAt,
  relativeIntensity,
  setStimulus,
  stimulusToDemand,
} from "../dist/recovery.js";

function repeatedSets(intervalHours, count, weightKg = 80) {
  return Array.from({ length: count }, (_, index) => ({
    setId: String(index),
    workoutId: String(index),
    exerciseId: 1,
    exerciseName: "Squat",
    muscleSlug: "quadriceps",
    muscleName: "Quadriceps",
    role: "primary",
    loadFactor: 1,
    weightKg,
    reps: 8,
    rir: 2,
    trainedAt: new Date(Date.UTC(2026, 0, 1) + index * intervalHours * 36e5),
  }));
}

test("an untrained muscle is ready", () => {
  assert.deepEqual(
    calculateRecovery(null, 72, new Date("2026-08-27T12:00:00Z")),
    { status: "ready", recoveredAt: null },
  );
});

test("a muscle remains in recovery before its deadline", () => {
  const result = calculateRecovery(
    new Date("2026-08-25T12:00:00Z"),
    72,
    new Date("2026-08-27T12:00:00Z"),
  );
  assert.equal(result.status, "needs_recovery");
  assert.equal(result.recoveredAt?.toISOString(), "2026-08-28T12:00:00.000Z");
});

test("a muscle is ready exactly at its recovery deadline", () => {
  const result = calculateRecovery(
    new Date("2026-08-24T12:00:00Z"),
    72,
    new Date("2026-08-27T12:00:00Z"),
  );
  assert.equal(result.status, "ready");
});

test("the same load is harder for a user with a lower exercise baseline", () => {
  const hardSet = { weightKg: 40.8, reps: 10, rir: 0 }; // 90 lb, normalized to kg
  assert.ok(relativeIntensity(hardSet, 55) > relativeIntensity(hardSet, 90));
});

test("equivalent relative efforts produce similar stimulus at different absolute loads", () => {
  const lighterUserSet = { weightKg: 31.8, reps: 10, rir: 0 }; // 70 lb
  const strongerUserSet = { weightKg: 40.8, reps: 10, rir: 0 }; // 90 lb
  const lighterBaseline = deriveStrengthBaseline([lighterUserSet]).strength;
  const strongerBaseline = deriveStrengthBaseline([strongerUserSet]).strength;
  assert.ok(
    Math.abs(
      setStimulus(lighterUserSet, lighterBaseline, 1) -
        setStimulus(strongerUserSet, strongerBaseline, 1),
    ) < 0.001,
  );
});

test("RIR, set count, and muscle role change recovery stimulus", () => {
  const set = { weightKg: 40, reps: 10, rir: 0 };
  const baseline = deriveStrengthBaseline([set, set, set]).strength;
  const hard = setStimulus(set, baseline, 1);
  const easier = setStimulus({ ...set, rir: 3 }, baseline, 1);
  assert.ok(
    hard > easier,
    "a set farther from failure should create less stimulus",
  );
  assert.ok(
    stimulusToDemand(hard * 3) > stimulusToDemand(hard),
    "three hard sets should exceed one",
  );
  assert.ok(
    setStimulus(set, baseline, 1) > setStimulus(set, baseline, 0.5),
    "primary loading should exceed secondary loading",
  );
});

test("demand decays with time and a new user fallback stays conservative", () => {
  const now = new Date("2026-08-27T12:00:00Z");
  assert.ok(
    recoveryDemandAt(80, new Date("2026-08-27T10:00:00Z"), 72, now) >
      recoveryDemandAt(80, new Date("2026-08-24T10:00:00Z"), 72, now),
  );
  assert.equal(
    recoveryDemandAt(80, new Date("2026-08-20T10:00:00Z"), 72, now),
    0,
  );
  assert.ok(
    relativeIntensity({ weightKg: 40, reps: 10, rir: 0 }, null) < 1,
    "one first set must not be treated as a proven maximum",
  );
});

test("personal recovery uses the muscle prior until enough repeat sessions exist", () => {
  const estimate = estimatePersonalRecoveryHours(
    "quadriceps",
    72,
    repeatedSets(48, 3),
  );
  assert.equal(estimate.hours, 72);
  assert.equal(estimate.sampleCount, 2);
  assert.equal(estimate.learned, false);
});

test("personal recovery learns a bounded estimate from repeat performance intervals", () => {
  const estimate = estimatePersonalRecoveryHours(
    "quadriceps",
    72,
    repeatedSets(48, 4),
  );
  assert.equal(estimate.sampleCount, 3);
  assert.equal(estimate.learned, true);
  assert.equal(estimate.hours, 63);
});

test("personal recovery estimates differ by user history and remain bounded", () => {
  const shorterIntervals = estimatePersonalRecoveryHours(
    "quadriceps",
    72,
    repeatedSets(48, 4),
  );
  const longerIntervals = estimatePersonalRecoveryHours(
    "quadriceps",
    72,
    repeatedSets(84, 4),
  );
  const outlierIntervals = estimatePersonalRecoveryHours(
    "quadriceps",
    72,
    repeatedSets(300, 4),
  );
  assert.ok(shorterIntervals.hours < longerIntervals.hours);
  assert.ok(outlierIntervals.hours <= 96);
  assert.ok(outlierIntervals.hours >= 18);
});

test("personal recovery only learns from the requested muscle", () => {
  const otherMuscle = repeatedSets(48, 4).map((set) => ({
    ...set,
    muscleSlug: "glutes",
  }));
  const estimate = estimatePersonalRecoveryHours("quadriceps", 60, otherMuscle);
  assert.equal(estimate.hours, 60);
  assert.equal(estimate.sampleCount, 0);
});

test("recovery output includes the personalized baseline and source evidence", () => {
  const muscle = {
    slug: "quadriceps",
    name: "Quadriceps",
    description: "Front thigh",
    recoveryHours: 72,
    regions: [],
  };
  const result = buildMuscleRecovery(
    [muscle],
    repeatedSets(48, 4),
    new Date("2026-01-10T00:00:00Z"),
  )[0];
  assert.equal(result.recoveryBaselineHours, 63);
  assert.equal(result.recoveryHistorySamples, 3);
  assert.equal(result.recoveryEstimateLearned, true);
});

test("recovery output keeps distinct muscle priors for users without history", () => {
  const muscles = [
    {
      slug: "forearms",
      name: "Forearms",
      description: "Grip",
      recoveryHours: 36,
      regions: [],
    },
    {
      slug: "glutes",
      name: "Glutes",
      description: "Hip extension",
      recoveryHours: 72,
      regions: [],
    },
  ];
  const result = buildMuscleRecovery(muscles, []);
  assert.deepEqual(
    result.map((muscle) => muscle.recoveryBaselineHours),
    [36, 72],
  );
  assert.ok(result.every((muscle) => !muscle.recoveryEstimateLearned));
});
