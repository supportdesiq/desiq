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

-- V5.9: persist floor-plan files in a private Supabase Storage bucket.
alter table public.professional_projects
  add column if not exists drawing_path text,
  add column if not exists drawing_name text,
  add column if not exists drawing_type text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'professional-drawings',
  'professional-drawings',
  false,
  15728640,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 15728640,
  allowed_mime_types = array['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

drop policy if exists "Professionals can view their own drawings" on storage.objects;
create policy "Professionals can view their own drawings"
  on storage.objects for select to authenticated
  using (bucket_id = 'professional-drawings' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Professionals can upload their own drawings" on storage.objects;
create policy "Professionals can upload their own drawings"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'professional-drawings' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Professionals can update their own drawings" on storage.objects;
create policy "Professionals can update their own drawings"
  on storage.objects for update to authenticated
  using (bucket_id = 'professional-drawings' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'professional-drawings' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Professionals can delete their own drawings" on storage.objects;
create policy "Professionals can delete their own drawings"
  on storage.objects for delete to authenticated
  using (bucket_id = 'professional-drawings' and (storage.foldername(name))[1] = auth.uid()::text);


-- V6.0: persist calibrated drawing scale and on-plan measurements.
alter table public.professional_projects
  add column if not exists drawing_annotations jsonb not null default '[]'::jsonb,
  add column if not exists drawing_calibration jsonb;


-- V6.2: one professional account can manage multiple specialisations.
create table if not exists public.professional_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  specialisations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.professional_profiles enable row level security;
drop policy if exists "Professionals can view their own profile" on public.professional_profiles;
create policy "Professionals can view their own profile"
  on public.professional_profiles for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Professionals can create their own profile" on public.professional_profiles;
create policy "Professionals can create their own profile"
  on public.professional_profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Professionals can update their own profile" on public.professional_profiles;
create policy "Professionals can update their own profile"
  on public.professional_profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.professional_profiles to authenticated;
