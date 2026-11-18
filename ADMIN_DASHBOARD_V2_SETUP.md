# DESIQ Admin Dashboard V2 — setup

This update extends the existing V1 dashboard. It adds clickable metric details, student profile drill-down and post-acceptance staff access editing.

## Before deploying the website

1. Open Supabase Dashboard → SQL Editor.
2. Create a new query.
3. Paste the complete contents of `supabase/admin_dashboard_v2.sql`.
4. Run it after the existing V1 migration. This is an additive migration; do not rerun or replace V1.

## Deploy the website

Use the existing GitHub Desktop → GitHub → Vercel workflow. Keep `.env.local` local and do not commit it. No Edge Function redeployment is required for this V2 update.

## V2 functionality

- All eight overview metric cards open a searchable detail view backed by Supabase.
- Student records show email, registration date and last sign-in where available.
- Learning event, challenge completion and saved project details are shown from existing records.
- Selecting a student opens a profile with recorded learning events, saved projects and challenge completions.
- Super Admin can edit an accepted staff member's role, status, learning-world assignments, individual student assignments and capabilities.
- Suspending staff immediately blocks admin dashboard access through the existing active-profile check.
- Every staff access edit is recorded in `admin_audit_logs`.

## Access boundaries

- Super Admin can inspect all student records and manage all staff access.
- Non-super-admin staff can drill down only into individually assigned student records. Their global staff and invitation detail views remain unavailable.
- Learning-world assignment does not automatically expose unrelated student records.
- Student profile details are served by security-definer RPCs that enforce these checks server-side.

## Data notes

- Activity details include only explicit rows in `learning_activity_events`. Existing pages are not automatically instrumented by this update; zero events means no events have been recorded yet.
- Student names are read from Supabase Auth user metadata (`full_name` or `name`); if neither exists, the name may be blank while the email remains available.
- Saved project and challenge details use the existing `saved_designs` and `challenge_completions` tables.
- No synthetic or sample student data is added.
