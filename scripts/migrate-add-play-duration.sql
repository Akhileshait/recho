-- Add play_duration column to history table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'history' AND column_name = 'play_duration'
    ) THEN
        ALTER TABLE history ADD COLUMN play_duration INTEGER DEFAULT 0;
    END IF;
END $$;
