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
- `GET /api/exercises` returns seeded exercises and their affected muscles.
- `POST /api/workouts` records a completed workout with exercise sets.
- `GET /api/workouts` returns the signed-in user's workout history.
- `GET /api/muscles/recovery` returns every map muscle with `status`: `needs_recovery` (red) or `ready` (blue).
- `GET /api/muscles/:slug/history` returns the signed-in user's workouts that affected the clicked muscle.

All workout and recovery routes require an authenticated session. Set `NODE_ENV=production` and use HTTPS in production so the session cookie is marked `Secure`.
