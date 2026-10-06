import assert from "node:assert/strict";
import test from "node:test";
import {
  accountInput,
  bodyweightInput,
  customExerciseInput,
  customExerciseMusclesInput,
  workoutInput,
} from "../dist/validation.js";

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

const validBodyweightMeasurement = {
  recordedAt: "2026-08-27T10:00:00.000Z",
  weightKg: 80,
  bodyFatPercent: 20,
};

test("workout validation accepts a complete set", () => {
  assert.equal(workoutInput.safeParse(validWorkout).success, true);
});

test("workout validation rejects a set without reps or duration", () => {
  assert.equal(
    workoutInput.safeParse({
      ...validWorkout,
      exercises: [{ exerciseId: 1, sets: [{ weightKg: 60 }] }],
    }).success,
    false,
  );
});

test("workout validation accepts exercise notes and timed sets", () => {
  assert.equal(
    workoutInput.safeParse({
      ...validWorkout,
      exercises: [
        {
          exerciseId: 1,
          notes: "Tempo work",
          sets: [
            { durationSeconds: 45, completedAt: "2026-08-27T10:30:00.000Z" },
          ],
        },
      ],
    }).success,
    true,
  );
});

test("workout validation rejects exercises without sets", () => {
  assert.equal(
    workoutInput.safeParse({
      ...validWorkout,
      exercises: [{ exerciseId: 1, sets: [] }],
    }).success,
    false,
  );
});

test("workout validation bounds exercises and sets per exercise", () => {
  assert.equal(
    workoutInput.safeParse({
      ...validWorkout,
      exercises: Array.from({ length: 51 }, () => validWorkout.exercises[0]),
    }).success,
    false,
  );
  assert.equal(
    workoutInput.safeParse({
      ...validWorkout,
      exercises: [
        {
          exerciseId: 1,
          sets: Array.from({ length: 101 }, () => ({ reps: 8 })),
        },
      ],
    }).success,
    false,
  );
});

test("workout validation caps the total sets in a request", () => {
  assert.equal(
    workoutInput.safeParse({
      ...validWorkout,
      exercises: Array.from({ length: 6 }, (_, index) => ({
        exerciseId: index + 1,
        sets: Array.from({ length: 100 }, () => ({ reps: 8 })),
      })),
    }).success,
    false,
  );
});

test("workout validation rejects an inverted time range", () => {
  assert.equal(
    workoutInput.safeParse({
      ...validWorkout,
      startedAt: validWorkout.finishedAt,
      finishedAt: validWorkout.startedAt,
    }).success,
    false,
  );
});

test("custom exercise validation accepts primary and multiple secondary muscle groups", () => {
  assert.equal(
    customExerciseInput.safeParse(validCustomExercise).success,
    true,
  );
});

test("custom exercise validation rejects duplicate muscle assignments", () => {
  assert.equal(
    customExerciseInput.safeParse({
      ...validCustomExercise,
      muscles: [
        { muscleGroupId: 1, role: "primary" },
        { muscleGroupId: 1, role: "secondary" },
      ],
    }).success,
    false,
  );
});

test("custom exercise muscle updates accept assignments without an exercise name", () => {
  assert.equal(
    customExerciseMusclesInput.safeParse({
      muscles: validCustomExercise.muscles,
    }).success,
    true,
  );
  assert.equal(
    customExerciseMusclesInput.safeParse({
      muscles: [{ muscleGroupId: 1, role: "secondary" }],
    }).success,
    false,
  );
});

test("account validation requires a strong-enough password", () => {
  assert.equal(
    accountInput.safeParse({ email: "user@example.com", password: "too-short" })
      .success,
    false,
  );
  assert.equal(
    accountInput.safeParse({
      email: "user@example.com",
      password: "a-secure-password",
    }).success,
    true,
  );
});

test("bodyweight validation accepts complete measurements", () => {
  assert.equal(
    bodyweightInput.safeParse(validBodyweightMeasurement).success,
    true,
  );
});

test("bodyweight validation rejects missing, nonpositive, or out-of-range values", () => {
  for (const measurement of [
    { ...validBodyweightMeasurement, weightKg: 0 },
    { ...validBodyweightMeasurement, weightKg: undefined },
    { ...validBodyweightMeasurement, bodyFatPercent: -0.1 },
    { ...validBodyweightMeasurement, bodyFatPercent: 100.1 },
    { ...validBodyweightMeasurement, bodyFatPercent: undefined },
  ]) {
    assert.equal(bodyweightInput.safeParse(measurement).success, false);
  }
});
