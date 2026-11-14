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

The challenge ideas and planned tools are illustrative placeholders to refine before launch. The email address `supportdesiq@gmail.com` is a placeholder; replace it with an inbox you control.


## Architecture MVP

- `/architecture` redirects to the Architecture subject page.
- `/architecture/challenge` contains the interactive Dream House budget challenge.
- Learners can select rooms from the supplied sample price list, monitor a ₹10 lakh budget, self-check design considerations, and receive a transparent rubric-based learning score.
- Challenge progress is currently in browser state only. Accounts, cloud saving, certificates, and instructor assessment are not connected yet.


## Architecture Floor Plan Studio (MVP)

The Dream House challenge now includes:
- Adjustable plot length and width.
- Adjustable project budget and illustrative construction-rate assumptions.
- 2D floor-plan canvas with draggable room blocks.
- Room catalogue and room resizing/removal controls.
- Additional doors, windows, fixtures, furniture and sustainability items.
- A live estimate that recalculates from plot area, rate and selected catalogue extras.
- A conceptual isometric 3D-style preview (not a detailed CAD/BIM model).

Cost values are educational estimates only, not construction quotations. Room placement is a simple visual planning exercise; it does not yet validate wall connections, building codes, structural feasibility or exact quantities. The design is currently held in browser state and is not saved to an account or cloud.


## Architecture Studio — expanded MVP

The Architecture challenge now supports:
- Non-overlapping room placement within a plot, with drag-to-reposition and resize controls.
- Fixtures and furniture placed as separate movable objects inside the floor plan; multiple copies can be added.
- Parametric catalogue pricing: kitchen counters and wardrobes by running metre, finishes by square metre, and individual fittings/furniture by item.
- Up to four floors. Each added floor adds another floor's built-up area to the construction estimate.
- Live budget estimate using plot area × illustrative construction rate × number of floors, plus selected catalogue items.
- Ten design-thinking checks covering daylight, ventilation, privacy, circulation, accessibility, safety, plumbing, storage, climate and future flexibility.
- Three-dimensional interactive preview using Three.js with orbit and zoom controls, room walls and placed furnishing volumes.

Important limitations: this is a learning prototype, not CAD/BIM software. The 3D preview is a generated conceptual model; it does not yet model accurate wall openings, structural systems, stairs, services, code compliance or construction-ready details. The price list and construction rates are illustrative and should be calibrated by region and specification before being presented as real quotations. Projects are not yet saved to user accounts.


## Architecture Studio V3

New features:
- Wall-mounted doors and windows can be attached to a selected external wall or a room's north/east/south/west wall. Select an opening in the plan to adjust its width and position.
- The 3D preview reflects wall openings, wall height, roof style (flat, pitched or open cutaway), material palette and stairs when multiple floors are planned.
- Recognisable coloured 3D furniture silhouettes: sofa with cushions/arms, beds with pillows/headboards, dining table and chairs, kitchen counters, wardrobes, bathroom fixtures and more.
- Expanded construction quantity estimator for indicative bricks, cement, reinforcement steel, sand, aggregate, tiles, paint and labour allowances.
- Seven Architecture design briefs: dream house, tiny home, climate-smart home, accessible multigenerational home, courtyard home, neighbourhood café and compact apartment renovation.
- Challenge hub at `/architecture/challenges`; each brief opens its own studio route.

Estimator note: quantities and prices are simplified educational assumptions. The current model does not calculate foundations, columns, beams, internal wall take-offs, lintels, MEP services, taxes or local site conditions. It is not a construction-ready bill of quantities. Door/window editing is supported on the outer perimeter and room perimeter walls; complex wall junctions, door swings, sliding tracks and code validation remain future work. The 3D scene is a conceptual model rather than a photorealistic or BIM-grade model. Projects are currently held in client state and are not persisted to accounts.


## Architecture Studio V4 — challenge-specific design environments

