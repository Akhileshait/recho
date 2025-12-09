-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image VARCHAR(255),
  provider VARCHAR(50) DEFAULT 'google',
  provider_account_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  spotify_connected BOOLEAN DEFAULT FALSE,
  spotify_access_token TEXT,
  spotify_refresh_token TEXT,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  current_song_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Songs Table
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  genre VARCHAR(100),
  duration INTEGER, -- in seconds
  url VARCHAR(500) NOT NULL,
  cover_url VARCHAR(500),
  album VARCHAR(255),
  spotify_id VARCHAR(255),
  youtube_id VARCHAR(255),
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Playlists Table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cover_url VARCHAR(500),
  is_public BOOLEAN DEFAULT FALSE,
  source VARCHAR(50), -- spotify, youtube, custom
  external_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Playlist Songs (Many-to-Many)
CREATE TABLE IF NOT EXISTS playlist_songs (
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (playlist_id, song_id)
);

-- History Table
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  play_duration INTEGER DEFAULT 0, -- seconds listened
  played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Song Likes Table
CREATE TABLE IF NOT EXISTS song_likes (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, song_id)
);

-- User Activity/Presence Table
CREATE TABLE IF NOT EXISTS user_activity (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT FALSE,
  current_song_id UUID REFERENCES songs(id) ON DELETE SET NULL,
  playback_position INTEGER DEFAULT 0,
  is_playing BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Friendships Table
CREATE TABLE IF NOT EXISTS friendships (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, friend_id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  song_id UUID REFERENCES songs(id) ON DELETE SET NULL, -- for sharing songs
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_history_user_played ON history(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_song ON history(song_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
CREATE INDEX IF NOT EXISTS idx_user_activity_online ON user_activity(is_online);
