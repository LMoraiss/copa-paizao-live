-- Create match_events table for real-time match events
CREATE TABLE IF NOT EXISTS public.match_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('goal', 'yellow_card', 'red_card', 'substitution', 'corner', 'kickoff', 'halftime', 'fulltime')),
  minute INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create match_media table for match images
CREATE TABLE IF NOT EXISTS public.match_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on match_events
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

-- Create policies for match_events
CREATE POLICY "Everyone can view match events" 
ON public.match_events 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert match events" 
ON public.match_events 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Only admins can update match events" 
ON public.match_events 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Only admins can delete match events" 
ON public.match_events 
FOR DELETE 
USING (is_admin());

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

-- Add real-time functionality
ALTER TABLE public.match_events REPLICA IDENTITY FULL;
ALTER TABLE public.match_media REPLICA IDENTITY FULL;
ALTER TABLE public.matches REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_media;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;