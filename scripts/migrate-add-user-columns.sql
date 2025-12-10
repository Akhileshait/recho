-- Add missing columns to users table if they don't exist

-- Add provider column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'provider'
    ) THEN
        ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'google';
    END IF;
END $$;

-- Add provider_account_id column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'provider_account_id'
    ) THEN
        ALTER TABLE users ADD COLUMN provider_account_id VARCHAR(255);
    END IF;
END $$;

-- Add access_token column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'access_token'
    ) THEN
        ALTER TABLE users ADD COLUMN access_token TEXT;
    END IF;
END $$;

-- Add refresh_token column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'refresh_token'
    ) THEN
        ALTER TABLE users ADD COLUMN refresh_token TEXT;
    END IF;
END $$;

-- Add spotify_connected column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'spotify_connected'
    ) THEN
        ALTER TABLE users ADD COLUMN spotify_connected BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add spotify_access_token column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'spotify_access_token'
    ) THEN
        ALTER TABLE users ADD COLUMN spotify_access_token TEXT;
    END IF;
END $$;

-- Add spotify_refresh_token column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'spotify_refresh_token'
    ) THEN
        ALTER TABLE users ADD COLUMN spotify_refresh_token TEXT;
    END IF;
END $$;

-- Add is_online column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'is_online'
    ) THEN
        ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add last_seen column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'last_seen'
    ) THEN
        ALTER TABLE users ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Add current_song_id column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'current_song_id'
    ) THEN
        ALTER TABLE users ADD COLUMN current_song_id UUID;
    END IF;
END $$;
