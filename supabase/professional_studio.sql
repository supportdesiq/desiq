-- DESIQ Professional Studio migration
-- Run once in Supabase Dashboard → SQL Editor.
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

-- V5.7: persist each professional's own quotation identity with their project.
alter table public.professional_projects
  add column if not exists company_profile jsonb not null default '{}'::jsonb;

-- V5.8: persist verified room measurements with each professional project.
alter table public.professional_projects
  add column if not exists rooms jsonb not null default '[]'::jsonb;
