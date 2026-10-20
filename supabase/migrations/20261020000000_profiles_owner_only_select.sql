/*
  # Lock down tables that had RLS switched off (applied live 2026-10-20)

  Live check 2026-10-20: RLS was DISABLED on profiles, calendar_events and
  portfolio_embeddings, and anon held full grants (SELECT/INSERT/UPDATE/
  DELETE/TRUNCATE). The public key could read and change all of them.
  The repo migrations never recorded RLS being turned off: live had drifted.

  calendar_events and portfolio_embeddings are only used by n8n with the
  service_role key, which bypasses RLS, so no policies are needed for them.
  profiles: each signed-in user reads only their own row.
*/

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = id);
REVOKE ALL ON public.profiles FROM anon;

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.calendar_events FROM anon;

ALTER TABLE public.portfolio_embeddings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.portfolio_embeddings FROM anon;
