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
