# DESIQ Admin Dashboard V3 — setup

V3 extends the deployed V1/V2 admin dashboard. It adds individual field-level permissions, a staff-scoped workspace, permission-aware student detail RPCs, and a clear distinction between the originally invited role and the current staff role.

## Before deploying

1. Confirm V1 and V2 migrations have already been run. Do not rerun them.
2. In Supabase Dashboard → SQL Editor, create a new query.
3. Run the complete `supabase/admin_dashboard_v3.sql` migration.
4. Confirm it completes without errors.
5. Deploy the website using the existing GitHub Desktop → GitHub → Vercel workflow.

No new Edge Function or GitHub Actions secret is required for V3.

## V3 access model

- Super Admin retains organisation-wide access.
- Staff workspace counts and drill-downs are scoped to directly assigned students and students with recorded activity in assigned learning worlds.
- A learning-world assignment alone does not fabricate student enrolments. It scopes access to students who have recorded events in that world.
- Individual field permissions control student name, email, registration date, last sign-in, learning activity, saved projects, challenge results, subscription details, phone number and support history.
- New field permissions default to a safe teaching profile: name, last sign-in, learning activity, projects and challenge results allowed; email, registration, subscription, phone and support history denied. Super Admin can change each field per staff member.
- Sensitive fields are omitted in the Supabase RPC response when not authorised. This is not merely a visual hide.
- The existing role and capability permissions remain in place. V3 does not add phone or support data to the current schema; those controls are ready for supported data sources if/when connected.
- Invitation History preserves the originally invited role and displays the current role for accepted staff.

## Important data notes

- Activity counts depend on explicit `learning_activity_events` records. Existing pages that have not been instrumented may show zero activity.
- The V3 staff workspace uses assigned student UUIDs and learning-world activity records. It does not infer course enrolment from the category catalogue.
- If a staff member has no direct student assignments and no activity in assigned worlds, the student list/details will be empty until real assignments or events exist.

## Rollback

The migration is additive and replaces selected RPC function definitions. It does not delete student, staff, invitation, assignment or learning records. If a rollback is needed, restore the previous RPC definitions from `admin_dashboard_v2.sql`; do not drop the V3 permission table until you have reviewed the access records.
