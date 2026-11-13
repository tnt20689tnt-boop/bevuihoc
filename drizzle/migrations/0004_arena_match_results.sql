-- Persist one private result row per participant in each Arena match.
create table if not exists public.arena_match_results (
  match_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  opponent_id uuid,
  opponent_name text not null,
  grade int not null check (grade between 1 and 5),
  score int not null check (score >= 0),
  opponent_score int not null check (opponent_score >= 0),
  total_questions int not null check (total_questions > 0),
  outcome text not null check (outcome in ('win', 'loss', 'draw')),
  created_at timestamptz not null default now(),
  primary key (match_id, user_id)
);

create index if not exists arena_match_results_user_created_idx
  on public.arena_match_results(user_id, created_at desc);

alter table public.arena_match_results enable row level security;
revoke all on public.arena_match_results from anon, authenticated;
grant select on public.arena_match_results to authenticated;

drop policy if exists "players read their own arena results" on public.arena_match_results;
create policy "players read their own arena results"
  on public.arena_match_results for select to authenticated
  using (auth.uid() = user_id);

create or replace function public.save_arena_match_result(
  p_match_id uuid,
  p_grade int,
  p_score int,
  p_opponent_id uuid,
  p_opponent_name text,
  p_opponent_score int,
  p_total_questions int
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_name text;
begin
  if v_user is null then raise exception 'Chưa đăng nhập'; end if;
  if p_grade not between 1 and 5 then raise exception 'Lớp không hợp lệ'; end if;
  if p_total_questions not between 1 and 100 then raise exception 'Số câu không hợp lệ'; end if;
  if p_score not between 0 and p_total_questions
     or p_opponent_score not between 0 and p_total_questions then
    raise exception 'Điểm trận đấu không hợp lệ';
  end if;
  if p_opponent_id = v_user then raise exception 'Đối thủ không hợp lệ'; end if;

  select coalesce(display_name, 'Bạn học') into v_name
  from public.profiles where id = v_user;

  insert into public.arena_match_results (
    match_id, user_id, display_name, opponent_id, opponent_name,
    grade, score, opponent_score, total_questions, outcome
  ) values (
    p_match_id, v_user, coalesce(v_name, 'Bạn học'), p_opponent_id,
    coalesce(nullif(trim(p_opponent_name), ''), 'Đối thủ'),
    p_grade, p_score, p_opponent_score, p_total_questions,
    case when p_score > p_opponent_score then 'win'
         when p_score < p_opponent_score then 'loss'
         else 'draw' end
  )
  on conflict (match_id, user_id) do update set
    display_name = excluded.display_name,
    opponent_id = excluded.opponent_id,
    opponent_name = excluded.opponent_name,
    grade = excluded.grade,
    score = excluded.score,
    opponent_score = excluded.opponent_score,
    total_questions = excluded.total_questions,
    outcome = excluded.outcome;
end;
$$;

revoke all on function public.save_arena_match_result(uuid,int,int,uuid,text,int,int) from public, anon;
grant execute on function public.save_arena_match_result(uuid,int,int,uuid,text,int,int) to authenticated;