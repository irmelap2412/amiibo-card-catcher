BEGIN;

-- Users
CREATE TABLE IF NOT EXISTS "users" (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  image      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Session
CREATE TABLE IF NOT EXISTS "session" (
  id         TEXT PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL,
  token      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  user_id    TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE
);

-- Account
CREATE TABLE IF NOT EXISTS "account" (
  id                    TEXT PRIMARY KEY,
  account_id            TEXT NOT NULL,
  provider_id           TEXT NOT NULL,
  user_id               TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  access_token          TEXT,
  refresh_token         TEXT,
  id_token              TEXT,
  access_token_expires_at TIMESTAMPTZ,
  refresh_token_expires_at TIMESTAMPTZ,
  scope                 TEXT,
  password              TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Verification
CREATE TABLE IF NOT EXISTS "verification" (
  id         TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value      TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Collection
CREATE TABLE IF NOT EXISTS collection (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  amiibo_id   TEXT NOT NULL,
  amiibo_name TEXT NOT NULL,
  amiibo_image TEXT,
  amiibo_series TEXT,
  amiibo_type  TEXT,
  category    TEXT NOT NULL CHECK (category IN ('favorite', 'owned', 'wanted')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, amiibo_id, category)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_collection_user_id 
ON collection(user_id);

CREATE INDEX IF NOT EXISTS idx_collection_category 
ON collection(user_id, category);

COMMIT;
