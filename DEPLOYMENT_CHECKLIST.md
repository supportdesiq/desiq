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
