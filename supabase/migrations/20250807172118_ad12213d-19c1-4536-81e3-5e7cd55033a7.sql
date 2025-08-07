-- Create match_media table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.match_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.match_media ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Match media is viewable by everyone" 
ON public.match_media 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage match media" 
ON public.match_media 
FOR ALL 
USING (public.is_admin());

-- Add trigger for timestamps
CREATE TRIGGER update_match_media_updated_at
BEFORE UPDATE ON public.match_media
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();