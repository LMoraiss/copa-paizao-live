-- Enable real-time updates for all relevant tables
ALTER TABLE public.matches REPLICA IDENTITY FULL;
ALTER TABLE public.match_events REPLICA IDENTITY FULL;
ALTER TABLE public.players REPLICA IDENTITY FULL;

-- Add tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;