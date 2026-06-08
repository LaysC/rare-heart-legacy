
CREATE TABLE public.user_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, card_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_collections TO authenticated;
GRANT ALL ON public.user_collections TO service_role;

ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own collection"
  ON public.user_collections FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users add to own collection"
  ON public.user_collections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users remove from own collection"
  ON public.user_collections FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_user_collections_user ON public.user_collections(user_id, created_at DESC);
