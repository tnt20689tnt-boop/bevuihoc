-- Bé Vui Học: ngân hàng câu hỏi, đề ngẫu nhiên và xếp hạng theo lớp
-- Migration chỉ bổ sung; không sửa/xóa dữ liệu học tập hiện có.

create table if not exists public.question_bank (
  id uuid primary key default gen_random_uuid(),
  subject text not null check (subject in ('math','viet','english')),
  grade int not null check (grade between 1 and 5),
  term text not null check (term in ('mid1','final1','mid2','final2')),
  topic text,
  question_text text not null,
  question_type text not null check (question_type in ('multiple_choice','short_answer')),
  options jsonb,
  correct_answer text not null,
  points int not null default 1 check (points > 0),
  difficulty int not null default 1 check (difficulty between 1 and 3),
  created_at timestamptz not null default now(),
  constraint question_bank_options_shape check (
    question_type <> 'multiple_choice' or jsonb_typeof(options) = 'array'
  )
);

create unique index if not exists question_bank_unique_question
  on public.question_bank(subject, grade, term, question_text);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade int not null check (grade between 1 and 5),
  teacher_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists class_id uuid references public.classes(id) on delete set null;

create index if not exists profiles_class_id_idx on public.profiles(class_id);

create table if not exists public.generated_exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (subject in ('math','viet','english')),
  grade int not null check (grade between 1 and 5),
  term text not null check (term in ('mid1','final1','mid2','final2')),
  duration_minutes int not null default 30 check (duration_minutes between 5 and 180),
  question_ids uuid[] not null,
  created_at timestamptz not null default now()
);

