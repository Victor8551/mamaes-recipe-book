
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by owner" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Profiles insert by owner" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles update by owner" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Recipes table
CREATE TABLE public.recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  image_url text,
  ingredients text NOT NULL DEFAULT '',
  instructions text NOT NULL DEFAULT '',
  prep_time integer,
  servings integer,
  category text NOT NULL DEFAULT 'Outros',
  notes text,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recipes select own" ON public.recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Recipes insert own" ON public.recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Recipes update own" ON public.recipes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Recipes delete own" ON public.recipes FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX recipes_user_id_idx ON public.recipes(user_id);
CREATE INDEX recipes_category_idx ON public.recipes(category);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER recipes_set_updated_at BEFORE UPDATE ON public.recipes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for recipe images
INSERT INTO storage.buckets (id, name, public) VALUES ('recipe-images', 'recipe-images', true);
CREATE POLICY "Recipe images public read" ON storage.objects FOR SELECT USING (bucket_id = 'recipe-images');
CREATE POLICY "Recipe images user upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Recipe images user update" ON storage.objects FOR UPDATE USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Recipe images user delete" ON storage.objects FOR DELETE USING (bucket_id = 'recipe-images' AND auth.uid()::text = (storage.foldername(name))[1]);
