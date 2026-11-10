-- Repair the student profile schema expected by the application.
-- Existing profiles receive today's date so the grade-promotion routine
-- will not unexpectedly promote a student during this schema repair.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_grade_promotion date NOT NULL DEFAULT CURRENT_DATE;

COMMENT ON COLUMN public.profiles.last_grade_promotion IS
  'Date the student last received the annual grade promotion.';
