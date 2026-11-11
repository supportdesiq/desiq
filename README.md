# DESIQ — Design + IQ

A GitHub- and Vercel-ready starter website for DESIQ, a practical-learning ecosystem with seven subject worlds.

## What's included

- Responsive DESIQ homepage with brand story, seven learning worlds, benefits, learning cycle, weekly challenges, certificate messaging, pricing, parent/school information and contact links.
- Seven subject landing pages generated from one reusable template:
  - `/subjects/architecture`
  - `/subjects/it`
  - `/subjects/hardware`
  - `/subjects/code-ai`
  - `/subjects/sustainability`
  - `/subjects/languages`
  - `/subjects/art`
- Shared header/footer, metadata, 404 page and mobile styling.
- Pricing displayed from the current decisions:
  - Starter: ₹0; one free class across DESIQ and free weekly challenges.
  - One subject: ₹199/month/subject.
  - All Access: ₹499/month.
  - Premium: ₹999/year with all seven subjects, premium challenges, additional learning support, priority feature access, live workshops, exclusive competitions and certificate discounts.

## Run locally

1. Install Node.js 20.9 or newer.
2. Extract this folder and open a terminal inside it.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open http://localhost:3000.

## Publish to GitHub

1. Create a new empty repository on GitHub, for example `desiq-website`.
2. Extract this ZIP file.
3. In a terminal inside the extracted `desiq-repo` folder, run:

```bash
git init
git add .
git commit -m "Initial DESIQ website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/desiq-website.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username and use your actual repository URL.

## Deploy on Vercel

1. Sign in to Vercel with GitHub.
2. Choose **Add New → Project**.
3. Import your `desiq-website` repository.
4. Keep the detected Next.js settings and click **Deploy**.
5. Future pushes to the connected GitHub branch will trigger deployments.

## Important before taking payments or enrolling learners

This is a front-end starter, not a complete learning-management or payment system. It does not yet include authentication, a database, class/video hosting, a real challenge engine, automated scoring, certificate issuance, subscriptions, payment processing, member entitlements, support-ticketing or an admin dashboard. Contact and plan buttons currently open email drafts so visitors have a working enquiry path without pretending a checkout exists.

Before launch, connect a backend/database and authentication provider; integrate a payment gateway; implement server-side one-free-class entitlement across the whole account; define support allowances and workshop inclusions; publish terms, privacy, refund and cancellation policies; and have certificate criteria reviewed. Do not rely on browser-only state for paid access or entitlements.

## Edit the content

- Homepage sections: `app/page.tsx`
- Subject names, descriptions, learning outcomes and challenge ideas: `lib/subjects.ts`
- Subject page template: `app/subjects/[slug]/page.tsx`
- Visual styling: `app/globals.css`
- Header/footer: `components/Header.tsx` and `components/Footer.tsx`

The challenge ideas and planned tools are illustrative placeholders to refine before launch. The email address `hello@desiq.com` is a placeholder; replace it with an inbox you control.
