import { z } from "zod";

export const workoutInput = z.object({
  startedAt: z.string().datetime().optional(),
  finishedAt: z.string().datetime().optional(),
  notes: z.string().trim().max(2000).optional(),
  exercises: z.array(z.object({
    exerciseId: z.number().int().positive(),
    notes: z.string().trim().max(1000).optional(),
    sets: z.array(z.object({
      weightKg: z.number().nonnegative().optional(),
      reps: z.number().int().positive().optional(),
      durationSeconds: z.number().int().positive().optional(),
      rir: z.number().int().min(0).max(10).optional(),
      completedAt: z.string().datetime().optional(),
    }).refine((set) => set.reps !== undefined || set.durationSeconds !== undefined, "A set needs reps or duration.")).min(1),
  })).min(1),
}).refine((workout) => !workout.finishedAt || !workout.startedAt || workout.finishedAt >= workout.startedAt, {
  message: "finishedAt must be after startedAt.",
});

export const accountInput = z.object({
  email: z.string().email().max(320),
  password: z.string().min(12).max(256),
  displayName: z.string().trim().min(1).max(100).optional(),
});

export const loginInput = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(256),
});