-- Snapshot riêng phía máy chủ: không cấp quyền đọc cho client để giữ kín đáp án.
create table if not exists public.generated_exam_snapshots (
  exam_id uuid primary key references public.generated_exams(id) on delete cascade,
  questions jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.generated_exam_snapshots enable row level security;
revoke all on public.generated_exam_snapshots from anon, authenticated;

create table if not exists public.generated_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.generated_exams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score numeric(8,2) not null default 0,
  total_points numeric(8,2) not null default 0,
  status text not null default 'in_progress' check (status in ('in_progress','submitted')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  unique (exam_id, user_id, id)
);

create index if not exists generated_exams_user_created_idx
  on public.generated_exams(user_id, created_at desc);
create index if not exists generated_exam_attempts_user_submitted_idx
  on public.generated_exam_attempts(user_id, submitted_at desc)
  where status = 'submitted';

alter table public.question_bank enable row level security;
alter table public.classes enable row level security;
alter table public.generated_exams enable row level security;
alter table public.generated_exam_attempts enable row level security;

-- Không cấp quyền đọc question_bank cho client: đáp án đúng chỉ được dùng trong RPC.
revoke all on public.question_bank from anon, authenticated;
revoke all on public.generated_exams from anon, authenticated;
revoke all on public.generated_exam_attempts from anon, authenticated;
grant select on public.generated_exams to authenticated;
grant select on public.generated_exam_attempts to authenticated;

drop policy if exists "users see own generated exams" on public.generated_exams;
create policy "users see own generated exams"
  on public.generated_exams for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users see own generated attempts" on public.generated_exam_attempts;
create policy "users see own generated attempts"
  on public.generated_exam_attempts for select to authenticated
  using (auth.uid() = user_id);

-- Lớp chỉ hiển thị tên/lớp cho người đã đăng nhập; việc phân lớp thực hiện bởi quản trị viên.
grant select on public.classes to authenticated;
drop policy if exists "authenticated can read classes" on public.classes;
create policy "authenticated can read classes"
  on public.classes for select to authenticated using (true);

create or replace function public.generate_exam(
  p_subject text,
  p_grade int,
  p_term text,
  p_count int default 10,
  p_duration int default 30
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_ids uuid[];
  v_exam_id uuid;
begin
  if v_user is null then raise exception 'Chưa đăng nhập'; end if;
  if p_subject not in ('math','viet','english') then raise exception 'Môn học không hợp lệ'; end if;
  if p_grade not between 1 and 5 then raise exception 'Lớp không hợp lệ'; end if;
  if p_term not in ('mid1','final1','mid2','final2') then raise exception 'Kì thi không hợp lệ'; end if;
  if p_count not between 1 and 50 then raise exception 'Số câu hỏi phải từ 1 đến 50'; end if;
  if p_duration not between 5 and 180 then raise exception 'Thời lượng phải từ 5 đến 180 phút'; end if;

  select array_agg(q.id order by q.random_order)
    into v_ids
  from (
    select id, random() as random_order
    from public.question_bank
    where subject = p_subject and grade = p_grade and term = p_term
    order by random()
    limit p_count
  ) q;

  if coalesce(cardinality(v_ids), 0) = 0 then
    raise exception 'Chưa có câu hỏi cho môn/lớp/kì này';
  end if;

  insert into public.generated_exams(user_id, subject, grade, term, duration_minutes, question_ids)
  values (v_user, p_subject, p_grade, p_term, p_duration, v_ids)
  returning id into v_exam_id;

  insert into public.generated_exam_snapshots(exam_id, questions)
  select v_exam_id,
    coalesce(jsonb_agg(jsonb_build_object(
      'id', q.id,
      'question_text', q.question_text,
      'question_type', q.question_type,
      'options', q.options,
      'correct_answer', q.correct_answer,
      'points', q.points
    ) order by u.ord), '[]'::jsonb)
  from unnest(v_ids) with ordinality as u(question_id, ord)
  join public.question_bank q on q.id = u.question_id;

  return v_exam_id;
end;
$$;

create or replace function public.get_generated_exam_questions(p_exam_id uuid)
returns table (
  id uuid,
  order_index int,
  question_text text,
  question_type text,
  options jsonb,
  points int
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_exam public.generated_exams%rowtype;
begin
  select * into v_exam from public.generated_exams
  where generated_exams.id = p_exam_id and user_id = auth.uid();
  if not found then raise exception 'Không tìm thấy đề thi'; end if;

  return query
  select
    (item ->> 'id')::uuid,
    (entry.ord - 1)::int,
    item ->> 'question_text',
    item ->> 'question_type',
    item -> 'options',
    (item ->> 'points')::int
  from public.generated_exam_snapshots s
  cross join lateral jsonb_array_elements(s.questions) with ordinality as entry(item, ord)
  where s.exam_id = p_exam_id
  order by entry.ord;
end;
$$;

create or replace function public.submit_generated_exam(p_exam_id uuid, p_answers jsonb)
returns table(score numeric, total_points numeric, percentage numeric)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_exam public.generated_exams%rowtype;
  v_attempt public.generated_exam_attempts%rowtype;
  v_score numeric := 0;
  v_total numeric := 0;
begin
  if auth.uid() is null then raise exception 'Chưa đăng nhập'; end if;
  if jsonb_typeof(coalesce(p_answers, '{}'::jsonb)) <> 'object' then
    raise exception 'Dữ liệu câu trả lời không hợp lệ';
  end if;

  select * into v_exam from public.generated_exams
  where id = p_exam_id and user_id = auth.uid();
  if not found then raise exception 'Không tìm thấy đề thi'; end if;

  select * into v_attempt from public.generated_exam_attempts
  where exam_id = p_exam_id and user_id = auth.uid() and status = 'in_progress'
  order by started_at desc limit 1 for update;
  if not found then
    insert into public.generated_exam_attempts(exam_id, user_id)
    values (p_exam_id, auth.uid()) returning * into v_attempt;
  end if;

  select
    coalesce(sum((item ->> 'points')::numeric) filter (
      where lower(trim(coalesce(p_answers ->> (item ->> 'id'), ''))) =
        lower(trim(item ->> 'correct_answer'))
    ), 0),
    coalesce(sum((item ->> 'points')::numeric), 0)
  into v_score, v_total
  from public.generated_exam_snapshots s
  cross join lateral jsonb_array_elements(s.questions) as entry(item)
  where s.exam_id = p_exam_id;

  update public.generated_exam_attempts
  set answers = coalesce(p_answers, '{}'::jsonb),
      score = v_score,
      total_points = v_total,
      status = 'submitted',
      submitted_at = now()
  where id = v_attempt.id;

  return query select v_score, v_total,
    case when v_total > 0 then round(v_score / v_total * 100, 1) else 0 end;
end;
$$;

-- Tạo một lượt làm bài thuộc đúng tài khoản; không cho client tự ghi điểm.
create or replace function public.start_generated_exam_attempt(p_exam_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_attempt_id uuid;
begin
  if auth.uid() is null then raise exception 'Chưa đăng nhập'; end if;
  if not exists (select 1 from public.generated_exams where id = p_exam_id and user_id = auth.uid()) then
    raise exception 'Không tìm thấy đề thi';
  end if;
  insert into public.generated_exam_attempts(exam_id, user_id)
  values (p_exam_id, auth.uid()) returning id into v_attempt_id;
  return v_attempt_id;
end;
$$;

-- Xếp hạng chỉ trả về các bé cùng lớp với tài khoản đang đăng nhập.
create or replace function public.my_class_leaderboard()
returns table (
  user_id uuid,
  display_name text,
  exam_count bigint,
  avg_percent numeric,
  total_score numeric,
  last_exam_at timestamptz,
  rank bigint
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_class_id uuid;
begin
  if auth.uid() is null then raise exception 'Chưa đăng nhập'; end if;
  select p.class_id into v_class_id from public.profiles p where p.id = auth.uid();
  if v_class_id is null then return; end if;

  return query
  with stats as (
    select p.id, p.display_name,
      count(a.id) as exam_count,
      coalesce(round(avg(a.score / nullif(a.total_points, 0) * 100), 1), 0) as avg_percent,
      coalesce(sum(a.score), 0) as total_score,
      max(a.submitted_at) as last_exam_at
    from public.profiles p
    left join public.generated_exam_attempts a
      on a.user_id = p.id and a.status = 'submitted'
      and a.submitted_at > now() - interval '30 days'
    where p.class_id = v_class_id
    group by p.id, p.display_name
  )
  select s.id, s.display_name, s.exam_count, s.avg_percent, s.total_score,
    s.last_exam_at,
    row_number() over (order by s.avg_percent desc, s.exam_count desc, s.total_score desc)
  from stats s
  order by s.avg_percent desc, s.exam_count desc, s.total_score desc
  limit 50;
end;
$$;

revoke all on function public.generate_exam(text,int,text,int,int) from public, anon;
revoke all on function public.get_generated_exam_questions(uuid) from public, anon;
revoke all on function public.submit_generated_exam(uuid,jsonb) from public, anon;
revoke all on function public.start_generated_exam_attempt(uuid) from public, anon;
revoke all on function public.my_class_leaderboard() from public, anon;
grant execute on function public.generate_exam(text,int,text,int,int) to authenticated;
grant execute on function public.get_generated_exam_questions(uuid) to authenticated;
grant execute on function public.submit_generated_exam(uuid,jsonb) to authenticated;
grant execute on function public.start_generated_exam_attempt(uuid) to authenticated;
grant execute on function public.my_class_leaderboard() to authenticated;

-- Câu hỏi mẫu: INSERT an toàn khi chạy migration lại.
insert into public.question_bank
(subject, grade, term, topic, question_text, question_type, options, correct_answer, points, difficulty)
values
('math',1,'mid1','cộng trừ 10','1 + 2 = ?','multiple_choice','[{"key":"A","text":"2"},{"key":"B","text":"3"},{"key":"C","text":"4"}]'::jsonb,'B',1,1),
('math',1,'mid1','cộng trừ 10','3 + 2 = ?','multiple_choice','[{"key":"A","text":"4"},{"key":"B","text":"5"},{"key":"C","text":"6"}]'::jsonb,'B',1,1),
('math',1,'mid1','cộng trừ 10','5 - 1 = ?','multiple_choice','[{"key":"A","text":"3"},{"key":"B","text":"4"},{"key":"C","text":"5"}]'::jsonb,'B',1,1),
('math',1,'mid1','cộng trừ 10','4 - 2 = ?','multiple_choice','[{"key":"A","text":"1"},{"key":"B","text":"2"},{"key":"C","text":"3"}]'::jsonb,'B',1,1),
('math',1,'mid1','cộng trừ 10','2 + 2 = ?','multiple_choice','[{"key":"A","text":"3"},{"key":"B","text":"4"},{"key":"C","text":"5"}]'::jsonb,'B',1,1),
('math',1,'mid1','cộng trừ 10','6 - 3 = ?','multiple_choice','[{"key":"A","text":"2"},{"key":"B","text":"3"},{"key":"C","text":"4"}]'::jsonb,'B',1,1),
('math',1,'mid1','cộng trừ 10','2 + 5 = ?','multiple_choice','[{"key":"A","text":"6"},{"key":"B","text":"7"},{"key":"C","text":"8"}]'::jsonb,'B',1,1),
('math',1,'mid1','cộng trừ 10','8 - 4 = ?','multiple_choice','[{"key":"A","text":"3"},{"key":"B","text":"4"},{"key":"C","text":"5"}]'::jsonb,'B',1,1),
('math',1,'mid1','so sánh số','Số nào lớn hơn: 5 hay 3?','multiple_choice','[{"key":"A","text":"3"},{"key":"B","text":"5"},{"key":"C","text":"Hai số bằng nhau"}]'::jsonb,'B',1,1),
('math',1,'mid1','so sánh số','Số liền sau của 6 là số nào?','multiple_choice','[{"key":"A","text":"5"},{"key":"B","text":"7"},{"key":"C","text":"8"}]'::jsonb,'B',1,1),
('math',3,'mid1','bảng nhân','6 × 7 = ?','multiple_choice','[{"key":"A","text":"40"},{"key":"B","text":"42"},{"key":"C","text":"48"}]'::jsonb,'B',1,2),
('math',3,'mid1','phép chia','35 ÷ 5 = ?','multiple_choice','[{"key":"A","text":"6"},{"key":"B","text":"7"},{"key":"C","text":"8"}]'::jsonb,'B',1,2),
('math',3,'mid1','chia có dư','17 ÷ 5 = ? (thương, dư)','multiple_choice','[{"key":"A","text":"3 dư 2"},{"key":"B","text":"2 dư 7"},{"key":"C","text":"4 dư 1"}]'::jsonb,'A',2,3)
on conflict (subject, grade, term, question_text) do nothing;

-- Lưu ý: xếp lớp bằng cách cập nhật profiles.class_id sau khi tạo lớp trong public.classes.