Each Architecture challenge now opens a tailored workspace rather than reusing one residential catalogue:
- Dream house: residential rooms, kitchen, bedrooms, bathrooms, living and family furniture.
- Tiny home: flexible living, sleeping nook, kitchenette, compact fold-away furniture and storage.
- Climate-smart home: residential spaces plus courtyard, garden, solar, rainwater, shade and ventilation components.
- Accessible multigenerational home: accessible bedroom and bathroom spaces, ramps, grab rails and shower seats.
- Courtyard home: courtyard and garden zones, trees, planters, benches and water features.
- Neighbourhood café: customer seating, service counter, prep kitchen, customer washroom, outdoor seating, café tables/chairs, stools, espresso machine, display case, commercial sink, menu board and pendant lighting.
- Apartment renovation: apartment spaces, kitchenette, furniture, storage, finishes and lighting.

The Architecture landing feature now invites visitors to choose a design brief rather than presenting the dream-house challenge as the only entry point. The challenge library has a neutral Architecture-wide headline, differentiated challenge cards and distinct visual treatments. The studio page and 2D plan use a challenge-specific colour atmosphere. Café estimating switches to a fit-out allowance for its selected equipment, furniture and finishes rather than presenting a house-materials list.


## Architecture & Spatial Design Studio V5

The challenge library has been broadened beyond residential architecture. The seven active briefs now cover:
1. Dream house — residential architecture.
2. Neighbourhood café — hospitality design.
3. Bridge for smoother traffic — transport infrastructure, bridge deck, vehicle lanes, pedestrian/cycle paths, supports, guardrails, signals, crossings and vehicle movement markers.
4. Community auditorium — public/cultural building planning, stage, audience seating, lobby, backstage, accessible seating and AV/acoustic elements.
5. Neighbourhood park — landscape architecture, lawns, paths, play, seating, shade and park amenities.
6. Reimagine a busy street — urban design, pedestrian priority, crossings, bus stop, cycle parking, vendor bays and street furniture.
7. Apartment renovation — interior design.

Outdoor challenges use an open-site 3D environment with site zones and movable site elements rather than perimeter room walls, wall openings, roof or floor-count controls. The challenge evaluation checklist changes to match the selected discipline. Site cost summaries use site development and selected site elements; café cost summaries use fit-out items. These are indicative educational estimates, not engineering calculations, code checks, structural validation or contractor quotations.


## V5 challenge range and interaction notes

The active challenge catalogue has been deliberately diversified: one residential home brief, one hospitality brief, one transport-infrastructure brief, one public-building brief, one landscape brief, one urban-street brief and one apartment-interior brief.

Outdoor bridge, park and street briefs use an open-site scene. Their 2D/3D workspace uses site zones, paths, road elements, street furniture and movable layout markers. The bridge brief includes vehicle markers, bridge supports, pedestrian/cycle routes, lane separators, signals and crossings. The auditorium brief has stage, lobby, backstage and audience seating elements. Evaluation criteria are specific to each challenge.

All cost rates and visual models are educational planning approximations. The bridge activity is a conceptual site-layout exercise, not structural engineering design, traffic simulation, code compliance checking or safety certification. The public-space activities are conceptual layouts, not construction documents.


## Support contact

Use **supportdesiq@gmail.com** for support and general enquiries. The published support availability is 24/7, with a response target of within 30 minutes.


## V5.4 — interactive architecture challenge library

The seven existing architecture briefs now have individual CSS-built scene illustrations, distinct colour identities, visible difficulty/time/budget information, category filters, and an interactive brief preview dialog. Preview dialogs explain the challenge mission, design goals and available studio toolkit before the learner opens the existing challenge workspace.

The listed budget is the challenge allowance/brief budget. The in-studio estimate is a separate educational estimate that changes as learners add and adjust design elements. Cost and quantities are planning approximations, not contractor quotations or engineering specifications.


## V5.5 — Student accounts, saved work and certificates

### Student features
- Email/password sign-up and sign-in at `/account`.
- Student dashboard at `/dashboard` with saved projects and completed challenges.
- Save/restore a challenge design to the signed-in student's account.
- Record a challenge completion and issue a printable certificate at `/certificate/<completion-id>`.
- Certificate page supports browser Print → Save as PDF.

