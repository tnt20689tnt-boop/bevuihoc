alter table public.arena_match_results add column if not exists duration_seconds int not null default 0;
grant all on public.arena_match_results to service_role;

create or replace function public.save_arena_match_result_v2(
  p_match_id uuid, p_grade int, p_score int, p_opponent_id uuid,
  p_opponent_name text, p_opponent_score int, p_total_questions int, p_duration_seconds int
) returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform public.save_arena_match_result(p_match_id, p_grade, p_score, p_opponent_id, p_opponent_name, p_opponent_score, p_total_questions);
  update public.arena_match_results
     set duration_seconds = greatest(0, least(coalesce(p_duration_seconds, 0), 3600))
   where match_id = p_match_id and user_id = auth.uid();
end; $$;
revoke all on function public.save_arena_match_result_v2(uuid,int,int,uuid,text,int,int,int) from public, anon;
grant execute on function public.save_arena_match_result_v2(uuid,int,int,uuid,text,int,int,int) to authenticated;

-- Shared 1v1 match feed: one row per match, names/scores only.
create or replace function public.get_arena_matches(p_limit int default 50)
returns table(match_id uuid, player_a text, player_b text, winner text, score_a int, score_b int,
  total_questions int, grade int, duration_seconds int, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select m.match_id,
    case when m.score >= m.opponent_score then m.display_name else m.opponent_name end,
    case when m.score >= m.opponent_score then m.opponent_name else m.display_name end,
    case when m.score = m.opponent_score then null when m.score > m.opponent_score then m.display_name else m.opponent_name end,
    greatest(m.score, m.opponent_score), least(m.score, m.opponent_score),
    m.total_questions, m.grade, m.duration_seconds, m.created_at
  from (
    select distinct on (r.match_id) r.* from public.arena_match_results r
    where auth.uid() is not null
    order by r.match_id, r.duration_seconds desc, r.created_at
  ) m
  order by m.created_at desc
  limit least(greatest(coalesce(p_limit, 50), 1), 100);
$$;
revoke all on function public.get_arena_matches(int) from public, anon;
grant execute on function public.get_arena_matches(int) to authenticated;