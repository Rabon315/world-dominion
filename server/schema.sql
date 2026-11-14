CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username VARCHAR(24) NOT NULL UNIQUE,
 email VARCHAR(254) NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS worlds (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(48) NOT NULL, invite_code VARCHAR(12) UNIQUE,
 mode VARCHAR(16) NOT NULL CHECK(mode IN ('persistent','private')),
 max_players INTEGER NOT NULL DEFAULT 150 CHECK(max_players BETWEEN 2 AND 500),
 status VARCHAR(16) NOT NULL DEFAULT 'open' CHECK(status IN ('open','paused','closed')),
 settings JSONB NOT NULL DEFAULT '{}'::jsonb, host_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE worlds ADD COLUMN IF NOT EXISTS invite_code VARCHAR(12) UNIQUE;
CREATE TABLE IF NOT EXISTS world_members (
 world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 role VARCHAR(16) NOT NULL DEFAULT 'player' CHECK(role IN ('owner','player','spectator')),
 joined_at TIMESTAMPTZ NOT NULL DEFAULT now(), last_seen TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(world_id,user_id)
);
CREATE INDEX IF NOT EXISTS world_members_user_idx ON world_members(user_id);
CREATE TABLE IF NOT EXISTS world_state (
 world_id UUID PRIMARY KEY REFERENCES worlds(id) ON DELETE CASCADE, revision BIGINT NOT NULL DEFAULT 0,
 state JSONB NOT NULL, updated_by UUID REFERENCES users(id), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS world_events (
 id BIGSERIAL PRIMARY KEY, world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
 actor_user_id UUID REFERENCES users(id), event_type VARCHAR(64) NOT NULL,
 payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS world_events_world_id_id_idx ON world_events(world_id,id);
