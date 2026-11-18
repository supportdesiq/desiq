-- DESIQ Admin Dashboard V3
-- Run after admin_dashboard_v1.sql and admin_dashboard_v2.sql.
-- Adds per-staff field permissions and a scoped staff workspace.

create table if not exists public.admin_field_permissions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.admin_profiles(user_id) on delete cascade,
  field_key text not null,
  is_allowed boolean not null default false,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  unique(admin_user_id, field_key),
  constraint admin_field_permissions_field_key_check check (field_key in (
    'student_name','student_email','registration_date','last_sign_in',
    'learning_activity','saved_projects','challenge_results','subscription_details',
    'phone_number','support_history'
  ))
);

alter table public.admin_field_permissions enable row level security;
drop policy if exists "Staff read own field permissions" on public.admin_field_permissions;
create policy "Staff read own field permissions" on public.admin_field_permissions
  for select to authenticated using (admin_user_id=auth.uid() or public.is_desiq_super_admin());
drop policy if exists "Super Admin manages field permissions" on public.admin_field_permissions;
create policy "Super Admin manages field permissions" on public.admin_field_permissions
  for all to authenticated using (public.is_desiq_super_admin()) with check (public.is_desiq_super_admin());
revoke all on public.admin_field_permissions from anon;
grant select on public.admin_field_permissions to authenticated;

-- Field-level defaults for existing staff: useful teaching data, no contact/billing/support data.
insert into public.admin_field_permissions(admin_user_id,field_key,is_allowed,updated_by)
select p.user_id, f.field_key, f.is_allowed, (select user_id from public.admin_profiles where lower(email)='supportdesiq@gmail.com' limit 1)
from public.admin_profiles p
cross join (values
 ('student_name',true),('student_email',false),('registration_date',false),('last_sign_in',true),
 ('learning_activity',true),('saved_projects',true),('challenge_results',true),
 ('subscription_details',false),('phone_number',false),('support_history',false)
) as f(field_key,is_allowed)
where p.role <> 'super_admin'
on conflict(admin_user_id,field_key) do nothing;

