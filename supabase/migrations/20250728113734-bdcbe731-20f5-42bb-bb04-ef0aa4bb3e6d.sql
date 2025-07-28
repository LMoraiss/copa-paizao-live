-- Fix the position constraint to allow Portuguese position names
ALTER TABLE players DROP CONSTRAINT players_position_check;

-- Add new constraint with Portuguese position names
ALTER TABLE players ADD CONSTRAINT players_position_check 
CHECK (position = ANY (ARRAY['goleiro', 'zagueiro', 'lateral', 'meio-campo', 'atacante']::text[]));

-- Add support for media uploads
CREATE TABLE IF NOT EXISTS public.match_media (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on match_media
ALTER TABLE public.match_media ENABLE ROW LEVEL SECURITY;

-- Create policies for match_media
CREATE POLICY "Everyone can view match media" 
ON public.match_media 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert match media" 
ON public.match_media 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update match media" 
ON public.match_media 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Only admins can delete match media" 
ON public.match_media 
FOR DELETE 
USING (is_admin());

-- Enable realtime for match_media
ALTER TABLE public.match_media REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_media;