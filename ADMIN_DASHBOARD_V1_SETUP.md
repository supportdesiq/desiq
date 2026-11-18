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
- GitHub Actions workflow to deploy the `admin-invite` Edge Function and set its `SITE_URL` secret without using a local laptop CLI.

## Required setup

1. In Supabase Dashboard → SQL Editor, run `supabase/admin_dashboard_v1.sql`.
2. Confirm that `supportdesiq@gmail.com` already exists as a Supabase Auth user. If it does, the SQL migration automatically bootstraps it as the protected Super Admin. If it does not exist yet, create/confirm that account; the auth trigger promotes it when the user record is created.
3. In the GitHub repository, open **Settings → Secrets and variables → Actions** and add these repository secrets:
   - `SUPABASE_ACCESS_TOKEN`: create a personal access token in the Supabase Dashboard under your account's **Access Tokens** page. Treat it like a password; never commit it or paste it into chat.
   - `SUPABASE_PROJECT_ID`: `tlpjmngeaxhjlpdgvpho`.
4. Ensure GitHub Actions are enabled for the repository. The workflow is `.github/workflows/deploy-supabase-admin-invite.yml`.
5. Push this workflow to the repository's `main` or `master` branch. It runs automatically when the workflow or `supabase/functions/admin-invite/**` changes. You can also run it manually from GitHub → **Actions** → **Deploy DESIQ admin invitation function** → **Run workflow**.
6. The workflow deploys `admin-invite` and sets the Edge Function secret `SITE_URL=https://desiq-kappa.vercel.app`.
7. Ensure Supabase Auth → URL Configuration allows `https://desiq-kappa.vercel.app/auth/callback` as a redirect URL.

Supabase automatically provides `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions. The service-role key is not required as a GitHub secret and must never be added to `.env.local` or any `NEXT_PUBLIC_*` variable.

## How to verify deployment

1. Open the GitHub repository → **Actions**.
2. Open the latest **Deploy DESIQ admin invitation function** run.
3. Confirm all steps have green check marks.
4. Sign in to DESIQ as `supportdesiq@gmail.com` and test an invitation using an email address you control.

If the workflow fails, open the failed run and share the error text with secrets/tokens redacted.

## Important boundaries in V1

- Admin access is checked against the database; hiding the link is not the security boundary.
- Only the Super Admin can create invitations or manage assignments.
- Staff overview counts are aggregate-only. Detailed student records and world-scoped analytics are intentionally not exposed in this first phase; the next phase will add scoped access to those records.
- Student activity metrics count explicit `learning_activity_events`. The event-recording RPC is available, but existing pages are not yet instrumented, so those counts may remain zero until event tracking is added.
- Existing IT Support owner access remains unchanged in this phase.
- The migration does not add fake students, sample analytics or synthetic activity.


## V2 follow-up

For clickable analytics, student profile drill-down and editing accepted staff access, run `supabase/admin_dashboard_v2.sql` after V1. See `ADMIN_DASHBOARD_V2_SETUP.md` for the detailed deployment notes.
