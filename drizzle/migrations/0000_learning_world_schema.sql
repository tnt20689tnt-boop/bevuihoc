
-- ===== Roles =====
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "read own or admin roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ===== Profiles (character) =====
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  gender text NOT NULL CHECK (gender IN ('boy','girl')),
  grade smallint NOT NULL CHECK (grade BETWEEN 1 AND 5),
  avatar jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed-in can see characters" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "create own character" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "update own character or admin" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete character" ON public.profiles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.validate_profile()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.display_name := btrim(regexp_replace(coalesce(NEW.display_name,''), '\s+', ' ', 'g'));
  IF char_length(NEW.display_name) < 2 OR char_length(NEW.display_name) > 20 THEN
    RAISE EXCEPTION 'Tên nhân vật cần từ 2 đến 20 ký tự';
  END IF;
  IF lower(NEW.display_name) ~ '(địt|đụ|lồn|cặc|đéo|fuck|shit|bitch|vcl|vkl|dcm|đcm)' THEN
    RAISE EXCEPTION 'Tên chưa phù hợp, bé chọn tên khác nhé';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER profiles_validate BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile();

-- ===== Questions =====
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL CHECK (subject IN ('math','vietnamese','english')),
  grade smallint NOT NULL CHECK (grade BETWEEN 1 AND 5),
  difficulty text NOT NULL DEFAULT 'easy' CHECK (difficulty IN ('easy','medium','hard')),
  topic text NOT NULL DEFAULT '',
  qtype text NOT NULL DEFAULT 'choice' CHECK (qtype IN ('choice','input')),
  prompt text NOT NULL,
  media text,
  speak_text text,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer text NOT NULL,
  explanation text,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX questions_lookup_idx ON public.questions (subject, grade, difficulty) WHERE active;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
-- Players never read this table directly (answers stay hidden); they use get_quiz_questions().
CREATE POLICY "admin manage questions" ON public.questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== Play sessions & answers =====
CREATE TABLE public.play_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode text NOT NULL CHECK (mode IN ('learn','football')),
  subject text NOT NULL CHECK (subject IN ('math','vietnamese','english','mixed')),
  grade smallint NOT NULL CHECK (grade BETWEEN 1 AND 5),
  difficulty text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  answered int NOT NULL DEFAULT 0,
  correct int NOT NULL DEFAULT 0,
  points int NOT NULL DEFAULT 0,
  goals int NOT NULL DEFAULT 0,
  streak int NOT NULL DEFAULT 0,
  best_streak int NOT NULL DEFAULT 0
);
CREATE INDEX play_sessions_user_idx ON public.play_sessions (user_id, started_at DESC);
GRANT SELECT ON public.play_sessions TO authenticated;
GRANT ALL ON public.play_sessions TO service_role;
ALTER TABLE public.play_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin sessions" ON public.play_sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.session_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.play_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  question_id uuid REFERENCES public.questions(id) ON DELETE SET NULL,
  answer text,
  is_correct boolean NOT NULL,
  points int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, question_id)
);
GRANT SELECT ON public.session_answers TO authenticated;
GRANT ALL ON public.session_answers TO service_role;
ALTER TABLE public.session_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin answers" ON public.session_answers FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ===== Point ledger (source of leaderboards) =====
CREATE TABLE public.point_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  points int NOT NULL,
  correct int NOT NULL DEFAULT 0,
  goals int NOT NULL DEFAULT 0,
  reason text NOT NULL,
  grade smallint NOT NULL,
  session_id uuid,
  contest_id uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX point_events_time_idx ON public.point_events (created_at);
