-- DESIQ student learning platform schema
-- Run this file in Supabase Dashboard → SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.saved_designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_key text not null,
  project_name text not null default 'My design',
  design_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, challenge_key)
);

create table if not exists public.challenge_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  challenge_key text not null,
  project_name text not null,
  score integer not null default 0 check (score between 0 and 100),
  completed_at timestamptz not null default now(),
  unique(user_id, challenge_key)
);

alter table public.saved_designs enable row level security;
alter table public.challenge_completions enable row level security;

drop policy if exists "Students can view their own saved designs" on public.saved_designs;
create policy "Students can view their own saved designs" on public.saved_designs for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Students can create their own saved designs" on public.saved_designs;
create policy "Students can create their own saved designs" on public.saved_designs for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Students can update their own saved designs" on public.saved_designs;
create policy "Students can update their own saved designs" on public.saved_designs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Students can delete their own saved designs" on public.saved_designs;
create policy "Students can delete their own saved designs" on public.saved_designs for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Students can view their own completions" on public.challenge_completions;
create policy "Students can view their own completions" on public.challenge_completions for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Students can create their own completions" on public.challenge_completions;
create policy "Students can create their own completions" on public.challenge_completions for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Students can update their own completions" on public.challenge_completions;
create policy "Students can update their own completions" on public.challenge_completions for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.saved_designs to authenticated;
grant select, insert, update on public.challenge_completions to authenticated;
