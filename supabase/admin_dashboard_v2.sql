-- DESIQ Admin Dashboard V2
-- Run after admin_dashboard_v1.sql in Supabase SQL Editor.
-- Adds secure drill-down RPCs and Super Admin staff-access editing.

create or replace function public.desiq_admin_metric_details(p_metric text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  result jsonb;
  super_admin boolean := public.is_desiq_super_admin();
begin
  if not public.is_desiq_admin() then
    raise exception 'Admin access required';
  end if;

  if p_metric in ('active_staff','pending_invitations') and not super_admin then
    return jsonb_build_object('metric',p_metric,'items','[]'::jsonb);
  end if;

  case p_metric
    when 'registered_students' then
      select coalesce(jsonb_agg(x order by (x->>'created_at') desc),'[]'::jsonb) into result
      from (
        select jsonb_build_object('user_id',u.id,'full_name',coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name',''),
          'email',u.email,'created_at',u.created_at,'last_sign_in_at',u.last_sign_in_at) x
        from auth.users u
        where not exists(select 1 from public.admin_profiles a where a.user_id=u.id)
          and (super_admin or exists(select 1 from public.admin_student_assignments a where a.admin_user_id=auth.uid() and a.student_user_id=u.id))
      ) q;
    when 'active_today' then
      select coalesce(jsonb_agg(x order by (x->>'last_sign_in_at') desc),'[]'::jsonb) into result
      from (
        select jsonb_build_object('user_id',u.id,'full_name',coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name',''),
          'email',u.email,'last_sign_in_at',u.last_sign_in_at) x
        from auth.users u
        where u.last_sign_in_at >= date_trunc('day',now())
          and not exists(select 1 from public.admin_profiles a where a.user_id=u.id)
          and (super_admin or exists(select 1 from public.admin_student_assignments a where a.admin_user_id=auth.uid() and a.student_user_id=u.id))
      ) q;
    when 'new_registrations_7d' then
      select coalesce(jsonb_agg(x order by (x->>'created_at') desc),'[]'::jsonb) into result
      from (
        select jsonb_build_object('user_id',u.id,'full_name',coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name',''),
          'email',u.email,'created_at',u.created_at) x
        from auth.users u
        where u.created_at >= now()-interval '7 days'
          and not exists(select 1 from public.admin_profiles a where a.user_id=u.id)
          and (super_admin or exists(select 1 from public.admin_student_assignments a where a.admin_user_id=auth.uid() and a.student_user_id=u.id))
      ) q;
    when 'learning_events_7d' then
      select coalesce(jsonb_agg(x order by (x->>'created_at') desc),'[]'::jsonb) into result
      from (
        select jsonb_build_object('id',e.id,'user_id',e.student_user_id,
          'student_name',coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name',''),
          'email',u.email,'world_slug',e.world_slug,'event_type',e.event_type,
          'event_label',e.event_label,'created_at',e.created_at) x
        from public.learning_activity_events e
        join auth.users u on u.id=e.student_user_id
        where e.created_at >= now()-interval '7 days'
          and (super_admin or exists(select 1 from public.admin_student_assignments a where a.admin_user_id=auth.uid() and a.student_user_id=e.student_user_id))
      ) q;
    when 'active_staff' then
      select coalesce(jsonb_agg(to_jsonb(p) order by p.created_at desc),'[]'::jsonb) into result
      from public.admin_profiles p where p.status='active';
    when 'pending_invitations' then
      select coalesce(jsonb_agg(to_jsonb(i) order by i.created_at desc),'[]'::jsonb) into result
      from public.admin_invitations i where i.status='pending' and i.expires_at>now();
    when 'completed_challenges' then
      select coalesce(jsonb_agg(x order by (x->>'completed_at') desc),'[]'::jsonb) into result
      from (
        select jsonb_build_object('id',c.id,'user_id',c.user_id,
          'student_name',coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name',''),
          'email',u.email,'challenge_key',c.challenge_key,'project_name',c.project_name,
          'score',c.score,'completed_at',c.completed_at) x
        from public.challenge_completions c join auth.users u on u.id=c.user_id
        where super_admin or exists(select 1 from public.admin_student_assignments a where a.admin_user_id=auth.uid() and a.student_user_id=c.user_id)
      ) q;
    when 'saved_projects' then
      select coalesce(jsonb_agg(x order by (x->>'updated_at') desc),'[]'::jsonb) into result
      from (
        select jsonb_build_object('id',d.id,'user_id',d.user_id,
          'student_name',coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name',''),
          'email',u.email,'project_name',d.project_name,'challenge_key',d.challenge_key,
          'updated_at',d.updated_at) x
        from public.saved_designs d join auth.users u on u.id=d.user_id
        where super_admin or exists(select 1 from public.admin_student_assignments a where a.admin_user_id=auth.uid() and a.student_user_id=d.user_id)
      ) q;
    else
      raise exception 'Unknown metric';
  end case;
  return jsonb_build_object('metric',p_metric,'items',coalesce(result,'[]'::jsonb));
end;
$$;

create or replace function public.desiq_admin_student_profile(p_student_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  student_record jsonb;
  event_records jsonb;
  project_records jsonb;
  completion_records jsonb;
begin
  if not public.is_desiq_admin() then raise exception 'Admin access required'; end if;
  if not public.is_desiq_super_admin() and not exists(
    select 1 from public.admin_student_assignments a
    where a.admin_user_id=auth.uid() and a.student_user_id=p_student_id
  ) then raise exception 'This student is not assigned to your account'; end if;

  select jsonb_build_object('user_id',u.id,'email',u.email,
    'full_name',coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name',''),
    'created_at',u.created_at,'last_sign_in_at',u.last_sign_in_at)
  into student_record
  from auth.users u
  where u.id=p_student_id and not exists(select 1 from public.admin_profiles a where a.user_id=u.id);

  if student_record is null then raise exception 'Student not found'; end if;

  select coalesce(jsonb_agg(to_jsonb(e) order by e.created_at desc),'[]'::jsonb)
  into event_records from (
    select id,world_slug,event_type,event_label,metadata,created_at
    from public.learning_activity_events where student_user_id=p_student_id
    order by created_at desc limit 50
  ) e;
  select coalesce(jsonb_agg(to_jsonb(d) order by d.updated_at desc),'[]'::jsonb)
  into project_records from (
    select id,challenge_key,project_name,created_at,updated_at
    from public.saved_designs where user_id=p_student_id
    order by updated_at desc limit 50
  ) d;
  select coalesce(jsonb_agg(to_jsonb(c) order by c.completed_at desc),'[]'::jsonb)
  into completion_records from (
    select id,challenge_key,project_name,score,completed_at
    from public.challenge_completions where user_id=p_student_id
    order by completed_at desc limit 50
  ) c;

  return jsonb_build_object('student',student_record,'events',event_records,'projects',project_records,'completions',completion_records);
end;
$$;

create or replace function public.desiq_update_staff_access(
  p_staff_user_id uuid,
  p_role text,
  p_status text,
  p_worlds text[] default '{}',
  p_student_ids uuid[] default '{}',
  p_capabilities text[] default '{}'
) returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_desiq_super_admin() then raise exception 'Only the Super Admin can change staff access'; end if;
  if p_role not in ('staff_admin','learning_teacher') then raise exception 'Invalid staff role'; end if;
  if p_status not in ('active','suspended') then raise exception 'Invalid staff status'; end if;
  if exists(select 1 from public.admin_profiles where user_id=p_staff_user_id and (role='super_admin' or lower(email)='supportdesiq@gmail.com')) then
    raise exception 'The Super Admin account is protected';
  end if;
  if not exists(select 1 from public.admin_profiles where user_id=p_staff_user_id) then
    raise exception 'Staff account not found';
  end if;

  update public.admin_profiles set role=p_role,status=p_status,updated_at=now()
  where user_id=p_staff_user_id;

  delete from public.admin_world_assignments where admin_user_id=p_staff_user_id;
  insert into public.admin_world_assignments(admin_user_id,world_slug,assigned_by)
  select p_staff_user_id,slug,auth.uid() from unnest(coalesce(p_worlds,'{}')) as x(slug)
  where length(slug) between 1 and 80
  on conflict(admin_user_id,world_slug) do nothing;

  delete from public.admin_student_assignments where admin_user_id=p_staff_user_id;
  insert into public.admin_student_assignments(admin_user_id,student_user_id,assigned_by)
  select p_staff_user_id,student_id,auth.uid() from unnest(coalesce(p_student_ids,'{}')) as x(student_id)
  where exists(select 1 from auth.users u where u.id=student_id)
  on conflict(admin_user_id,student_user_id) do nothing;

  delete from public.admin_permissions where admin_user_id=p_staff_user_id;
  insert into public.admin_permissions(admin_user_id,capability,granted_by)
  select p_staff_user_id,capability,auth.uid() from unnest(coalesce(p_capabilities,'{}')) as x(capability)
  where capability in ('view_assigned_students','review_submissions','manage_assigned_challenges','view_assigned_tickets','issue_certificate_recommendations')
  on conflict(admin_user_id,capability) do nothing;

  insert into public.admin_audit_logs(actor_user_id,action,target_type,target_id,details)
  values(auth.uid(),'staff_access_updated','admin_profile',p_staff_user_id::text,
    jsonb_build_object('role',p_role,'status',p_status,'worlds',coalesce(p_worlds,'{}'),
      'student_count',cardinality(coalesce(p_student_ids,'{}')),'capabilities',coalesce(p_capabilities,'{}')));
end;
$$;

grant execute on function public.desiq_admin_metric_details(text) to authenticated;
grant execute on function public.desiq_admin_student_profile(uuid) to authenticated;
grant execute on function public.desiq_update_staff_access(uuid,text,text,text[],uuid[],text[]) to authenticated;
