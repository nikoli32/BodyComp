# Muscle Recovery API

This service records workouts and calculates the recovery state for every muscle group used by the interactive map.

## Local setup

1. Create a PostgreSQL database named `muscle_recovery`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`.
3. Run `npm install`, then `npm run migrate` and `npm run dev`.

## API

- `POST /api/users` creates a user for the current MVP.
- `GET /api/exercises` returns seeded exercises and their affected muscles.
- `POST /api/workouts` records a completed workout with exercise sets.
- `GET /api/workouts?userId=<uuid>` returns a user's workout history.
- `GET /api/muscles/recovery?userId=<uuid>` returns every map muscle with `status`: `needs_recovery` (red) or `ready` (blue).
- `GET /api/muscles/:slug/history?userId=<uuid>` returns workouts that affected the clicked muscle.

`userId` is intentionally an explicit request value until authentication is added. Replace it with an authenticated user identity before deploying publicly.
