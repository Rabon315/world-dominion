# WORLD DOMINION Multiplayer Backend — Phase 1

Backend foundation for the existing HTML/CSS/JavaScript game:
- JWT account registration/login
- persistent and private worlds
- player membership and capacity from 2 to 500 (150+ target)
- Socket.IO room presence and world chat
- PostgreSQL snapshot persistence with revision conflict checks
- optional Redis adapter for multi-instance Socket.IO fanout

## Deploy to Render

1. Push this project to GitHub.
2. In Render select **New → Blueprint** and choose the repository. Render reads `server/render.yaml`.
3. Wait for the PostgreSQL database and web service to become healthy.
4. Test `https://YOUR-SERVICE.onrender.com/health`.
5. Set `CLIENT_ORIGINS` to the actual game origin before production. Keep `JWT_SECRET` private.

For a persistent always-on world use an always-on paid web service. Free instances may spin down and interrupt realtime sessions. The Blueprint uses a small paid service and database plan; check current Render pricing before deployment.

## Local run

```sh
cd server
cp .env.example .env
# Set DATABASE_URL and JWT_SECRET
npm install
npm start
```

## REST API

- `POST /api/auth/register` — `{ "username":"...", "email":"...", "password":"..." }`
- `POST /api/auth/login` — `{ "email":"...", "password":"..." }`
- `GET /api/worlds` — Bearer token
- `POST /api/worlds` — `{ "name":"...", "mode":"persistent", "maxPlayers":150 }`
- `POST /api/worlds/:id/join` — Bearer token

## Socket.IO

Connect with `auth: { token }`.
- `world:join` — `{ worldId }`
- `world:state:save` — `{ worldId, state, expectedRevision }`
- `world:state:updated` — state broadcast to other room members
- `world:command` currently supports `chat:message` only

## Critical phase boundary

The current browser game runs its simulation in client JavaScript (`dispatch()`, `worldTick()`, `snapshot()/restore()`). This phase supplies account/world/realtime/persistence infrastructure, but does **not** yet make economy, combat, diplomacy, AI or game time authoritative online. Gameplay commands are intentionally rejected until those rules are moved into server-side services. Do not trust client-authored snapshots for a competitive game.

## Scaling beyond 100 players

Use one authoritative simulation worker per world (or partition work by world id), Redis adapter for Socket.IO fanout across multiple web instances, PostgreSQL as durable source of truth, periodic checkpoints plus an append-only command/event log, and load testing for concurrent connections and tick latency. Socket connections alone do not make the simulation scalable; the server-side game loop is the next implementation phase.

Private worlds return a one-time-to-share `invite_code` from the create-world response. Pass it as `{ "inviteCode":"..." }` when calling the join endpoint. Keep private invite codes out of public listings.
