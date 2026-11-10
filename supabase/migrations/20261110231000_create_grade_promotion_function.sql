-- Annual grade promotion: advance each signed-in student's profile once
-- after September 1. The maximum supported grade is 5.
CREATE OR REPLACE FUNCTION public.promote_my_grade_if_due()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  promotion_date date := make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, 9, 1);
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;

  -- Before September 1, the annual promotion is not due yet.
  IF CURRENT_DATE < promotion_date THEN
    RETURN;
  END IF;

  UPDATE public.profiles
  SET
    grade = LEAST(COALESCE(grade, 1) + 1, 5),
    last_grade_promotion = CURRENT_DATE
  WHERE id = current_user_id
    AND COALESCE(last_grade_promotion, DATE '1900-01-01') < promotion_date
    AND COALESCE(grade, 1) < 5;
END;
$$;

REVOKE ALL ON FUNCTION public.promote_my_grade_if_due() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.promote_my_grade_if_due() TO authenticated;