create or replace function public.desiq_update_staff_access_v3(
  p_staff_user_id uuid,
  p_role text,
  p_status text,
  p_worlds text[] default '{}',
  p_student_ids uuid[] default '{}',
  p_capabilities text[] default '{}',
  p_field_permissions jsonb default '{}'::jsonb
) returns void
language plpgsql security definer set search_path=public,auth
as $$
declare item record;
begin
  if not public.is_desiq_super_admin() then raise exception 'Only the Super Admin can change staff access'; end if;
  if p_role not in ('staff_admin','learning_teacher') then raise exception 'Invalid staff role'; end if;
  if p_status not in ('active','suspended') then raise exception 'Invalid staff status'; end if;
  if exists(select 1 from public.admin_profiles where user_id=p_staff_user_id and (role='super_admin' or lower(email)='supportdesiq@gmail.com')) then
    raise exception 'The Super Admin account is protected';
  end if;
  if not exists(select 1 from public.admin_profiles where user_id=p_staff_user_id) then raise exception 'Staff account not found'; end if;

  update public.admin_profiles set role=p_role,status=p_status,updated_at=now() where user_id=p_staff_user_id;
  delete from public.admin_world_assignments where admin_user_id=p_staff_user_id;
  insert into public.admin_world_assignments(admin_user_id,world_slug,assigned_by)
    select p_staff_user_id,slug,auth.uid() from unnest(coalesce(p_worlds,'{}')) x(slug)
    where length(slug) between 1 and 80 on conflict do nothing;
  delete from public.admin_student_assignments where admin_user_id=p_staff_user_id;
  insert into public.admin_student_assignments(admin_user_id,student_user_id,assigned_by)
    select p_staff_user_id,sid,auth.uid() from unnest(coalesce(p_student_ids,'{}')) x(sid)
    where exists(select 1 from auth.users u where u.id=sid) on conflict do nothing;
  delete from public.admin_permissions where admin_user_id=p_staff_user_id;
  insert into public.admin_permissions(admin_user_id,capability,granted_by)
    select p_staff_user_id,c,auth.uid() from unnest(coalesce(p_capabilities,'{}')) x(c)
    where c in ('view_assigned_students','review_submissions','manage_assigned_challenges','view_assigned_tickets','issue_certificate_recommendations') on conflict do nothing;

  delete from public.admin_field_permissions where admin_user_id=p_staff_user_id;
  for item in select key,value from jsonb_each(coalesce(p_field_permissions,'{}'::jsonb)) loop
    if item.key in ('student_name','student_email','registration_date','last_sign_in','learning_activity','saved_projects','challenge_results','subscription_details','phone_number','support_history') then
      insert into public.admin_field_permissions(admin_user_id,field_key,is_allowed,updated_by)
      values(p_staff_user_id,item.key,coalesce((item.value#>>'{}')::boolean,false),auth.uid());
    end if;
  end loop;
  insert into public.admin_audit_logs(actor_user_id,action,target_type,target_id,details)
  values(auth.uid(),'staff_access_updated_v3','admin_profile',p_staff_user_id::text,
    jsonb_build_object('role',p_role,'status',p_status,'worlds',coalesce(p_worlds,'{}'),'student_count',cardinality(coalesce(p_student_ids,'{}')),'capabilities',coalesce(p_capabilities,'{}'),'field_permissions',coalesce(p_field_permissions,'{}'::jsonb)));
end;
$$;
revoke all on function public.desiq_update_staff_access_v3(uuid,text,text,text[],uuid[],text[],jsonb) from public,anon;
grant execute on function public.desiq_update_staff_access_v3(uuid,text,text,text[],uuid[],text[],jsonb) to authenticated;

create or replace function public.desiq_admin_workspace_v3()
returns jsonb language plpgsql stable security definer set search_path=public,auth
as $$
declare result jsonb; me uuid:=auth.uid(); super_admin boolean:=public.is_desiq_super_admin(); can_view_students boolean;
begin
 if not public.is_desiq_admin() then raise exception 'Active DESIQ staff access required'; end if;
 can_view_students:=super_admin or exists(select 1 from public.admin_permissions where admin_user_id=me and capability='view_assigned_students');
 if super_admin then
   return jsonb_build_object('role','super_admin','worlds','[]'::jsonb,'capabilities','[]'::jsonb,'fields','{}'::jsonb,
     'assigned_students',0,'students_needing_review',0,'recent_events',0);
 end if;
 select jsonb_build_object(
  'role',p.role,
  'worlds',coalesce((select jsonb_agg(world_slug order by world_slug) from public.admin_world_assignments where admin_user_id=me),'[]'::jsonb),
  'capabilities',coalesce((select jsonb_agg(capability order by capability) from public.admin_permissions where admin_user_id=me),'[]'::jsonb),
  'fields',coalesce((select jsonb_object_agg(field_key,is_allowed) from public.admin_field_permissions where admin_user_id=me),'{}'::jsonb),
  'assigned_students',case when can_view_students then (select count(distinct student_id) from (
    select student_user_id student_id from public.admin_student_assignments where admin_user_id=me
    union select student_user_id from public.learning_activity_events where world_slug in (select world_slug from public.admin_world_assignments where admin_user_id=me)
  ) s) else 0 end,
  'students_needing_review',0,
  'recent_events',case when can_view_students and exists(select 1 from public.admin_permissions where admin_user_id=me and capability='view_assigned_students') then (select count(*) from public.learning_activity_events e where e.created_at>=now()-interval '7 days' and (
    exists(select 1 from public.admin_student_assignments a where a.admin_user_id=me and a.student_user_id=e.student_user_id)
    or exists(select 1 from public.admin_world_assignments w where w.admin_user_id=me and w.world_slug=e.world_slug)
  )) else 0 end
 ) into result from public.admin_profiles p where p.user_id=me;
 return result;
end;
$$;
revoke all on function public.desiq_admin_workspace_v3() from public,anon;
grant execute on function public.desiq_admin_workspace_v3() to authenticated;

-- Replace the V2 detail RPC with a permission-aware version. Staff records are scoped
-- to directly assigned students OR events in assigned worlds. Sensitive fields are omitted.
create or replace function public.desiq_admin_metric_details(p_metric text)
returns jsonb language plpgsql stable security definer set search_path=public,auth
as $$
declare result jsonb; me uuid:=auth.uid(); super_admin boolean:=public.is_desiq_super_admin(); can_view_students boolean;
 can_email boolean:=super_admin or coalesce((select is_allowed from public.admin_field_permissions where admin_user_id=me and field_key='student_email'),false);
 can_name boolean:=super_admin or coalesce((select is_allowed from public.admin_field_permissions where admin_user_id=me and field_key='student_name'),true);
 can_reg boolean:=super_admin or coalesce((select is_allowed from public.admin_field_permissions where admin_user_id=me and field_key='registration_date'),false);
 can_signin boolean:=super_admin or coalesce((select is_allowed from public.admin_field_permissions where admin_user_id=me and field_key='last_sign_in'),true);
 can_activity boolean:=super_admin or coalesce((select is_allowed from public.admin_field_permissions where admin_user_id=me and field_key='learning_activity'),true);
 can_projects boolean:=super_admin or coalesce((select is_allowed from public.admin_field_permissions where admin_user_id=me and field_key='saved_projects'),true);
 can_challenges boolean:=super_admin or coalesce((select is_allowed from public.admin_field_permissions where admin_user_id=me and field_key='challenge_results'),true);
begin
 if not public.is_desiq_admin() then raise exception 'Admin access required'; end if;
 can_view_students:=super_admin or exists(select 1 from public.admin_permissions where admin_user_id=me and capability='view_assigned_students');
 if not can_view_students and p_metric not in ('active_staff','pending_invitations') then raise exception 'View assigned students permission is not granted'; end if;
 if p_metric in ('active_staff','pending_invitations') and not super_admin then raise exception 'Super Admin access required'; end if;
 case p_metric
 when 'registered_students','active_today','new_registrations_7d' then
  result := (select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object('user_id',u.id,
   'full_name',case when can_name then coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name','') end,
   'email',case when can_email then u.email end,
   'created_at',case when can_reg or super_admin then u.created_at end,
   'last_sign_in_at',case when can_signin then u.last_sign_in_at end))),'[]'::jsonb)
  from auth.users u where not exists(select 1 from public.admin_profiles a where a.user_id=u.id)
   and (p_metric<>'active_today' or u.last_sign_in_at>=date_trunc('day',now()))
   and (p_metric<>'new_registrations_7d' or u.created_at>=now()-interval '7 days')
   and (super_admin or exists(select 1 from public.admin_student_assignments a where a.admin_user_id=me and a.student_user_id=u.id)
    or exists(select 1 from public.learning_activity_events e join public.admin_world_assignments w on w.world_slug=e.world_slug and w.admin_user_id=me where e.student_user_id=u.id)));
 when 'learning_events_7d' then
  if not can_activity then raise exception 'Learning activity permission is not granted'; end if;
  result := (select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id',e.id,'user_id',e.student_user_id,
   'student_name',case when can_name then coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name','') end,
   'email',case when can_email then u.email end,'world_slug',e.world_slug,'event_type',e.event_type,'event_label',e.event_label,'created_at',e.created_at))),'[]'::jsonb)
  from public.learning_activity_events e join auth.users u on u.id=e.student_user_id
  where e.created_at>=now()-interval '7 days' and (super_admin or exists(select 1 from public.admin_student_assignments a where a.admin_user_id=me and a.student_user_id=e.student_user_id) or exists(select 1 from public.admin_world_assignments w where w.admin_user_id=me and w.world_slug=e.world_slug)));
 when 'active_staff' then
  result := (select coalesce(jsonb_agg(to_jsonb(p)),'[]'::jsonb) from public.admin_profiles p where p.status='active');
 when 'pending_invitations' then
  result := (select coalesce(jsonb_agg(to_jsonb(i)),'[]'::jsonb) from public.admin_invitations i where i.status='pending' and i.expires_at>now());
 when 'completed_challenges' then
  if not can_challenges then raise exception 'Challenge results permission is not granted'; end if;
  result := (select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id',c.id,'user_id',c.user_id,'student_name',case when can_name then coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name','') end,'email',case when can_email then u.email end,'challenge_key',c.challenge_key,'project_name',c.project_name,'score',c.score,'completed_at',c.completed_at))),'[]'::jsonb) from public.challenge_completions c join auth.users u on u.id=c.user_id where super_admin or exists(select 1 from public.admin_student_assignments a where a.admin_user_id=me and a.student_user_id=c.user_id));
 when 'saved_projects' then
  if not can_projects then raise exception 'Saved projects permission is not granted'; end if;
  result := (select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id',d.id,'user_id',d.user_id,'student_name',case when can_name then coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name','') end,'email',case when can_email then u.email end,'project_name',d.project_name,'challenge_key',d.challenge_key,'updated_at',d.updated_at))),'[]'::jsonb) from public.saved_designs d join auth.users u on u.id=d.user_id where super_admin or exists(select 1 from public.admin_student_assignments a where a.admin_user_id=me and a.student_user_id=d.user_id));
 else raise exception 'Unknown metric'; end case;
 return jsonb_build_object('metric',p_metric,'items',coalesce(result,'[]'::jsonb));
