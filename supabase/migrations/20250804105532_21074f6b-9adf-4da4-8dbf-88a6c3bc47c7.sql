-- Add new constraint with Portuguese position names
ALTER TABLE players ADD CONSTRAINT players_position_check 
CHECK (position = ANY (ARRAY['goleiro', 'zagueiro', 'lateral', 'meio-campo', 'atacante']::text[]));

-- Add support for media uploads (table already exists from previous migration, skip if exists)
CREATE TABLE IF NOT EXISTS public.match_media (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on match_media (only if table doesn't already have RLS enabled)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'match_media' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.match_media ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;