# DESIQ Admin Dashboard V1 — setup

This update adds the first general DESIQ admin workspace while preserving the existing student site and IT Support admin.

## Included
- `/admin` dashboard route with Supabase-backed overview metrics.
- Header Admin Dashboard link shown only to signed-in accounts with an active `admin_profiles` record.
- Protected Super Admin bootstrap for `supportdesiq@gmail.com`.
- Staff Admin and Learning Teacher role records.
- Staff invitation form with learning-world assignments, individual student UUID assignments and capability selections.
- Invitation Edge Function using the Supabase service-role key only on the server.
- Database tables and row-level security for roles, invitations, assignments, capabilities, audit logs and learning activity events.

## Required setup before deployment

1. In Supabase Dashboard → SQL Editor, run `supabase/admin_dashboard_v1.sql`.
2. Confirm that `supportdesiq@gmail.com` already exists as a Supabase Auth user. If it does, the SQL migration automatically bootstraps it as the protected Super Admin. If it does not exist yet, create/confirm that account; the auth trigger promotes it when the user record is created.
3. Deploy the Edge Function from the repository root:

   ```bash
   supabase functions deploy admin-invite
   ```

4. Set the Edge Function secrets (never add the service-role key to `.env.local` or `NEXT_PUBLIC_*` variables):

   ```bash
   supabase secrets set SITE_URL=https://desiq-kappa.vercel.app
   ```

   Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions automatically. If your project requires manually setting any of these, set them as Edge Function secrets only.

5. Ensure Supabase Auth → URL Configuration allows `https://desiq-kappa.vercel.app/auth/callback` as a redirect URL.
6. Deploy the website through the existing GitHub Desktop → Vercel workflow.

## Important boundaries in V1

- Admin access is checked against the database; hiding the link is not the security boundary.
- Only the Super Admin can create invitations or manage assignments.
- Staff overview counts are aggregate-only. Detailed student records and world-scoped analytics are intentionally not exposed in this first phase; the next phase will add scoped access to those records.
- Student activity metrics count explicit `learning_activity_events`. The event-recording RPC is available, but existing pages are not yet instrumented, so those counts may remain zero until event tracking is added.
- Existing IT Support owner access remains unchanged in this phase.
- The migration does not add fake students, sample analytics or synthetic activity.
