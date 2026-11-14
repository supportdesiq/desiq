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


-- DESIQ Professional Studio projects
-- Each professional project and its editable line-item estimate belongs to one account.
create table if not exists public.professional_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_name text not null default 'New client project',
  client_name text not null default '',
  location text not null default '',
  notes text not null default '',
  line_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists professional_projects_user_updated_idx
  on public.professional_projects (user_id, updated_at desc);

alter table public.professional_projects enable row level security;

drop policy if exists "Professionals can view their own projects" on public.professional_projects;
create policy "Professionals can view their own projects"
  on public.professional_projects for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Professionals can create their own projects" on public.professional_projects;
create policy "Professionals can create their own projects"
  on public.professional_projects for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Professionals can update their own projects" on public.professional_projects;
create policy "Professionals can update their own projects"
  on public.professional_projects for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Professionals can delete their own projects" on public.professional_projects;
create policy "Professionals can delete their own projects"
  on public.professional_projects for delete to authenticated using (auth.uid() = user_id);

grant select, insert, update, delete on public.professional_projects to authenticated;

-- V5.8 professional room measurement data
alter table public.professional_projects add column if not exists rooms jsonb not null default '[]'::jsonb;

-- V5.7 professional quotation identity
alter table public.professional_projects add column if not exists company_profile jsonb not null default '{}'::jsonb;

-- V5.9 persistent professional drawing files
alter table public.professional_projects
  add column if not exists drawing_path text,
  add column if not exists drawing_name text,
  add column if not exists drawing_type text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('professional-drawings', 'professional-drawings', false, 15728640,
        array['application/pdf', 'image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = 15728640,
  allowed_mime_types = array['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

drop policy if exists "Professionals can view their own drawings" on storage.objects;
create policy "Professionals can view their own drawings" on storage.objects
  for select to authenticated using (bucket_id = 'professional-drawings' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Professionals can upload their own drawings" on storage.objects;
create policy "Professionals can upload their own drawings" on storage.objects
  for insert to authenticated with check (bucket_id = 'professional-drawings' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Professionals can update their own drawings" on storage.objects;
create policy "Professionals can update their own drawings" on storage.objects
  for update to authenticated using (bucket_id = 'professional-drawings' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'professional-drawings' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Professionals can delete their own drawings" on storage.objects;
create policy "Professionals can delete their own drawings" on storage.objects
  for delete to authenticated using (bucket_id = 'professional-drawings' and (storage.foldername(name))[1] = auth.uid()::text);
