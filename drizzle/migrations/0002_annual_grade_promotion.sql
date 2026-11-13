-- Persist the last school-year promotion date and promote profiles on first login
-- after September 1 in Vietnam time. The auth UUID remains the permanent student ID.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_grade_promotion date;
--> statement-breakpoint

UPDATE public.profiles
SET last_grade_promotion = (created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
WHERE last_grade_promotion IS NULL;
--> statement-breakpoint

ALTER TABLE public.profiles
  ALTER COLUMN last_grade_promotion SET DEFAULT (timezone('Asia/Ho_Chi_Minh', now())::date),
  ALTER COLUMN last_grade_promotion SET NOT NULL;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.promote_my_grade_if_due()
RETURNS smallint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_grade smallint;
  v_last date;
  v_today date := timezone('Asia/Ho_Chi_Minh', now())::date;
  v_school_year_start date;
  v_next_promotion date;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Vui lòng đăng nhập';
  END IF;

  v_school_year_start := make_date(extract(year FROM v_today)::int, 9, 1);
  IF v_today < v_school_year_start THEN
    v_school_year_start := (v_school_year_start - interval '1 year')::date;
  END IF;

  SELECT grade, last_grade_promotion
  INTO v_grade, v_last
  FROM public.profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_next_promotion := make_date(
    extract(year FROM v_last)::int +
      CASE WHEN v_last >= make_date(extract(year FROM v_last)::int, 9, 1) THEN 1 ELSE 0 END,
    9, 1
  );

  IF v_next_promotion <= v_school_year_start THEN
    -- A login after a missed school-year boundary catches the profile up safely.
    v_grade := LEAST(5, v_grade + (
      extract(year FROM v_school_year_start)::int -
      extract(year FROM v_next_promotion)::int + 1
    ));
    UPDATE public.profiles
    SET grade = v_grade,
        last_grade_promotion = v_school_year_start,
        updated_at = now()
    WHERE id = v_user_id;
  END IF;

  RETURN v_grade;
END;
$$;
--> statement-breakpoint

REVOKE ALL ON FUNCTION public.promote_my_grade_if_due() FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON FUNCTION public.promote_my_grade_if_due() FROM anon;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION public.promote_my_grade_if_due() TO authenticated;
