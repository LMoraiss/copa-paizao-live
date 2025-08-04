-- Create policies for match_media (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'match_media' 
        AND policyname = 'Everyone can view match media'
    ) THEN
        CREATE POLICY "Everyone can view match media" 
        ON public.match_media 
        FOR SELECT 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'match_media' 
        AND policyname = 'Only admins can insert match media'
    ) THEN
        CREATE POLICY "Only admins can insert match media" 
        ON public.match_media 
        FOR INSERT 
        WITH CHECK (is_admin());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'match_media' 
        AND policyname = 'Only admins can update match media'
    ) THEN
        CREATE POLICY "Only admins can update match media" 
        ON public.match_media 
        FOR UPDATE 
        USING (is_admin());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'match_media' 
        AND policyname = 'Only admins can delete match media'
    ) THEN
        CREATE POLICY "Only admins can delete match media" 
        ON public.match_media 
        FOR DELETE 
        USING (is_admin());
    END IF;
END $$;

-- Enable realtime for match_media
ALTER TABLE public.match_media REPLICA IDENTITY FULL;

-- Add to realtime publication if not already added
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'match_media'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.match_media;
    END IF;
END $$;