### Required Supabase setup (cloud persistence/authentication)
1. Create a Supabase project.
2. Open the Supabase SQL Editor and run `supabase/schema.sql`.
3. In Supabase Authentication → URL Configuration, set the Site URL to your deployed DESIQ domain and add the local development URL (`http://localhost:3000`) to Redirect URLs.
4. Copy the Project URL and publishable/anon key from Supabase Project Settings → API.
5. Add these environment variables in Vercel → Project → Settings → Environment Variables, for Production and Preview:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Add the same values to a local `.env.local` file for local development, then redeploy.

The application intentionally does not include a Supabase service-role key in the browser. Row Level Security policies restrict each student to their own designs and completion records. Supabase email confirmation settings determine whether a new student must confirm their email before signing in.

### Important learning-record note
The current completion button records the in-studio self-evaluation score. It is a participation/completion certificate, not a professional qualification or externally moderated assessment. A future teacher-review workflow can be added before presenting certificates as independently assessed credentials.


## V5.6 — Professional Studio (first release)

Added a Professional Studio entry inside the Architecture subject at `/subjects/architecture`, with a dedicated workspace at `/architecture/professional`.

The first release includes:
- A separate professional workspace using the existing DESIQ sign-in.
- Private project records stored in Supabase `professional_projects`, protected by Row Level Security.
- Project name, client, location and notes.
- A starter catalogue of interior fit-out products/services, plus editable custom line items.
- Editable quantities, units and rates with automatic line totals and a live project estimate.
- Saved project list, reopen/edit and delete.
- CSV export of the estimate for use in a spreadsheet or client proposal.

### Apply the V5.6 database update

Before testing project saving, open Supabase → SQL Editor and run `supabase/professional_studio.sql` from this release. This creates the private professional-project table and its Row Level Security policies. No new environment variables are required. The same SQL is also appended to `supabase/schema.sql` for a fresh setup.

### V5.6 scope and next steps

Drawing upload, plan calibration/measurement, catalogue image management, supplier management, tax/discount controls, branded PDF quotations, client sharing and multi-user team access are not included in this first release. The workspace currently accepts project details and line-item pricing; the drawing-led workflow is the next development phase. All estimates are indicative and require professional verification.


## V5.7 — White-label client quotations

Professional Studio now supports a company identity and client-facing quotation:
- Company/business name, contact person, email, phone and address.
- Optional GSTIN and logo image URL.
- Configurable tax percentage and quotation terms.
- Company identity is saved with each professional project in `professional_projects.company_profile`.
- Client quotation opens a print-ready document without DESIQ branding. Use the browser print dialog to save it as PDF.
- Internal CSV estimate export remains available.

### Supabase migration
Run the updated `supabase/professional_studio.sql` in the Supabase SQL Editor. It includes an idempotent `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` migration for `company_profile`. Existing professional projects are retained.

### Quotation notes
The tax percentage is user-entered and is applied as a simple estimate line. Professionals must confirm the correct tax treatment, rates, GST compliance, quotation terms and commercial details before sending a quotation. Logo is currently supplied as an image URL; direct logo upload and reusable organisation-wide branding settings are planned enhancements.


## V5.8 — Drawing reference & room quantity estimator

Professional Studio adds a drawing-led measurement workflow:
- Upload and preview PDF, PNG, JPG or WebP floor plans up to 15 MB. The preview is held in the current browser session and is not uploaded to Supabase; re-upload it when reopening a saved project.
- Add rooms and enter verified length, width, wall height and total door/window opening area in metres.
- Automatically calculate total floor/ceiling area and estimated wall finish area.
- Apply a configurable wastage percentage and add floor, ceiling or wall quantities directly to project line items.
- Save room measurements with the project in `professional_projects.rooms`; existing projects remain intact.

### Apply the V5.8 database update
Run the updated `supabase/professional_studio.sql` in Supabase SQL Editor. It safely adds the `rooms` JSONB column if it does not exist. No environment variables or new Supabase storage bucket are required.

### Measurement limitation
V5.8 does not yet read dimensions or recognise walls automatically from a PDF/image. Users must enter dimensions verified from a drawing scale or site measurement. Wall area is perimeter × wall height minus the room's entered total openings area; it does not account for wall segmentation, columns, complex geometry or finish-specific deductions. Quantities are indicative and must be professionally checked.


