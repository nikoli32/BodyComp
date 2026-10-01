# Muscle Recovery API

This service records workouts and calculates the recovery state for every muscle group used by the interactive map.

## Local setup

1. Create a PostgreSQL database named `muscle_recovery`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`.
3. Run `npm install`, then `npm run migrate` and `npm run dev`.
4. Open `http://localhost:3000/auth.html` to create an account. The API serves the frontend too, so authentication uses a same-origin HttpOnly cookie.

## API

- `POST /api/auth/register` creates an account and starts a session.
- `POST /api/auth/login`, `POST /api/auth/logout`, and `GET /api/auth/me` manage the session.
- `GET /api/exercises` returns seeded exercises and custom exercises owned by the signed-in user.
- `POST /api/exercises` creates a private custom exercise for the signed-in user.
- `GET /api/custom-exercises` lists the signed-in user's editable custom exercises.
- `PUT /api/custom-exercises/:exerciseId` replaces the muscle assignments for an owned custom exercise.
- `POST /api/workouts` records a completed workout with exercise sets.
- `GET /api/workouts` returns the signed-in user's workout history.
- `PUT /api/workouts/:workoutId` edits a workout owned by the signed-in user.
- `DELETE /api/workouts/:workoutId` deletes a workout owned by the signed-in user.
- `GET /api/muscles/recovery` returns every map muscle with `status`: `needs_recovery` (red) or `ready` (blue). Per-muscle cold-start estimates are personalized from repeat-exercise performance when at least three repeat intervals are available; this is a training-history proxy, not a direct recovery measurement.
- `GET /api/muscles/:slug/history` returns the signed-in user's workouts that affected the clicked muscle.

All exercise, workout, and recovery routes require an authenticated session. Custom exercises are private to their creator; existing ownerless exercises remain shared catalog entries and are not editable. Set `NODE_ENV=production` and use HTTPS in production so the session cookie is marked `Secure`.
