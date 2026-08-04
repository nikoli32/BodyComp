import "dotenv/config";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { z } from "zod";
import { pool } from "./db.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());

const uuid = z.string().uuid();
const workoutInput = z.object({
  userId: uuid,
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
      completedAt: z.string().datetime().optional()
    }).refine((set) => set.reps !== undefined || set.durationSeconds !== undefined, "A set needs reps or duration." )).min(1)
  })).min(1)
}).refine((workout) => !workout.finishedAt || !workout.startedAt || workout.finishedAt >= workout.startedAt, {
  message: "finishedAt must be after startedAt."
});

function requestUserId(req: Request, res: Response): string | undefined {
  const parsed = uuid.safeParse(req.query.userId);
  if (parsed.success) return parsed.data;
  res.status(400).json({ error: "A valid userId query parameter is required." });
  return undefined;
}

app.get("/health", async (_req, res) => {
  await pool.query("select 1");
  res.json({ ok: true });
});

app.post("/api/users", async (req, res, next) => {
  try {
    const input = z.object({ email: z.string().email(), displayName: z.string().trim().max(100).optional() }).parse(req.body);
    const result = await pool.query(
      "insert into users (email, display_name) values ($1, $2) returning id, email, display_name as \"displayName\", created_at as \"createdAt\"",
      [input.email.toLowerCase(), input.displayName ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
});

app.get("/api/exercises", async (_req, res, next) => {
  try {
    const result = await pool.query(`
      select e.id, e.name, e.instructions,
        coalesce(json_agg(json_build_object('slug', mg.slug, 'name', mg.name, 'role', em.role, 'loadFactor', em.load_factor) order by em.role, mg.name)
          filter (where mg.id is not null), '[]') as muscles
      from exercises e
      left join exercise_muscles em on em.exercise_id = e.id
      left join muscle_groups mg on mg.id = em.muscle_group_id
      group by e.id order by e.name
    `);
    res.json(result.rows);
  } catch (error) { next(error); }
});

app.post("/api/workouts", async (req, res, next) => {
  const parsed = workoutInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid workout payload.", details: parsed.error.flatten() });
  const input = parsed.data;
  const client = await pool.connect();
  try {
    await client.query("begin");
    const user = await client.query("select id from users where id = $1", [input.userId]);
    if (!user.rowCount) { await client.query("rollback"); return res.status(404).json({ error: "User not found." }); }
    const workout = await client.query<{ id: string }>(
      "insert into workouts (user_id, started_at, finished_at, notes) values ($1, $2, $3, $4) returning id",
      [input.userId, input.startedAt ?? new Date().toISOString(), input.finishedAt ?? null, input.notes ?? null]
    );
    for (const [exerciseIndex, exercise] of input.exercises.entries()) {
      const exists = await client.query("select id from exercises where id = $1", [exercise.exerciseId]);
      if (!exists.rowCount) throw new Error(`Exercise ${exercise.exerciseId} does not exist.`);
      const workoutExercise = await client.query<{ id: string }>(
        "insert into workout_exercises (workout_id, exercise_id, position, notes) values ($1, $2, $3, $4) returning id",
        [workout.rows[0].id, exercise.exerciseId, exerciseIndex + 1, exercise.notes ?? null]
      );
      for (const [setIndex, set] of exercise.sets.entries()) {
        await client.query(
          "insert into workout_sets (workout_exercise_id, set_number, weight_kg, reps, duration_seconds, rir, completed_at) values ($1, $2, $3, $4, $5, $6, $7)",
          [workoutExercise.rows[0].id, setIndex + 1, set.weightKg ?? null, set.reps ?? null, set.durationSeconds ?? null, set.rir ?? null, set.completedAt ?? null]
        );
      }
    }
    await client.query("commit");
    res.status(201).json({ id: workout.rows[0].id });
  } catch (error) {
    await client.query("rollback");
    next(error);
  } finally { client.release(); }
});

app.get("/api/workouts", async (req, res, next) => {
  const userId = requestUserId(req, res); if (!userId) return;
  try {
    const result = await pool.query(`
      select w.id, w.started_at as "startedAt", w.finished_at as "finishedAt", w.notes,
        coalesce(json_agg(json_build_object('id', we.id, 'name', e.name, 'sets', set_totals.set_count) order by we.position)
          filter (where we.id is not null), '[]') as exercises
      from workouts w
      left join workout_exercises we on we.workout_id = w.id
      left join exercises e on e.id = we.exercise_id
      left join lateral (select count(*)::int as set_count from workout_sets ws where ws.workout_exercise_id = we.id) set_totals on true
      where w.user_id = $1
      group by w.id order by w.started_at desc
    `, [userId]);
    res.json(result.rows);
  } catch (error) { next(error); }
});

app.get("/api/muscles/recovery", async (req, res, next) => {
  const userId = requestUserId(req, res); if (!userId) return;
  try {
    const result = await pool.query(`
      with last_training as (
        select em.muscle_group_id, max(coalesce(ws.completed_at, w.finished_at, w.started_at)) as last_trained_at
        from workouts w
        join workout_exercises we on we.workout_id = w.id
        join workout_sets ws on ws.workout_exercise_id = we.id
        join exercise_muscles em on em.exercise_id = we.exercise_id
        where w.user_id = $1
        group by em.muscle_group_id
      )
      select mg.slug, mg.name, mg.description, mg.default_recovery_hours as "recoveryHours",
        lt.last_trained_at as "lastTrainedAt",
        lt.last_trained_at + make_interval(hours => mg.default_recovery_hours) as "recoveredAt",
        case when lt.last_trained_at is not null and now() < lt.last_trained_at + make_interval(hours => mg.default_recovery_hours)
          then 'needs_recovery' else 'ready' end as status,
        coalesce(json_agg(mr.region_key order by mr.region_key) filter (where mr.id is not null), '[]') as regions
      from muscle_groups mg
      left join last_training lt on lt.muscle_group_id = mg.id
      left join muscle_regions mr on mr.muscle_group_id = mg.id
      group by mg.id, lt.last_trained_at
      order by mg.name
    `, [userId]);
    res.json(result.rows);
  } catch (error) { next(error); }
});

app.get("/api/muscles/:slug/history", async (req, res, next) => {
  const userId = requestUserId(req, res); if (!userId) return;
  try {
    const result = await pool.query(`
      select w.id as "workoutId", w.started_at as "startedAt", w.finished_at as "finishedAt", e.name as "exerciseName",
        em.role, count(ws.id)::int as "setCount", coalesce(sum(ws.reps), 0)::int as reps,
        coalesce(sum(ws.weight_kg * ws.reps), 0)::numeric(10,2) as "volumeKg"
      from muscle_groups mg
      join exercise_muscles em on em.muscle_group_id = mg.id
      join workout_exercises we on we.exercise_id = em.exercise_id
      join workouts w on w.id = we.workout_id and w.user_id = $1
      join exercises e on e.id = we.exercise_id
      left join workout_sets ws on ws.workout_exercise_id = we.id
      where mg.slug = $2
      group by w.id, e.id, em.role
      order by w.started_at desc, e.name
    `, [userId, req.params.slug]);
    res.json(result.rows);
  } catch (error) { next(error); }
});

app.use((error: unknown, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error(error);
  const message = error instanceof Error ? error.message : "Unexpected server error.";
  res.status(500).json({ error: message });
});

app.listen(port, () => console.log(`Muscle Recovery API listening on http://localhost:${port}`));
