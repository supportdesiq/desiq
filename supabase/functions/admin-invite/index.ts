import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return Response.json({ error: 'Sign in required.' }, { status: 401, headers: corsHeaders });

    const callerClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) return Response.json({ error: 'Your session is not valid.' }, { status: 401, headers: corsHeaders });

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: callerRole } = await admin.from('admin_profiles').select('role,status').eq('user_id', user.id).maybeSingle();
    if (callerRole?.role !== 'super_admin' || callerRole.status !== 'active') {
      return Response.json({ error: 'Only the DESIQ Super Admin can invite staff.' }, { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    const email = String(body.email || '').trim().toLowerCase();
    const fullName = String(body.fullName || '').trim();
    const role = body.role;
    const learningWorlds = Array.isArray(body.learningWorlds) ? body.learningWorlds.filter((x: unknown) => typeof x === 'string') : [];
    const studentIds = Array.isArray(body.studentIds) ? body.studentIds.filter((x: unknown) => typeof x === 'string') : [];
    const capabilities = Array.isArray(body.capabilities) ? body.capabilities.filter((x: unknown) => typeof x === 'string') : [];
    const allowedRoles = ['staff_admin', 'learning_teacher'];
    const allowedCapabilities = ['view_assigned_students', 'review_submissions', 'manage_assigned_challenges', 'view_assigned_tickets', 'issue_certificate_recommendations'];
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !fullName || !allowedRoles.includes(role)) {
      return Response.json({ error: 'Enter a valid name, email and staff role.' }, { status: 400, headers: corsHeaders });
    }
    if (email === 'supportdesiq@gmail.com') return Response.json({ error: 'The Super Admin account cannot be invited or replaced.' }, { status: 400, headers: corsHeaders });
    if (learningWorlds.length > 20 || studentIds.length > 500 || capabilities.some((x: string) => !allowedCapabilities.includes(x))) {
      return Response.json({ error: 'The assignment or permission selection is invalid.' }, { status: 400, headers: corsHeaders });
    }

    const { data: existing } = await admin.from('admin_profiles').select('user_id').eq('email', email).maybeSingle();
    if (existing) return Response.json({ error: 'This email already has DESIQ admin access.' }, { status: 409, headers: corsHeaders });
    const { data: pending } = await admin.from('admin_invitations').select('id').eq('email', email).eq('status', 'pending').maybeSingle();
    if (pending) return Response.json({ error: 'A pending invitation already exists for this email.' }, { status: 409, headers: corsHeaders });

    const { data: invitation, error: insertError } = await admin.from('admin_invitations').insert({
      email, full_name: fullName, role, learning_worlds: learningWorlds, student_ids: studentIds,
      capabilities, invited_by: user.id,
    }).select('id').single();
    if (insertError) throw insertError;

    const siteUrl = Deno.env.get('SITE_URL') || 'https://desiq-kappa.vercel.app';
    const redirectTo = `${siteUrl.replace(/\/$/, '')}/auth/callback`;
    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, desiq_staff_invite: true },
      redirectTo,
    });
    if (inviteError) {
      await admin.from('admin_invitations').delete().eq('id', invitation.id);
      throw inviteError;
    }
    await admin.from('admin_audit_logs').insert({ actor_user_id: user.id, action: 'staff_invited', target_type: 'admin_invitation', target_id: invitation.id, details: { email, role, learningWorlds, studentCount: studentIds.length } });
    return Response.json({ success: true, message: `Invitation sent to ${email}.` }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send invitation.';
    return Response.json({ error: message }, { status: 400, headers: corsHeaders });
  }
});