CREATE INDEX point_events_user_idx ON public.point_events (user_id, created_at DESC);
GRANT SELECT ON public.point_events TO authenticated;
GRANT ALL ON public.point_events TO service_role;
ALTER TABLE public.point_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin points" ON public.point_events FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ===== Badges =====
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '🏅',
  criteria text NOT NULL CHECK (criteria IN ('correct','points','streak','goals','sessions','salon')),
  threshold int NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.badges TO authenticated;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed-in read badges" ON public.badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin manage badges" ON public.badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.user_badges (
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);
GRANT SELECT, DELETE ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin badges" ON public.user_badges FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin remove badges" ON public.user_badges FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.badges (code, name, description, icon, criteria, threshold) VALUES
  ('first_correct', 'Bước đầu tiên', 'Trả lời đúng câu hỏi đầu tiên', '🌱', 'correct', 1),
  ('correct_50', 'Chăm chỉ', 'Trả lời đúng 50 câu', '📘', 'correct', 50),
  ('correct_200', 'Siêu trí tuệ', 'Trả lời đúng 200 câu', '🧠', 'correct', 200),
  ('streak_5', 'Chuỗi 5 sao', 'Đúng liên tiếp 5 câu', '⭐', 'streak', 5),
  ('streak_10', 'Không thể cản', 'Đúng liên tiếp 10 câu', '🔥', 'streak', 10),
  ('points_500', 'Nhà sưu tập điểm', 'Đạt 500 điểm', '💎', 'points', 500),
  ('points_2000', 'Huyền thoại', 'Đạt 2000 điểm', '👑', 'points', 2000),
  ('goals_10', 'Chân sút vàng', 'Ghi 10 bàn thắng', '⚽', 'goals', 10),
  ('goals_50', 'Vua phá lưới', 'Ghi 50 bàn thắng', '🥅', 'goals', 50),
  ('sessions_10', 'Bền bỉ', 'Hoàn thành 10 lượt chơi', '🎯', 'sessions', 10),
  ('salon_1', 'Nhà tạo mẫu nhí', 'Lưu một tác phẩm trang điểm', '💄', 'salon', 1);

-- ===== Salon looks =====
CREATE TABLE public.salon_looks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Tác phẩm của bé',
  look jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.salon_looks TO authenticated;
GRANT ALL ON public.salon_looks TO service_role;
ALTER TABLE public.salon_looks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed-in view showcase" ON public.salon_looks FOR SELECT TO authenticated USING (true);
CREATE POLICY "save own look" ON public.salon_looks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "delete own look or admin" ON public.salon_looks FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ===== Online status =====
CREATE TABLE public.player_status (
  user_id uuid PRIMARY KEY,
  room text NOT NULL DEFAULT 'plaza',
  last_seen timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.player_status TO authenticated;
GRANT ALL ON public.player_status TO service_role;
ALTER TABLE public.player_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin status" ON public.player_status FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ===== Contests =====
CREATE TABLE public.contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'quiz' CHECK (kind IN ('quiz','football')),
  subject text NOT NULL CHECK (subject IN ('math','vietnamese','english','mixed')),
  grade smallint NOT NULL CHECK (grade BETWEEN 1 AND 5),
  difficulty text CHECK (difficulty IS NULL OR difficulty IN ('easy','medium','hard')),
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','running','finished')),
  host_id uuid NOT NULL,
  question_ids uuid[] NOT NULL DEFAULT '{}',
  current_index int NOT NULL DEFAULT -1,
  question_started_at timestamptz,
  seconds_per_question int NOT NULL DEFAULT 20 CHECK (seconds_per_question BETWEEN 5 AND 120),
  total_questions int NOT NULL DEFAULT 10 CHECK (total_questions BETWEEN 1 AND 30),
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);
GRANT SELECT, UPDATE, DELETE ON public.contests TO authenticated;
GRANT ALL ON public.contests TO service_role;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed-in see contests" ON public.contests FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin update contests" ON public.contests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete contests" ON public.contests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.contest_players (
  contest_id uuid NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  display_name text NOT NULL,
  avatar jsonb NOT NULL DEFAULT '{}'::jsonb,
  score int NOT NULL DEFAULT 0,
  correct int NOT NULL DEFAULT 0,
  goals int NOT NULL DEFAULT 0,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (contest_id, user_id)
);
GRANT SELECT ON public.contest_players TO authenticated;
GRANT ALL ON public.contest_players TO service_role;
ALTER TABLE public.contest_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed-in see contest players" ON public.contest_players FOR SELECT TO authenticated USING (true);

CREATE TABLE public.contest_answers (
  contest_id uuid NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
  question_index int NOT NULL,
  user_id uuid NOT NULL,
  question_id uuid,
  answer text,
  is_correct boolean NOT NULL,
  points int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (contest_id, question_index, user_id)
);
GRANT SELECT ON public.contest_answers TO authenticated;
GRANT ALL ON public.contest_answers TO service_role;
ALTER TABLE public.contest_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin contest answers" ON public.contest_answers FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.contests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contest_players;

