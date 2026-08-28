# Muscle Recovery Map

An open-source workout tracker that shows muscle recovery on an interactive body map.

## Run locally

1. Install PostgreSQL and create a database named `muscle_recovery`.
2. In `backend`, copy `.env.example` to `.env` and set `DATABASE_URL`.
3. Run `npm install`, `npm run migrate`, then `npm run dev` from `backend`.
4. Open `http://localhost:3000/auth.html`, create an account, then log a workout or inspect the recovery map. The backend serves the frontend, keeping the session cookie same-origin.

The frontend connects to `http://localhost:3000` by default. To host it separately, define `window.MUSCLE_RECOVERY_API_URL` before loading `api.js` and set `FRONTEND_ORIGIN` in the backend environment.

Accounts use password hashes and HttpOnly session cookies; workout and recovery data is always scoped to the signed-in account.

## Verification

- Run `node --test test/ui-utils.test.js` from the project root for map keyboard-navigation and accessible recovery-label tests.
- Run `npm test` from `backend` for recovery-calculation and request-validation tests.
- Run `npm run check` from `backend` for TypeScript validation.

For production, set `NODE_ENV=production`, serve over HTTPS, and only set `FRONTEND_ORIGIN` when the frontend is deliberately hosted on a separate allowed origin.
