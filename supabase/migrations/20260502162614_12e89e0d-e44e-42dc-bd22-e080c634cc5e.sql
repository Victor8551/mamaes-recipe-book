CREATE TABLE public.custom_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🍽️',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Custom categories select own" ON public.custom_categories
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Custom categories insert own" ON public.custom_categories
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Custom categories update own" ON public.custom_categories
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Custom categories delete own" ON public.custom_categories
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_custom_categories_user ON public.custom_categories(user_id);