-- ===== Hall of fame =====
CREATE TABLE public.hall_of_fame (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type text NOT NULL CHECK (period_type IN ('day','week','month')),
  period_start date NOT NULL,
  grade smallint NOT NULL DEFAULT 0,
  rank smallint NOT NULL,
  user_id uuid NOT NULL,
  display_name text NOT NULL,
  avatar jsonb NOT NULL DEFAULT '{}'::jsonb,
  points int NOT NULL,
  correct int NOT NULL DEFAULT 0,
  goals int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (period_type, period_start, grade, rank)
);
GRANT SELECT, DELETE ON public.hall_of_fame TO authenticated;
GRANT ALL ON public.hall_of_fame TO service_role;
ALTER TABLE public.hall_of_fame ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed-in see hall" ON public.hall_of_fame FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin delete hall" ON public.hall_of_fame FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ===== Helpers =====
CREATE OR REPLACE FUNCTION public.norm_answer(t text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT regexp_replace(regexp_replace(lower(btrim(coalesce(t,''))), '\s+', ' ', 'g'), '[\.!?]+$', '')
$$;

CREATE OR REPLACE FUNCTION public.period_start(p_period text, p_ts timestamptz)
RETURNS timestamptz LANGUAGE sql STABLE AS $$
  SELECT date_trunc(p_period, p_ts AT TIME ZONE 'Asia/Ho_Chi_Minh') AT TIME ZONE 'Asia/Ho_Chi_Minh'
$$;

CREATE OR REPLACE FUNCTION public.award_badges(p_user uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_correct bigint; v_points bigint; v_goals bigint; v_streak int; v_sessions bigint; v_salon bigint; v_new jsonb;
BEGIN
  SELECT coalesce(sum(correct),0), coalesce(sum(points),0), coalesce(sum(goals),0)
    INTO v_correct, v_points, v_goals FROM point_events WHERE user_id = p_user;
  SELECT coalesce(max(best_streak),0), count(*) FILTER (WHERE finished_at IS NOT NULL AND answered >= 5)
    INTO v_streak, v_sessions FROM play_sessions WHERE user_id = p_user;
  SELECT count(*) INTO v_salon FROM salon_looks WHERE user_id = p_user;
  WITH ins AS (
    INSERT INTO user_badges (user_id, badge_id)
    SELECT p_user, b.id FROM badges b WHERE b.active AND (
      (b.criteria = 'correct' AND v_correct >= b.threshold) OR
      (b.criteria = 'points' AND v_points >= b.threshold) OR
      (b.criteria = 'goals' AND v_goals >= b.threshold) OR
      (b.criteria = 'streak' AND v_streak >= b.threshold) OR
      (b.criteria = 'sessions' AND v_sessions >= b.threshold) OR
      (b.criteria = 'salon' AND v_salon >= b.threshold))
    ON CONFLICT DO NOTHING RETURNING badge_id)
  SELECT coalesce(jsonb_agg(jsonb_build_object('name', b.name, 'icon', b.icon, 'description', b.description)), '[]'::jsonb)
    INTO v_new FROM ins JOIN badges b ON b.id = ins.badge_id;
  RETURN v_new;
END $$;
REVOKE EXECUTE ON FUNCTION public.award_badges(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.check_my_badges()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
  RETURN public.award_badges(auth.uid());
END $$;

-- ===== Learning flow =====
CREATE OR REPLACE FUNCTION public.start_session(p_mode text, p_subject text, p_grade int, p_difficulty text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) THEN RAISE EXCEPTION 'Bé cần tạo nhân vật trước'; END IF;
  IF p_mode NOT IN ('learn','football') THEN RAISE EXCEPTION 'Chế độ không hợp lệ'; END IF;
  IF p_subject NOT IN ('math','vietnamese','english','mixed') THEN RAISE EXCEPTION 'Môn học không hợp lệ'; END IF;
  IF p_grade NOT BETWEEN 1 AND 5 THEN RAISE EXCEPTION 'Lớp không hợp lệ'; END IF;
  IF (SELECT count(*) FROM play_sessions WHERE user_id = auth.uid() AND started_at > now() - interval '1 hour') >= 60 THEN
    RAISE EXCEPTION 'Bé nghỉ ngơi một chút rồi chơi tiếp nhé';
  END IF;
  INSERT INTO play_sessions (user_id, mode, subject, grade, difficulty)
    VALUES (auth.uid(), p_mode, p_subject, p_grade, p_difficulty) RETURNING id INTO v_id;
  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.get_quiz_questions(p_subject text, p_grade int, p_difficulty text DEFAULT NULL, p_count int DEFAULT 10)
RETURNS TABLE (id uuid, subject text, grade smallint, difficulty text, topic text, qtype text, prompt text, media text, speak_text text, options jsonb)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
  RETURN QUERY
    SELECT q.id, q.subject, q.grade, q.difficulty, q.topic, q.qtype, q.prompt, q.media, q.speak_text, q.options
    FROM questions q
    WHERE q.active AND q.grade = p_grade
      AND (p_subject = 'mixed' OR q.subject = p_subject)
      AND (p_difficulty IS NULL OR q.difficulty = p_difficulty)
    ORDER BY random()
    LIMIT least(greatest(p_count, 1), 20);
END $$;

CREATE OR REPLACE FUNCTION public.submit_answer(p_session uuid, p_question uuid, p_answer text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s play_sessions; q questions; v_ok boolean; v_pts int := 0; v_bonus int := 0; v_streak int; v_last timestamptz; v_grade smallint;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
  SELECT * INTO s FROM play_sessions WHERE play_sessions.id = p_session AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy lượt chơi'; END IF;
  IF s.finished_at IS NOT NULL THEN RAISE EXCEPTION 'Lượt chơi đã kết thúc'; END IF;
  IF s.started_at < now() - interval '3 hours' THEN RAISE EXCEPTION 'Lượt chơi đã hết hạn'; END IF;
  IF s.answered >= 50 THEN RAISE EXCEPTION 'Lượt chơi đã đủ câu'; END IF;
  SELECT max(created_at) INTO v_last FROM session_answers WHERE session_id = p_session;
  IF v_last IS NOT NULL AND v_last > now() - interval '700 milliseconds' THEN
    RAISE EXCEPTION 'Bé trả lời nhanh quá, thử lại nhé';
  END IF;
  SELECT * INTO q FROM questions WHERE questions.id = p_question AND active;
  IF NOT FOUND THEN RAISE EXCEPTION 'Câu hỏi không tồn tại'; END IF;
  IF q.grade <> s.grade OR (s.subject <> 'mixed' AND q.subject <> s.subject) THEN
    RAISE EXCEPTION 'Câu hỏi không thuộc lượt chơi này';
  END IF;
  IF EXISTS (SELECT 1 FROM session_answers WHERE session_id = p_session AND question_id = p_question) THEN
    RAISE EXCEPTION 'Câu này đã được trả lời';
  END IF;

  v_ok := public.norm_answer(p_answer) = public.norm_answer(q.correct_answer);
  IF v_ok THEN
    v_streak := s.streak + 1;
    v_pts := CASE q.difficulty WHEN 'hard' THEN 20 WHEN 'medium' THEN 15 ELSE 10 END;
    IF v_streak >= 3 THEN v_bonus := 5; END IF;
  ELSE
    v_streak := 0;
  END IF;

  INSERT INTO session_answers (session_id, user_id, question_id, answer, is_correct, points)
    VALUES (p_session, auth.uid(), p_question, left(coalesce(p_answer,''), 200), v_ok, v_pts + v_bonus);
  UPDATE play_sessions SET
    answered = answered + 1,
    correct = correct + (CASE WHEN v_ok THEN 1 ELSE 0 END),
    points = points + v_pts + v_bonus,
    goals = goals + (CASE WHEN v_ok AND mode = 'football' THEN 1 ELSE 0 END),
    streak = v_streak,
    best_streak = greatest(best_streak, v_streak)
  WHERE play_sessions.id = p_session;

  IF v_ok THEN
    SELECT grade INTO v_grade FROM profiles WHERE profiles.id = auth.uid();
    INSERT INTO point_events (user_id, points, correct, goals, reason, grade, session_id)
      VALUES (auth.uid(), v_pts + v_bonus, 1, CASE WHEN s.mode = 'football' THEN 1 ELSE 0 END,
              CASE WHEN s.mode = 'football' THEN 'goal' ELSE 'correct' END, coalesce(v_grade, s.grade), p_session);
  END IF;

  RETURN jsonb_build_object('correct', v_ok, 'correct_answer', q.correct_answer, 'explanation', q.explanation,
    'points', v_pts, 'bonus', v_bonus, 'streak', v_streak);
END $$;

CREATE OR REPLACE FUNCTION public.finish_session(p_session uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s play_sessions; v_bonus int := 0; v_grade smallint; v_badges jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
  SELECT * INTO s FROM play_sessions WHERE id = p_session AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy lượt chơi'; END IF;
  IF s.finished_at IS NULL THEN
    IF s.answered >= 5 THEN
      v_bonus := 20;
      SELECT grade INTO v_grade FROM profiles WHERE id = auth.uid();
      INSERT INTO point_events (user_id, points, reason, grade, session_id)
        VALUES (auth.uid(), v_bonus, 'complete', coalesce(v_grade, s.grade), p_session);
    END IF;
    UPDATE play_sessions SET finished_at = now(), points = points + v_bonus WHERE id = p_session RETURNING * INTO s;
  END IF;
  v_badges := public.award_badges(auth.uid());
  RETURN jsonb_build_object('answered', s.answered, 'correct', s.correct, 'points', s.points, 'goals', s.goals,
    'best_streak', s.best_streak, 'bonus', v_bonus, 'new_badges', v_badges);
END $$;

-- ===== Stats & leaderboards =====
CREATE OR REPLACE FUNCTION public.my_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
  SELECT jsonb_build_object(
    'points', coalesce((SELECT sum(points) FROM point_events WHERE user_id = auth.uid()), 0),
    'correct', coalesce((SELECT sum(correct) FROM point_events WHERE user_id = auth.uid()), 0),
    'goals', coalesce((SELECT sum(goals) FROM point_events WHERE user_id = auth.uid()), 0),
    'today', coalesce((SELECT sum(points) FROM point_events WHERE user_id = auth.uid() AND created_at >= public.period_start('day', now())), 0),
    'sessions', (SELECT count(*) FROM play_sessions WHERE user_id = auth.uid() AND finished_at IS NOT NULL),
    'best_streak', coalesce((SELECT max(best_streak) FROM play_sessions WHERE user_id = auth.uid()), 0),
    'badges', (SELECT count(*) FROM user_badges WHERE user_id = auth.uid())
  ) INTO r;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.get_leaderboard(p_period text, p_grade int DEFAULT 0, p_limit int DEFAULT 50)
RETURNS TABLE (rank bigint, user_id uuid, display_name text, avatar jsonb, grade smallint, points bigint, correct bigint, goals bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
  IF p_period NOT IN ('day','week','month') THEN RAISE EXCEPTION 'Kỳ không hợp lệ'; END IF;
  RETURN QUERY
    WITH agg AS (
      SELECT e.user_id AS uid, sum(e.points)::bigint AS pts, sum(e.correct)::bigint AS cor, sum(e.goals)::bigint AS gl, min(e.created_at) AS first_at
      FROM point_events e
      WHERE e.created_at >= public.period_start(p_period, now())
        AND (p_grade = 0 OR e.grade = p_grade)
      GROUP BY e.user_id
      HAVING sum(e.points) > 0
    )
    SELECT row_number() OVER (ORDER BY a.pts DESC, a.cor DESC, a.first_at) AS rank,
      a.uid, p.display_name, p.avatar, p.grade, a.pts, a.cor, a.gl
    FROM agg a JOIN profiles p ON p.id = a.uid
    ORDER BY 1
    LIMIT least(greatest(p_limit, 1), 100);
END $$;

CREATE OR REPLACE FUNCTION public.close_periods()
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_type text; v_k int; v_start timestamp; v_end timestamp; v_g int; v_n int; v_total int := 0;
  v_local timestamp := now() AT TIME ZONE 'Asia/Ho_Chi_Minh';
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Không có quyền'; END IF;
  FOREACH v_type IN ARRAY ARRAY['day','week','month'] LOOP
    FOR v_k IN 1..3 LOOP
      v_end := date_trunc(v_type, v_local) - ((v_k - 1)::text || ' ' || v_type)::interval;
      v_start := v_end - ('1 ' || v_type)::interval;
      FOR v_g IN 0..5 LOOP
        IF NOT EXISTS (SELECT 1 FROM hall_of_fame h WHERE h.period_type = v_type AND h.period_start = v_start::date AND h.grade = v_g) THEN
          INSERT INTO hall_of_fame (period_type, period_start, grade, rank, user_id, display_name, avatar, points, correct, goals)
          SELECT v_type, v_start::date, v_g, r.rk, r.uid, p.display_name, p.avatar, r.pts, r.cor, r.gl
          FROM (
            SELECT e.user_id AS uid, sum(e.points)::int AS pts, sum(e.correct)::int AS cor, sum(e.goals)::int AS gl,
              row_number() OVER (ORDER BY sum(e.points) DESC, sum(e.correct) DESC, min(e.created_at)) AS rk
            FROM point_events e
            WHERE (e.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') >= v_start
              AND (e.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') < v_end
              AND (v_g = 0 OR e.grade = v_g)
            GROUP BY e.user_id
            HAVING sum(e.points) > 0
          ) r JOIN profiles p ON p.id = r.uid
          WHERE r.rk <= 3;
          GET DIAGNOSTICS v_n = ROW_COUNT;
          v_total := v_total + v_n;
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;
  RETURN v_total;
END $$;
REVOKE EXECUTE ON FUNCTION public.close_periods() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.close_periods() TO authenticated;

-- ===== Presence heartbeat =====
CREATE OR REPLACE FUNCTION public.heartbeat(p_room text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  INSERT INTO player_status (user_id, room, last_seen) VALUES (auth.uid(), left(coalesce(p_room,'plaza'), 30), now())
  ON CONFLICT (user_id) DO UPDATE SET room = excluded.room, last_seen = now();
END $$;

-- ===== Contests =====
CREATE OR REPLACE FUNCTION public.create_contest(p_title text, p_kind text, p_subject text, p_grade int, p_difficulty text, p_total int, p_seconds int)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid; pr profiles;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
  SELECT * INTO pr FROM profiles WHERE id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Bé cần tạo nhân vật trước'; END IF;
  IF (SELECT count(*) FROM contests WHERE host_id = auth.uid() AND status = 'waiting') >= 3 THEN
    RAISE EXCEPTION 'Bé đang có 3 phòng thi chờ, hãy bắt đầu một phòng trước nhé';
  END IF;
  INSERT INTO contests (title, kind, subject, grade, difficulty, host_id, total_questions, seconds_per_question)
  VALUES (left(coalesce(nullif(btrim(p_title),''), 'Cuộc thi vui'), 60), p_kind, p_subject, p_grade, p_difficulty, auth.uid(),
          least(greatest(coalesce(p_total,10),1),30), least(greatest(coalesce(p_seconds,20),5),120))
  RETURNING id INTO v_id;
  INSERT INTO contest_players (contest_id, user_id, display_name, avatar) VALUES (v_id, auth.uid(), pr.display_name, pr.avatar);
  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.join_contest(p_contest uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c contests; pr profiles;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
  SELECT * INTO c FROM contests WHERE id = p_contest;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy cuộc thi'; END IF;
  IF c.status = 'finished' THEN RAISE EXCEPTION 'Cuộc thi đã kết thúc'; END IF;
  SELECT * INTO pr FROM profiles WHERE id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Bé cần tạo nhân vật trước'; END IF;
  IF (SELECT count(*) FROM contest_players WHERE contest_id = p_contest) >= 20 THEN RAISE EXCEPTION 'Phòng thi đã đủ người'; END IF;
  INSERT INTO contest_players (contest_id, user_id, display_name, avatar)
  VALUES (p_contest, auth.uid(), pr.display_name, pr.avatar) ON CONFLICT DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.start_contest(p_contest uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c contests; v_ids uuid[];
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
  SELECT * INTO c FROM contests WHERE id = p_contest FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy cuộc thi'; END IF;
  IF c.host_id <> auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Chỉ chủ phòng mới bắt đầu được'; END IF;
  IF c.status <> 'waiting' THEN RAISE EXCEPTION 'Cuộc thi đã bắt đầu'; END IF;
  SELECT array_agg(x.id) INTO v_ids FROM (
    SELECT q.id FROM questions q
    WHERE q.active AND q.grade = c.grade AND (c.subject = 'mixed' OR q.subject = c.subject)
      AND (c.difficulty IS NULL OR q.difficulty = c.difficulty)
      AND (c.kind = 'quiz' OR q.qtype = 'choice')
    ORDER BY random() LIMIT c.total_questions) x;
  IF v_ids IS NULL THEN RAISE EXCEPTION 'Chưa có câu hỏi phù hợp cho cuộc thi này'; END IF;
  UPDATE contests SET status = 'running', question_ids = v_ids, total_questions = array_length(v_ids, 1),
    current_index = 0, question_started_at = now() WHERE id = p_contest;
END $$;

CREATE OR REPLACE FUNCTION public.get_contest_question(p_contest uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE c contests; q questions; v_mine jsonb; v_over boolean; v_answered int; v_players int;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
  SELECT * INTO c FROM contests WHERE id = p_contest;
  IF NOT FOUND OR c.status <> 'running' THEN RETURN NULL; END IF;
  SELECT * INTO q FROM questions WHERE id = c.question_ids[c.current_index + 1];
  v_over := now() > c.question_started_at + make_interval(secs => c.seconds_per_question);
  SELECT jsonb_build_object('answer', a.answer, 'is_correct', a.is_correct, 'points', a.points) INTO v_mine
    FROM contest_answers a WHERE a.contest_id = p_contest AND a.question_index = c.current_index AND a.user_id = auth.uid();
  SELECT count(*) INTO v_answered FROM contest_answers WHERE contest_id = p_contest AND question_index = c.current_index;
  SELECT count(*) INTO v_players FROM contest_players WHERE contest_id = p_contest;
  RETURN jsonb_build_object(
    'index', c.current_index, 'total', c.total_questions, 'started_at', c.question_started_at,
    'seconds', c.seconds_per_question, 'server_now', now(), 'answered_count', v_answered, 'player_count', v_players,
    'question', CASE WHEN q.id IS NULL THEN NULL ELSE jsonb_build_object('id', q.id, 'prompt', q.prompt, 'qtype', q.qtype,
       'options', q.options, 'media', q.media, 'speak_text', q.speak_text, 'topic', q.topic, 'subject', q.subject, 'difficulty', q.difficulty) END,
    'revealed', CASE WHEN v_over THEN q.correct_answer ELSE NULL END,
    'mine', v_mine);
END $$;

CREATE OR REPLACE FUNCTION public.submit_contest_answer(p_contest uuid, p_index int, p_answer text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c contests; q questions; v_ok boolean; v_pts int := 0; v_remaining numeric; v_grade smallint;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
  SELECT * INTO c FROM contests WHERE id = p_contest;
  IF NOT FOUND OR c.status <> 'running' THEN RAISE EXCEPTION 'Cuộc thi không diễn ra'; END IF;
  IF NOT EXISTS (SELECT 1 FROM contest_players WHERE contest_id = p_contest AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Bé chưa tham gia cuộc thi này';
  END IF;
  IF p_index <> c.current_index THEN RAISE EXCEPTION 'Câu hỏi đã qua'; END IF;
  v_remaining := extract(epoch FROM (c.question_started_at + make_interval(secs => c.seconds_per_question) - now()));
  IF v_remaining < -1 THEN RAISE EXCEPTION 'Hết giờ rồi'; END IF;
  IF EXISTS (SELECT 1 FROM contest_answers WHERE contest_id = p_contest AND question_index = p_index AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Bé đã trả lời câu này';
  END IF;
  SELECT * INTO q FROM questions WHERE id = c.question_ids[c.current_index + 1];
  v_ok := q.id IS NOT NULL AND public.norm_answer(p_answer) = public.norm_answer(q.correct_answer);
  IF v_ok THEN
    v_pts := 10 + least(5, greatest(0, floor(greatest(v_remaining, 0) * 5 / c.seconds_per_question)))::int;
  END IF;
  INSERT INTO contest_answers (contest_id, question_index, user_id, question_id, answer, is_correct, points)
    VALUES (p_contest, p_index, auth.uid(), q.id, left(coalesce(p_answer,''), 200), v_ok, v_pts);
  UPDATE contest_players SET score = score + v_pts, correct = correct + (CASE WHEN v_ok THEN 1 ELSE 0 END),
    goals = goals + (CASE WHEN v_ok AND c.kind = 'football' THEN 1 ELSE 0 END)
  WHERE contest_id = p_contest AND user_id = auth.uid();
  IF v_ok THEN
    SELECT grade INTO v_grade FROM profiles WHERE id = auth.uid();
    INSERT INTO point_events (user_id, points, correct, goals, reason, grade, contest_id)
    VALUES (auth.uid(), v_pts, 1, CASE WHEN c.kind = 'football' THEN 1 ELSE 0 END, 'contest', coalesce(v_grade, c.grade), p_contest);
  END IF;
  RETURN jsonb_build_object('correct', v_ok, 'points', v_pts);
END $$;

CREATE OR REPLACE FUNCTION public.next_contest_question(p_contest uuid, p_index int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c contests; v_player record;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
  SELECT * INTO c FROM contests WHERE id = p_contest FOR UPDATE;
  IF NOT FOUND OR c.status <> 'running' OR c.current_index <> p_index THEN RETURN; END IF;
  IF NOT (c.host_id = auth.uid() OR public.has_role(auth.uid(), 'admin')
          OR now() > c.question_started_at + make_interval(secs => c.seconds_per_question + 3)) THEN
    RETURN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM contest_players WHERE contest_id = p_contest AND user_id = auth.uid())
     AND NOT public.has_role(auth.uid(), 'admin') THEN RETURN; END IF;
  IF c.current_index + 1 >= c.total_questions THEN
    UPDATE contests SET status = 'finished', finished_at = now() WHERE id = p_contest;
    FOR v_player IN SELECT user_id FROM contest_players WHERE contest_id = p_contest LOOP
      PERFORM public.award_badges(v_player.user_id);
    END LOOP;
  ELSE
    UPDATE contests SET current_index = current_index + 1, question_started_at = now() WHERE id = p_contest;
  END IF;
END $$;

-- ===== Admin =====
CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM user_roles WHERE role = 'admin')
$$;

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Chưa đăng nhập'; END IF;
  PERFORM pg_advisory_xact_lock(424242);
  IF EXISTS (SELECT 1 FROM user_roles WHERE role = 'admin') THEN RETURN false; END IF;
  INSERT INTO user_roles (user_id, role) VALUES (auth.uid(), 'admin');
  RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_admin(p_user uuid, p_admin boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Không có quyền'; END IF;
  IF p_user = auth.uid() AND NOT p_admin THEN RAISE EXCEPTION 'Không thể tự bỏ quyền của mình'; END IF;
  IF p_admin THEN
    INSERT INTO user_roles (user_id, role) VALUES (p_user, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM user_roles WHERE user_id = p_user AND role = 'admin';
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.admin_adjust_points(p_user uuid, p_points int, p_note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_grade smallint;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Không có quyền'; END IF;
  IF p_points = 0 OR abs(p_points) > 10000 THEN RAISE EXCEPTION 'Số điểm không hợp lệ'; END IF;
  SELECT grade INTO v_grade FROM profiles WHERE id = p_user;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy người chơi'; END IF;
  INSERT INTO point_events (user_id, points, reason, grade, note) VALUES (p_user, p_points, 'admin', v_grade, left(coalesce(p_note,''), 200));
  PERFORM public.award_badges(p_user);
END $$;

CREATE OR REPLACE FUNCTION public.admin_players()
RETURNS TABLE (id uuid, display_name text, gender text, grade smallint, avatar jsonb, created_at timestamptz,
  points bigint, correct bigint, goals bigint, last_seen timestamptz, room text, is_admin boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Không có quyền'; END IF;
  RETURN QUERY
    SELECT p.id, p.display_name, p.gender, p.grade, p.avatar, p.created_at,
      coalesce(e.pts, 0)::bigint, coalesce(e.cor, 0)::bigint, coalesce(e.gl, 0)::bigint,
      s.last_seen, s.room, EXISTS (SELECT 1 FROM user_roles r WHERE r.user_id = p.id AND r.role = 'admin')
    FROM profiles p
    LEFT JOIN (SELECT user_id, sum(points) pts, sum(correct) cor, sum(goals) gl FROM point_events GROUP BY user_id) e ON e.user_id = p.id
    LEFT JOIN player_status s ON s.user_id = p.id
    ORDER BY p.created_at DESC;
END $$;