## V5.9 — Persistent floor-plan attachments

The drawing upload now persists in a private Supabase Storage bucket and is linked to its professional project:
- PDF, PNG, JPG and WebP floor plans (up to 15 MB) upload to the private `professional-drawings` bucket.
- Storage paths are scoped to the signed-in user's UUID; Storage RLS policies prevent users from reading or changing another user's files.
- The project record stores the file path, original name and type. Reopening a project creates a temporary signed URL and restores the drawing preview.
- Existing V5.8 room measurements and all project/quotation data are retained.

### Apply the V5.9 database and Storage migration
Run the complete updated `supabase/professional_studio.sql` in Supabase → SQL Editor. This adds the drawing metadata columns, creates/configures the private bucket and installs user-scoped Storage policies. It is safe to rerun. No new environment variables are required.

**Important:** drawings uploaded before V5.9 were only browser previews and were never stored in Supabase. Those files cannot be recovered from the project record; upload each required drawing again after deploying V5.9, then save the project. New uploads will persist and reload with the project.


## V6.0 — Drawing measurement tools

Professional Studio now supports manual scale calibration and on-plan measurement for uploaded image plans (PNG/JPG/WebP) and PDF drawings. PDF preview and measurement render the first page. Calibrate by selecting two points with a known real-world distance; then use Measure line for distances or Measure room area to trace a polygon. Measurements and calibration are stored in `professional_projects.drawing_annotations` and `drawing_calibration`. Run the updated `supabase/professional_studio.sql` migration before deploying. PDF rendering uses `pdfjs-dist` and its matching worker hosted by cdnjs. This is manual tracing, not automatic CAD/BIM recognition; check all measurements against source drawings and site conditions.
\n\n## V6.1 — Named measurements and catalogue linking\n\n- Give each on-plan measurement a room or measurement name before tracing.\n- Link area measurements to compatible area catalogue products and line measurements to running-length products.\n- Area quantities convert from m² to sq ft when the selected catalogue item uses sq ft; line quantities convert from metres to running feet when needed.\n- Existing JSON project fields are reused; no new Supabase migration is required.\n- Review product suitability, converted quantities, supplier rates and site conditions before issuing quotations.\n
## V6.2 — Unified Professional Studio

- New dashboard at `/architecture/professional/dashboard`.
- Professionals can select multiple specialisations in one account.
- Dashboard shows recent projects from the existing `professional_projects` table.
- Existing drawing, measurement, catalogue, estimate and quotation workflow remains at `/architecture/professional`.
- Run the updated `supabase/professional_studio.sql` once to create the RLS-protected `professional_profiles` table.


## V6.2.1 build fix

Fixes the missing ArrowRight import and skips the Vercel ESLint build phase that was failing to resolve eslint-config-next/core-web-vitals. Next.js compilation and type checks remain active.

## V6.3 — AI Drawing Intelligence (experimental foundation)

- New workspace: `/architecture/professional/ai-drawing`.
- Supported uploads: PDF (first page), JPG, PNG and ASCII DXF.
- DXF extraction reads LINE and LWPOLYLINE entities and calculates polyline lengths / closed-polyline areas in drawing units.
- PDF and raster image processing provides basic long horizontal/vertical line cues and an ink-density indicator. These are not semantic room detections.
- Results are editable and exportable as CSV for professional review.
- This release does not add AI model inference or automatic room/door/window/stair/ramp recognition. Do not use unverified outputs for quotations.
- No Supabase migration is required. Existing Professional Studio and V6.2 profile schema are unchanged.


## V6.3.1 — PDF.js TypeScript build fix

Removed the unsupported `canvas` property from the PDF.js render parameters. PDF rendering continues to use the canvas context and viewport. No Supabase migration is required.


## V6.3.2 — Homepage spacing and ticker loop

- Reduced desktop homepage hero top padding to remove the large blank gap below the navigation.
- Repeated the ticker content four times and animated one-quarter of the track for a seamless continuous loop.
- Removed hover-to-pause behavior; reduced-motion accessibility preference remains respected.
- No database migration required.
