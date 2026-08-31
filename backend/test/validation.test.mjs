import assert from "node:assert/strict";
import test from "node:test";
import { accountInput, customExerciseInput, workoutInput } from "../dist/validation.js";

const validWorkout = {
  startedAt: "2026-08-27T10:00:00.000Z",
  finishedAt: "2026-08-27T11:00:00.000Z",
  exercises: [{ exerciseId: 1, sets: [{ weightKg: 60, reps: 8, rir: 2 }] }],
};

const validCustomExercise = {
  name: "Bench Press",
  muscles: [
    { muscleGroupId: 1, role: "primary" },
    { muscleGroupId: 3, role: "secondary" },
    { muscleGroupId: 4, role: "secondary" },
  ],
};

test("workout validation accepts a complete set", () => {
  assert.equal(workoutInput.safeParse(validWorkout).success, true);
});

test("workout validation rejects a set without reps or duration", () => {
  assert.equal(workoutInput.safeParse({ ...validWorkout, exercises: [{ exerciseId: 1, sets: [{ weightKg: 60 }] }] }).success, false);
});

test("workout validation rejects an inverted time range", () => {
  assert.equal(workoutInput.safeParse({ ...validWorkout, startedAt: validWorkout.finishedAt, finishedAt: validWorkout.startedAt }).success, false);
});

test("custom exercise validation accepts primary and multiple secondary muscle groups", () => {
  assert.equal(customExerciseInput.safeParse(validCustomExercise).success, true);
});

test("custom exercise validation rejects duplicate muscle assignments", () => {
  assert.equal(customExerciseInput.safeParse({
    ...validCustomExercise,
    muscles: [
      { muscleGroupId: 1, role: "primary" },
      { muscleGroupId: 1, role: "secondary" },
    ],
  }).success, false);
});

test("account validation requires a strong-enough password", () => {
  assert.equal(accountInput.safeParse({ email: "user@example.com", password: "too-short" }).success, false);
  assert.equal(accountInput.safeParse({ email: "user@example.com", password: "a-secure-password" }).success, true);
});
