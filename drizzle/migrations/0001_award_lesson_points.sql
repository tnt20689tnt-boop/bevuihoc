-- Award lesson practice points through a trusted server-side function.
-- Students can only award points to themselves, and the amount is fixed at 10.
CREATE OR REPLACE FUNCTION public.award_lesson_points(p_note text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_grade smallint;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Vui lòng đăng nhập để nhận điểm';
  END IF;

  SELECT grade INTO v_grade
  FROM public.profiles
  WHERE id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Không tìm thấy hồ sơ học sinh';
  END IF;

  INSERT INTO public.point_events (
    user_id, points, correct, goals, reason, grade, note
  ) VALUES (
    auth.uid(), 10, 1, 0, 'lesson_practice', v_grade, left(coalesce(p_note, ''), 200)
  );

  PERFORM public.award_badges(auth.uid());

  RETURN jsonb_build_object('points', 10);
END;
$$;
--> statement-breakpoint

REVOKE ALL ON FUNCTION public.award_lesson_points(text) FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.award_lesson_points(text) FROM anon;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.award_lesson_points(text) TO authenticated;
