-- Add missing columns to songs table
DO $$
BEGIN
  -- Add album column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'songs' AND column_name = 'album'
  ) THEN
    ALTER TABLE songs ADD COLUMN album VARCHAR(255);
  END IF;

  -- Add mood column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'songs' AND column_name = 'mood'
  ) THEN
    ALTER TABLE songs ADD COLUMN mood VARCHAR(50);
  END IF;

  -- Add play_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'songs' AND column_name = 'play_count'
  ) THEN
    ALTER TABLE songs ADD COLUMN play_count INTEGER DEFAULT 0;
  END IF;

  -- Add file_url column if it doesn't exist (alias for url)
  -- We'll use url as the file_url in queries
END $$;

-- Update existing songs with default values
UPDATE songs SET album = 'Unknown Album' WHERE album IS NULL;
UPDATE songs SET mood = 'calm' WHERE mood IS NULL;
UPDATE songs SET play_count = 0 WHERE play_count IS NULL;
