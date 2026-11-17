-- DESIQ Admin Dashboard V1
-- Run in Supabase Dashboard > SQL Editor before deploying the website update.
create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  role text not null check (role in ('super_admin','staff_admin','learning_teacher')),
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null default '',
  role text not null check (role in ('staff_admin','learning_teacher')),
  learning_worlds text[] not null default '{}',
  student_ids uuid[] not null default '{}',
  capabilities text[] not null default '{}',
  invited_by uuid not null references auth.users(id),
  status text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists admin_invitations_pending_email_idx
  on public.admin_invitations (lower(email)) where status = 'pending';

create table if not exists public.admin_world_assignments (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.admin_profiles(user_id) on delete cascade,
  world_slug text not null,
  assigned_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(admin_user_id, world_slug)
);

create table if not exists public.admin_student_assignments (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.admin_profiles(user_id) on delete cascade,
  student_user_id uuid not null references auth.users(id) on delete cascade,
  assigned_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(admin_user_id, student_user_id)
);

create table if not exists public.admin_permissions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.admin_profiles(user_id) on delete cascade,
  capability text not null,
  granted_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique(admin_user_id, capability)
);

create table if not exists public.admin_audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text not null default '',
  target_id text not null default '',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_activity_events (
  id bigint generated always as identity primary key,
  student_user_id uuid not null references auth.users(id) on delete cascade,
  world_slug text not null,
  event_type text not null,
  event_label text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists learning_activity_student_date_idx on public.learning_activity_events(student_user_id, created_at desc);
create index if not exists learning_activity_world_date_idx on public.learning_activity_events(world_slug, created_at desc);

create or replace function public.is_desiq_super_admin() returns boolean
language sql stable security definer set search_path = public, auth
as $$ select exists(select 1 from public.admin_profiles p where p.user_id = auth.uid() and p.role = 'super_admin' and p.status = 'active') $$;

create or replace function public.is_desiq_admin() returns boolean
language sql stable security definer set search_path = public, auth
as $$ select exists(select 1 from public.admin_profiles p where p.user_id = auth.uid() and p.status = 'active') $$;

create or replace function public.desiq_admin_overview() returns jsonb
language plpgsql stable security definer set search_path = public, auth
as $$
declare result jsonb;
begin
  if not public.is_desiq_admin() then raise exception 'Admin access required'; end if;
  select jsonb_build_object(
    'registered_students', (select count(*) from auth.users u where not exists(select 1 from public.admin_profiles a where a.user_id=u.id)),
    'new_registrations_7d', (select count(*) from auth.users u where u.created_at >= now()-interval '7 days' and not exists(select 1 from public.admin_profiles a where a.user_id=u.id)),
    'active_today', (select count(*) from auth.users u where u.last_sign_in_at >= date_trunc('day', now()) and not exists(select 1 from public.admin_profiles a where a.user_id=u.id)),
    'learning_events_7d', (select count(*) from public.learning_activity_events e where e.created_at >= now()-interval '7 days'),
    'active_staff', (select count(*) from public.admin_profiles p where p.status='active'),
    'pending_invitations', (select count(*) from public.admin_invitations i where i.status='pending' and i.expires_at>now()),
    'completed_challenges', (select count(*) from public.challenge_completions),
    'saved_projects', (select count(*) from public.saved_designs)
  ) into result;
  return result;
end;
$$;

create or replace function public.desiq_admin_record_event(p_world_slug text, p_event_type text, p_event_label text default '', p_metadata jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public, auth
as $$
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if length(coalesce(p_world_slug,'')) > 80 or length(coalesce(p_event_type,'')) > 80 then raise exception 'Invalid event'; end if;
  insert into public.learning_activity_events(student_user_id,world_slug,event_type,event_label,metadata)
  values(auth.uid(),p_world_slug,p_event_type,left(coalesce(p_event_label,''),200),coalesce(p_metadata,'{}'::jsonb));
end;
$$;

-- Create or promote the named owner account, including when it signs up later.
create or replace function public.desiq_sync_admin_invitation() returns trigger
language plpgsql security definer set search_path = public, auth
as $$
declare invite public.admin_invitations%rowtype;
begin
  if lower(coalesce(new.email,'')) = 'supportdesiq@gmail.com' then
    insert into public.admin_profiles(user_id,full_name,email,role,status)
    values(new.id,coalesce(new.raw_user_meta_data->>'full_name','DESIQ Super Admin'),lower(new.email),'super_admin','active')
    on conflict(user_id) do update set email=excluded.email, role='super_admin', status='active', updated_at=now();
    return new;
  end if;
  select * into invite from public.admin_invitations
   where lower(email)=lower(new.email) and status='pending' and expires_at>now()
   order by created_at desc limit 1;
  if found then
    insert into public.admin_profiles(user_id,full_name,email,role,status)
    values(new.id,invite.full_name,lower(new.email),invite.role,'active')
    on conflict(user_id) do nothing;
    insert into public.admin_world_assignments(admin_user_id,world_slug,assigned_by)
      select new.id, unnest(invite.learning_worlds), invite.invited_by on conflict do nothing;
    insert into public.admin_student_assignments(admin_user_id,student_user_id,assigned_by)
      select new.id, unnest(invite.student_ids), invite.invited_by on conflict do nothing;
    insert into public.admin_permissions(admin_user_id,capability,granted_by)
      select new.id, unnest(invite.capabilities), invite.invited_by on conflict do nothing;
    update public.admin_invitations set accepted_user_id=new.id,updated_at=now() where id=invite.id;
  end if;
  return new;
end;
$$;
drop trigger if exists desiq_auth_user_admin_sync on auth.users;
create trigger desiq_auth_user_admin_sync after insert on auth.users for each row execute function public.desiq_sync_admin_invitation();

create or replace function public.desiq_mark_admin_invitation_accepted() returns trigger
language plpgsql security definer set search_path = public, auth
as $$
begin
  if new.last_sign_in_at is not null and (old.last_sign_in_at is null or new.last_sign_in_at > old.last_sign_in_at) then
    update public.admin_invitations set status='accepted',updated_at=now()
    where accepted_user_id=new.id and status='pending';
  end if;
  return new;
end;
$$;
drop trigger if exists desiq_auth_admin_invitation_accepted on auth.users;
create trigger desiq_auth_admin_invitation_accepted after update of last_sign_in_at on auth.users
for each row execute function public.desiq_mark_admin_invitation_accepted();

-- Prevent the protected owner account from being demoted or deleted.
create or replace function public.desiq_protect_super_admin() returns trigger
language plpgsql security definer set search_path = public, auth
as $$
begin
  if lower(coalesce(old.email,'')) = 'supportdesiq@gmail.com' then
    if tg_op = 'DELETE' then raise exception 'The DESIQ Super Admin account is protected'; end if;
    if new.role <> 'super_admin' or lower(new.email) <> 'supportdesiq@gmail.com' then
      raise exception 'The DESIQ Super Admin account cannot be changed or demoted';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists desiq_protect_super_admin_trigger on public.admin_profiles;
create trigger desiq_protect_super_admin_trigger before update or delete on public.admin_profiles
for each row execute function public.desiq_protect_super_admin();

-- Bootstrap the Super Admin immediately if the account already exists.
insert into public.admin_profiles(user_id,full_name,email,role,status)
select id, coalesce(raw_user_meta_data->>'full_name','DESIQ Super Admin'), lower(email), 'super_admin','active'
from auth.users where lower(email)='supportdesiq@gmail.com'
on conflict(user_id) do update set role='super_admin',status='active',email=excluded.email,updated_at=now();

alter table public.admin_profiles enable row level security;
alter table public.admin_invitations enable row level security;
alter table public.admin_world_assignments enable row level security;
alter table public.admin_student_assignments enable row level security;
alter table public.admin_permissions enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.learning_activity_events enable row level security;

-- Remove any earlier policies with these names before installing the locked policies.
drop policy if exists "Admins read own profile or super admin reads all" on public.admin_profiles;
create policy "Admins read own profile or super admin reads all" on public.admin_profiles for select to authenticated
using (user_id=auth.uid() or public.is_desiq_super_admin());
drop policy if exists "Super admin manages admin profiles" on public.admin_profiles;
create policy "Super admin manages admin profiles" on public.admin_profiles for all to authenticated
using (public.is_desiq_super_admin()) with check (public.is_desiq_super_admin() and (role <> 'super_admin' or lower(email)='supportdesiq@gmail.com'));

drop policy if exists "Super admin manages invitations" on public.admin_invitations;
create policy "Super admin manages invitations" on public.admin_invitations for all to authenticated using(public.is_desiq_super_admin()) with check(public.is_desiq_super_admin());
drop policy if exists "Admins read own world assignments" on public.admin_world_assignments;
create policy "Admins read own world assignments" on public.admin_world_assignments for select to authenticated using(admin_user_id=auth.uid() or public.is_desiq_super_admin());
drop policy if exists "Super admin manages world assignments" on public.admin_world_assignments;
create policy "Super admin manages world assignments" on public.admin_world_assignments for all to authenticated using(public.is_desiq_super_admin()) with check(public.is_desiq_super_admin());
drop policy if exists "Admins read own student assignments" on public.admin_student_assignments;
create policy "Admins read own student assignments" on public.admin_student_assignments for select to authenticated using(admin_user_id=auth.uid() or public.is_desiq_super_admin());
drop policy if exists "Super admin manages student assignments" on public.admin_student_assignments;
create policy "Super admin manages student assignments" on public.admin_student_assignments for all to authenticated using(public.is_desiq_super_admin()) with check(public.is_desiq_super_admin());
drop policy if exists "Admins read own permissions" on public.admin_permissions;
create policy "Admins read own permissions" on public.admin_permissions for select to authenticated using(admin_user_id=auth.uid() or public.is_desiq_super_admin());
drop policy if exists "Super admin manages permissions" on public.admin_permissions;
create policy "Super admin manages permissions" on public.admin_permissions for all to authenticated using(public.is_desiq_super_admin()) with check(public.is_desiq_super_admin());
drop policy if exists "Super admin reads audit logs" on public.admin_audit_logs;
create policy "Super admin reads audit logs" on public.admin_audit_logs for select to authenticated using(public.is_desiq_super_admin());
drop policy if exists "Admins read assigned activity" on public.learning_activity_events;
create policy "Admins read assigned activity" on public.learning_activity_events for select to authenticated
using(public.is_desiq_super_admin() or exists(select 1 from public.admin_student_assignments s where s.admin_user_id=auth.uid() and s.student_user_id=learning_activity_events.student_user_id));
drop policy if exists "Students create own learning events" on public.learning_activity_events;
create policy "Students create own learning events" on public.learning_activity_events for insert to authenticated with check(student_user_id=auth.uid());

revoke all on public.admin_profiles,public.admin_invitations,public.admin_world_assignments,public.admin_student_assignments,public.admin_permissions,public.admin_audit_logs from anon;
grant select on public.admin_profiles to authenticated;
grant select,insert,update,delete on public.admin_invitations,public.admin_world_assignments,public.admin_student_assignments,public.admin_permissions to authenticated;
grant select on public.admin_audit_logs to authenticated;
grant select,insert on public.learning_activity_events to authenticated;
grant execute on function public.is_desiq_super_admin() to authenticated;
grant execute on function public.is_desiq_admin() to authenticated;
grant execute on function public.desiq_admin_overview() to authenticated;
grant execute on function public.desiq_admin_record_event(text,text,text,jsonb) to authenticated;

-- Existing student data remains student-owned; staff access to detailed records is added in a later scoped phase.
