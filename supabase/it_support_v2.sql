-- DESIQ IT Support V2: practical activity completion and XP tracking.
-- Run this after supabase/it_support_v1.sql. Safe to run more than once.

create table if not exists public.it_practical_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id text not null,
  category text not null check (category in ('hardware','operating-systems','networking','cybersecurity','troubleshooting','printers','cloud','infrastructure')),
  xp_awarded integer not null default 0,
  completed_at timestamptz not null default now(),
  unique(user_id, activity_id)
);
alter table public.it_practical_completions enable row level security;
drop policy if exists "Learners read own practical completions" on public.it_practical_completions;
create policy "Learners read own practical completions" on public.it_practical_completions for select to authenticated using (auth.uid() = user_id);

create or replace function public.complete_it_practical(p_activity_id text, p_category text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  uid uuid := auth.uid();
  inserted_id uuid;
  award integer := 20;
  today date := current_date;
  previous_day date;
  streak integer := 1;
  total_xp integer := 0;
  current_level integer := 1;
  completed integer := 0;
begin
  if uid is null then raise exception 'Sign in required'; end if;
  if p_activity_id is null or length(p_activity_id) > 100 then raise exception 'Invalid activity'; end if;
  if p_category not in ('hardware','operating-systems','networking','cybersecurity','troubleshooting','printers','cloud','infrastructure') then raise exception 'Invalid category'; end if;
  insert into public.it_practical_completions(user_id,activity_id,category,xp_awarded)
  values(uid,p_activity_id,p_category,award)
  on conflict(user_id,activity_id) do nothing returning id into inserted_id;
  if inserted_id is null then
    select xp,level,completed_count into total_xp,current_level,completed from public.it_user_progress where user_id=uid;
    return jsonb_build_object('already_completed',true,'xp_awarded',0,'xp',coalesce(total_xp,0),'level',coalesce(current_level,1),'completed_count',coalesce(completed,0));
  end if;
  select last_activity_date,current_streak into previous_day,streak from public.it_user_progress where user_id=uid;
  if previous_day=today then streak:=coalesce(streak,1); elsif previous_day=today-1 then streak:=coalesce(streak,0)+1; else streak:=1; end if;
  insert into public.it_user_progress(user_id,xp,level,current_streak,longest_streak,last_activity_date,completed_count,updated_at)
  values(uid,award,1,streak,streak,today,0,now())
  on conflict(user_id) do update set xp=public.it_user_progress.xp+award,level=floor((public.it_user_progress.xp+award)/250.0)::int+1,current_streak=streak,longest_streak=greatest(public.it_user_progress.longest_streak,streak),last_activity_date=today,updated_at=now();
  select xp,level,completed_count into total_xp,current_level,completed from public.it_user_progress where user_id=uid;
  return jsonb_build_object('already_completed',false,'xp_awarded',award,'xp',total_xp,'level',current_level,'completed_count',completed,'streak',streak);
end; $$;
revoke all on function public.complete_it_practical(text,text) from public;
grant execute on function public.complete_it_practical(text,text) to authenticated;

-- Owner-only challenge authoring. The answer key remains inaccessible to learners.
create or replace function public.admin_create_it_challenge(
  p_id text,p_category text,p_category_name text,p_difficulty text,p_title text,
  p_prompt text,p_options jsonb,p_correct_answer integer,p_explanation text,p_hint text
) returns jsonb language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null or not exists(select 1 from public.it_support_admins where user_id=auth.uid()) then raise exception 'Owner access required'; end if;
  if p_category not in ('hardware','operating-systems','networking','cybersecurity','troubleshooting','printers','cloud','infrastructure') then raise exception 'Invalid category'; end if;
  if p_difficulty not in ('Beginner','Intermediate','Advanced') then raise exception 'Invalid difficulty'; end if;
  if jsonb_typeof(p_options)<>'array' or jsonb_array_length(p_options)<2 or jsonb_array_length(p_options)>6 or p_correct_answer<0 or p_correct_answer>=jsonb_array_length(p_options) then raise exception 'Provide 2–6 options and a valid correct answer'; end if;
  insert into public.it_challenges(id,category,category_name,difficulty,type,title,prompt,options,explanation,hint,sort_order,active)
  values(p_id,p_category,p_category_name,p_difficulty,'multiple-choice',p_title,p_prompt,p_options,p_explanation,p_hint,coalesce((select max(sort_order)+1 from public.it_challenges where category=p_category),1),true);
  insert into public.it_challenge_answers(challenge_id,correct_answer) values(p_id,p_correct_answer);
  return jsonb_build_object('id',p_id,'created',true);
end; $$;
revoke all on function public.admin_create_it_challenge(text,text,text,text,text,text,jsonb,integer,text,text) from public;
grant execute on function public.admin_create_it_challenge(text,text,text,text,text,text,jsonb,integer,text,text) to authenticated;
