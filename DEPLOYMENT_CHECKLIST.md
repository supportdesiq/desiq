# DESIQ launch checklist

## Before first public preview
- [ ] Replace `supportdesiq@gmail.com` with a working contact address.
- [ ] Confirm the final domain and connect it in Vercel.
- [ ] Check every subject description and challenge for accuracy.
- [ ] Confirm exact inclusions, taxes, renewals and cancellation terms for each plan.
- [ ] Clarify the support allowance and workshop schedule for Premium.
- [ ] Decide certificate assessment rules and any certificate fees.
- [ ] Add real learner/project imagery with appropriate permissions.
- [ ] Add Privacy Policy, Terms, Refund/Cancellation and FAQ pages.

## Before accepting payments
- [ ] Implement secure authentication and account profiles.
- [ ] Implement server-side plan entitlements and subscription status.
- [ ] Enforce one free class per user across all seven subjects.
- [ ] Integrate and test a payment provider and webhook handling.
- [ ] Add invoices/receipts and subscription cancellation/renewal flows.
- [ ] Add admin tools for classes, challenges, members and certificates.
- [ ] Test mobile, keyboard navigation, accessibility and performance.

## Suggested build sequence
1. Finalise homepage and subject content.
2. Build the first real class experience in Architecture.
3. Pilot with a small group and collect feedback.
4. Add accounts, progress and portfolio.
5. Add payment/subscription infrastructure.
6. Add other subject experiences based on validated demand.


## V5.5 student accounts / saved designs / certificates
- [ ] Create a Supabase project and run `supabase/schema.sql` in its SQL Editor.
- [ ] Configure Supabase Auth Site URL and redirect URLs for production and localhost.
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel Production and Preview environments.
- [ ] Add the same values to local `.env.local` (never commit this file).
- [ ] Redeploy and test email sign-up, email confirmation, sign-in and sign-out.
- [ ] Save a design, refresh the challenge, and verify it restores.
- [ ] Open the dashboard and verify the saved design is listed.
- [ ] Evaluate a challenge, complete it, open its certificate and use Print → Save as PDF.
- [ ] Verify a second student account cannot view the first student's saved designs or completion records.


## V5.6 Professional Studio
- [ ] Deploy the V5.6 project code to Vercel.
- [ ] Run `supabase/professional_studio.sql` in Supabase SQL Editor.
- [ ] Sign in with an existing DESIQ account and open `/architecture/professional`.
- [ ] Create a test project, add catalogue items, edit quantity/rate and save.
- [ ] Refresh the page and verify the project reopens with its line items.
- [ ] Export a CSV estimate and verify the amounts.
- [ ] Test with a second account to confirm project records remain private.


## V5.7 white-label client quotations
- [ ] Run the updated `supabase/professional_studio.sql` migration (safe to rerun; adds company_profile if missing).
- [ ] Deploy the updated source through GitHub → Vercel.
- [ ] Open a professional project and enter company name, contact, email, phone, address and optional GSTIN/logo URL.
- [ ] Save the project, reload it, and confirm company details persist.
- [ ] Add at least one line item and a client name.
- [ ] Generate a client quotation and use Print → Save as PDF.
- [ ] Verify the quotation uses the professional's company identity and does not display DESIQ branding.


## V5.8 drawing & quantity estimator
- [ ] Run the updated `supabase/professional_studio.sql` migration in Supabase (adds `rooms`; safe to rerun).
- [ ] Deploy the V5.8 files through GitHub Desktop and Vercel.
- [ ] Open Professional Studio and upload a test PDF or image floor plan.
- [ ] Add two rooms with known dimensions and verify floor area totals.
- [ ] Enter wall height and opening deductions; verify estimated wall area.
- [ ] Add floor, ceiling and wall finish quantities to the estimate and enter rates.
- [ ] Save, refresh and reopen the project; verify room measurements and line items persist.
- [ ] Confirm the drawing preview requires re-upload after reopening (it is not stored remotely in this release).


## V6.0 drawing measurement upgrade

- [ ] Run the complete updated `supabase/professional_studio.sql` in Supabase SQL Editor. The V6.0 `ALTER TABLE` statements add `drawing_annotations` and `drawing_calibration` without deleting existing project data.
- [ ] Replace repository files with the V6.0 ZIP contents and push to GitHub. `package.json` now includes `pdfjs-dist`; Vercel must install the updated dependency.
- [ ] Test a PNG/JPG drawing: calibrate using a known dimension, measure a line, trace a room polygon, add a measurement to the estimate, save, refresh and reopen.
- [ ] Test a PDF drawing: confirm the first page renders and can be calibrated/measured. Only page one is currently supported for on-plan measurement.
- [ ] Confirm existing Student Studio, Professional projects, drawing storage, company details and quotations still work.
\n\n## V6.1 deployment note\n\nNo Supabase SQL migration is required for V6.1. It reuses the existing drawing annotations and project line-item fields. Deploy the updated repository and test named measurements, catalogue linking and unit conversions.\n
## V6.2 deployment

1. Run the complete updated `supabase/professional_studio.sql` in Supabase SQL Editor. It adds `professional_profiles`; it does not delete existing project data.
2. Replace repository files with this ZIP's `desiq-repo` contents and push to GitHub.
3. Wait for Vercel deployment.
4. Sign in and open `/architecture/professional/dashboard`.
5. Select multiple specialisations, save, refresh, and confirm they remain selected.
6. Open the drawing & estimating studio and verify existing projects and quotations still work.
