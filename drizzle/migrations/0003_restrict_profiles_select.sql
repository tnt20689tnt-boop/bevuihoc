DROP POLICY IF EXISTS "signed-in can see characters" ON public.profiles;

CREATE POLICY "read own character or admin"
ON public.profiles
FOR SELECT
TO authenticated
USING ((id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role));

-- All-time school ranking that exposes only the fields the ranking board shows.
CREATE OR REPLACE FUNCTION public.get_school_ranking(p_limit integer DEFAULT 100)
RETURNS TABLE(id uuid, display_name text, grade smallint, points bigint, correct bigint, goals bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
  RETURN QUERY
    WITH agg AS (
      SELECT e.user_id AS uid,
             coalesce(sum(e.points), 0)::bigint AS pts,
             coalesce(sum(e.correct), 0)::bigint AS cor,
             coalesce(sum(e.goals), 0)::bigint AS gl
      FROM point_events e
      GROUP BY e.user_id
    )
    SELECT p.id, p.display_name, p.grade,
           coalesce(a.pts, 0)::bigint, coalesce(a.cor, 0)::bigint, coalesce(a.gl, 0)::bigint
    FROM profiles p
    LEFT JOIN agg a ON a.uid = p.id
    WHERE coalesce(a.pts, 0) > 0 OR p.id = auth.uid()
    ORDER BY coalesce(a.pts, 0) DESC, coalesce(a.cor, 0) DESC, p.display_name
    LIMIT least(greatest(coalesce(p_limit, 100), 1), 100);
END $function$;

REVOKE ALL ON FUNCTION public.get_school_ranking(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_school_ranking(integer) TO authenticated;