-- Admin flag + RLS: admins may SELECT/UPDATE all profiles.
-- Subqueries on public.profiles inside policies would recurse under RLS; use SECURITY DEFINER.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Po nasazení migrace nastav admina v SQL Editoru (dosaď svůj email):
-- UPDATE public.profiles SET is_admin = true WHERE email = 'tvuj@email.cz';

CREATE OR REPLACE FUNCTION public.is_requester_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()),
    false
  );
$$;

COMMENT ON FUNCTION public.is_requester_admin() IS 'True if current user row has is_admin; bypasses RLS to avoid policy recursion.';

DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_requester_admin());

DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
CREATE POLICY "Admins update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_requester_admin())
  WITH CHECK (public.is_requester_admin());

NOTIFY pgrst, 'reload schema';
