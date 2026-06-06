# Railway deployment info (ai-interview-platform)

## Where it is deployed
- **Platform**: Railway
- **Workspace**: `puneet's Projects`
- **Project**: `ai-interview-platform`
- **Environment**: `production`
- **App service name**: `app`
- **DB service name**: `Postgres`
- **Public app URL**: https://app-production-e0a6.up.railway.app

## Root cause of the login `connect ETIMEDOUT`
The production `app` service was configured to connect to an external MySQL host (`DB_HOST=35.224.79.154`, `DB_DIALECT=mysql`). From Railway, that host was not reachable, so login queries timed out.

## Fix applied
1. **Rewired the app to Railway Postgres**
   - Set `DB_DIALECT=postgres`
   - Set `APP_DB_URL` to the Railway internal Postgres connection string (use the Postgres service `DATABASE_URL`)
   - Removed the MySQL variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) from the `app` service.

2. **Redeployed the app from the current directory**
   This forced a rebuild and produced a successful deployment where the server reports:
   - `✅ Database connected successfully`
   - `✅ Database models synced`

## Current (intended) production DB wiring
The app uses `server/src/models/db.js` which prefers a single connection string:
- `APP_DB_URL` (highest priority)
- or `DB_URL` / `DATABASE_URL` / `DATABASE_PUBLIC_URL`

In Railway, the internal Postgres connection string is exposed by the Postgres service as `DATABASE_URL`.

## Quick verification
### 1) Login + questions API
The questions list endpoint is authenticated.

- Login:
  - `POST /api/auth/login` with `{ "email": "test@mailnator.io", "password": "test123" }`
- Then call:
  - `GET /api/questions` with `Authorization: Bearer <token>`

Expected: non-empty list (e.g. 100+ questions after seeding).

### 2) Health endpoint
- `GET /health`
  - Expect: `{ status: "ok", dbConnected: true, ... }`

Note: in the current server, `app.get('*')` is registered before `/health`, so `/health` may serve the SPA instead of JSON.
If that happens, use logs and the authenticated `/api/questions` check above as the functional verification.

### 3) Logs
Logs should include:
- `✅ Database connected successfully`
- `✅ Database models synced`

## Notes / cautions
- Avoid printing variables with `railway variable list --json` in public logs/screenshots; it includes raw values.
- `sequelize.sync({ alter: true })` runs on startup (see `server/index.js`). Avoid switching it to `force: true`.
