
-- Fix function search_path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Restrict bucket listing: only owner can list their folder
DROP POLICY "Recipe images public read" ON storage.objects;
CREATE POLICY "Recipe images owner list" ON storage.objects FOR SELECT
USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);
-- Public files still accessible via public URL (bucket public=true) without listing