end;
$$;
revoke all on function public.desiq_admin_metric_details(text) from public,anon;
grant execute on function public.desiq_admin_metric_details(text) to authenticated;

create or replace function public.desiq_admin_student_profile(p_student_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public,auth
as $$
declare me uuid:=auth.uid(); super_admin boolean:=public.is_desiq_super_admin(); allowed_student boolean;
 fields jsonb; student_record jsonb; event_records jsonb:='[]'::jsonb; project_records jsonb:='[]'::jsonb; completion_records jsonb:='[]'::jsonb;
 can_name boolean; can_email boolean; can_reg boolean; can_signin boolean; can_activity boolean; can_projects boolean; can_challenges boolean; can_view_students boolean;
begin
 if not public.is_desiq_admin() then raise exception 'Admin access required'; end if;
 can_view_students:=super_admin or exists(select 1 from public.admin_permissions where admin_user_id=me and capability='view_assigned_students');
 if not can_view_students then raise exception 'View assigned students permission is not granted'; end if;
 allowed_student:=super_admin or exists(select 1 from public.admin_student_assignments a where a.admin_user_id=me and a.student_user_id=p_student_id)
  or exists(select 1 from public.learning_activity_events e join public.admin_world_assignments w on w.admin_user_id=me and w.world_slug=e.world_slug where e.student_user_id=p_student_id);
 if not allowed_student then raise exception 'Student is outside your assigned worlds and students'; end if;
 select coalesce(jsonb_object_agg(field_key,is_allowed),'{}'::jsonb) into fields from public.admin_field_permissions where admin_user_id=me;
 can_name:=super_admin or coalesce((fields->>'student_name')::boolean,true); can_email:=super_admin or coalesce((fields->>'student_email')::boolean,false);
 can_reg:=super_admin or coalesce((fields->>'registration_date')::boolean,false); can_signin:=super_admin or coalesce((fields->>'last_sign_in')::boolean,true);
 can_activity:=super_admin or coalesce((fields->>'learning_activity')::boolean,true); can_projects:=super_admin or coalesce((fields->>'saved_projects')::boolean,true); can_challenges:=super_admin or coalesce((fields->>'challenge_results')::boolean,true);
 select jsonb_strip_nulls(jsonb_build_object('user_id',u.id,'full_name',case when can_name then coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name','') end,'email',case when can_email then u.email end,'created_at',case when can_reg then u.created_at end,'last_sign_in_at',case when can_signin then u.last_sign_in_at end)) into student_record
 from auth.users u where u.id=p_student_id and not exists(select 1 from public.admin_profiles a where a.user_id=u.id);
 if student_record is null then raise exception 'Student not found'; end if;
 if can_activity then select coalesce(jsonb_agg(to_jsonb(e) order by e.created_at desc),'[]'::jsonb) into event_records from (select id,world_slug,event_type,event_label,metadata,created_at from public.learning_activity_events where student_user_id=p_student_id and (super_admin or exists(select 1 from public.admin_world_assignments w where w.admin_user_id=me and w.world_slug=learning_activity_events.world_slug) or (exists(select 1 from public.admin_student_assignments a where a.admin_user_id=me and a.student_user_id=p_student_id) and (not exists(select 1 from public.admin_world_assignments w0 where w0.admin_user_id=me) or exists(select 1 from public.admin_world_assignments w1 where w1.admin_user_id=me and w1.world_slug=learning_activity_events.world_slug)))) order by created_at desc limit 50) e; end if;
 if can_projects then select coalesce(jsonb_agg(to_jsonb(d) order by d.updated_at desc),'[]'::jsonb) into project_records from (select id,challenge_key,project_name,created_at,updated_at from public.saved_designs where user_id=p_student_id and (super_admin or exists(select 1 from public.admin_student_assignments a where a.admin_user_id=me and a.student_user_id=p_student_id)) order by updated_at desc limit 50) d; end if;
 if can_challenges then select coalesce(jsonb_agg(to_jsonb(c) order by c.completed_at desc),'[]'::jsonb) into completion_records from (select id,challenge_key,project_name,score,completed_at from public.challenge_completions where user_id=p_student_id and (super_admin or exists(select 1 from public.admin_student_assignments a where a.admin_user_id=me and a.student_user_id=p_student_id)) order by completed_at desc limit 50) c; end if;
 return jsonb_build_object('student',student_record,'events',event_records,'projects',project_records,'completions',completion_records,'visible_fields',fields);
end;
$$;
revoke all on function public.desiq_admin_student_profile(uuid) from public,anon;
grant execute on function public.desiq_admin_student_profile(uuid) to authenticated;

-- Scoped summary for staff; Super Admin continues to use the existing global overview.
create or replace function public.desiq_admin_overview()
returns jsonb language plpgsql stable security definer set search_path=public,auth
as $$
declare me uuid:=auth.uid(); super_admin boolean:=public.is_desiq_super_admin(); result jsonb; can_view_students boolean; can_activity boolean; can_projects boolean; can_challenges boolean;
begin
 if not public.is_desiq_admin() then raise exception 'Admin access required'; end if;
 can_view_students:=super_admin or exists(select 1 from public.admin_permissions where admin_user_id=me and capability='view_assigned_students');
 can_activity:=super_admin or coalesce((select is_allowed from public.admin_field_permissions where admin_user_id=me and field_key='learning_activity'),true);
 can_projects:=super_admin or coalesce((select is_allowed from public.admin_field_permissions where admin_user_id=me and field_key='saved_projects'),true);
 can_challenges:=super_admin or coalesce((select is_allowed from public.admin_field_permissions where admin_user_id=me and field_key='challenge_results'),true);
 if super_admin then
  select jsonb_build_object(
   'registered_students',(select count(*) from auth.users u where not exists(select 1 from public.admin_profiles a where a.user_id=u.id)),
   'new_registrations_7d',(select count(*) from auth.users u where u.created_at>=now()-interval '7 days' and not exists(select 1 from public.admin_profiles a where a.user_id=u.id)),
   'active_today',(select count(*) from auth.users u where u.last_sign_in_at>=date_trunc('day',now()) and not exists(select 1 from public.admin_profiles a where a.user_id=u.id)),
   'learning_events_7d',(select count(*) from public.learning_activity_events e where e.created_at>=now()-interval '7 days'),
   'active_staff',(select count(*) from public.admin_profiles p where p.status='active'),
   'pending_invitations',(select count(*) from public.admin_invitations i where i.status='pending' and i.expires_at>now()),
   'completed_challenges',(select count(*) from public.challenge_completions),
   'saved_projects',(select count(*) from public.saved_designs)) into result;
 else
  select jsonb_build_object(
   'registered_students',case when can_view_students then (select count(distinct student_id) from (select student_user_id student_id from public.admin_student_assignments where admin_user_id=me union select student_user_id from public.learning_activity_events where world_slug in(select world_slug from public.admin_world_assignments where admin_user_id=me)) s) else 0 end,
   'new_registrations_7d',case when can_view_students then (select count(*) from auth.users u where u.created_at>=now()-interval '7 days' and (exists(select 1 from public.admin_student_assignments a where a.admin_user_id=me and a.student_user_id=u.id) or exists(select 1 from public.learning_activity_events e join public.admin_world_assignments w on w.admin_user_id=me and w.world_slug=e.world_slug where e.student_user_id=u.id))) else 0 end,
   'active_today',case when can_view_students then (select count(distinct u.id) from auth.users u where u.last_sign_in_at>=date_trunc('day',now()) and (exists(select 1 from public.admin_student_assignments a where a.admin_user_id=me and a.student_user_id=u.id) or exists(select 1 from public.learning_activity_events e join public.admin_world_assignments w on w.admin_user_id=me and w.world_slug=e.world_slug where e.student_user_id=u.id))) else 0 end,
   'learning_events_7d',case when can_view_students and can_activity then (select count(*) from public.learning_activity_events e where e.created_at>=now()-interval '7 days' and (exists(select 1 from public.admin_student_assignments a where a.admin_user_id=me and a.student_user_id=e.student_user_id) or exists(select 1 from public.admin_world_assignments w where w.admin_user_id=me and w.world_slug=e.world_slug))) else 0 end,
   'active_staff',0,'pending_invitations',0,
   'completed_challenges',case when can_view_students and can_challenges then (select count(*) from public.challenge_completions c where exists(select 1 from public.admin_student_assignments a where a.admin_user_id=me and a.student_user_id=c.user_id)) else 0 end,
   'saved_projects',case when can_view_students and can_projects then (select count(*) from public.saved_designs d where exists(select 1 from public.admin_student_assignments a where a.admin_user_id=me and a.student_user_id=d.user_id)) else 0 end) into result;
 end if;
 return result;
end;
$$;
revoke all on function public.desiq_admin_overview() from public,anon;
grant execute on function public.desiq_admin_overview() to authenticated;
