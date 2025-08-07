-- Create storage bucket for match media
INSERT INTO storage.buckets (id, name, public) VALUES ('match-media', 'match-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for match media
CREATE POLICY "Match media is publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'match-media');

CREATE POLICY "Only admins can upload match media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'match-media' AND is_admin());

CREATE POLICY "Only admins can update match media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'match-media' AND is_admin());

CREATE POLICY "Only admins can delete match media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'match-media' AND is_admin());