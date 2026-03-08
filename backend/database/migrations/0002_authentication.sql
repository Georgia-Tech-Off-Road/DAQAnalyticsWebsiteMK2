BEGIN;
CREATE TABLE IF NOT EXISTS "User" (
	id TEXT PRIMARY KEY,
	email TEXT UNIQUE NOT NULL,
	display_name TEXT NOT NULL,
	role TEXT CHECK(role IN ('guest', 'member', 'daq', 'admin')) NOT NULL,
	last_login TEXT NOT NULL CHECK(last_login IS datetime(last_login, 'auto')),
	created_at TEXT NOT NULL CHECK(created_at IS datetime(created_at, 'auto')),
    updated_at TEXT NOT NULL CHECK(updated_at IS datetime(updated_at, 'auto'))
);
CREATE TABLE IF NOT EXISTS AuthProvider (
	id TEXT PRIMARY KEY,
	user_id TEXT REFERENCES User(id) ON DELETE CASCADE,
	provider_type TEXT NOT NULL, -- local, saml
	provider_uid TEXT NOT NULL,
	password_hash TEXT, -- non-null ONLY for local accounts
	UNIQUE(provider_type, provider_uid)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_authProvider_user ON AuthProvider(user_id);

COMMIT;
