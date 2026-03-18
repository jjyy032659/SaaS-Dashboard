# NutriTrack — AI-Powered Nutrition SaaS

A full-stack SaaS application for tracking daily nutrition, logging meals with AI image recognition, and receiving personalized AI coaching. Built with Next.js 16, deployed on AWS with a full CI/CD pipeline.

**Live Demo:** http://54.252.116.221

---

## Features

- **Meal Logging** — Log meals manually or snap a photo for instant AI macro extraction
- **Daily Dashboard** — Real-time calorie budget, macro gauges, and AI daily coaching tips
- **30-Day Analytics** — Trend charts, streak tracking, weekly summaries, and adherence reports
- **AI Nutrition Insights** — Gemini-powered comprehensive monthly analysis report
- **Food Library** — Build a personal database of custom foods for quick logging
- **Goal Advisor** — AI calculates personalized calorie and macro targets using BMR/TDEE
- **Subscription Tiers** — Free plan + Premium ($9.99/month) via Stripe
- **Authentication** — Clerk-powered sign-in/sign-up with session management

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Clerk |
| Database | PostgreSQL (Neon serverless) |
| ORM | Drizzle ORM |
| AI | Google Gemini 2.0 Flash |
| Payments | Stripe |
| Charts | Recharts |
| Validation | Zod |
| Containerization | Docker |
| Container Registry | AWS ECR |
| Hosting | AWS EC2 |
| CI/CD | GitHub Actions |
| Infrastructure | Terraform |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions CI/CD                  │
│   lint → type-check → tests → build → push ECR → deploy │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │   AWS ECR       │  ← Docker image registry
              └────────┬────────┘
                       │ docker pull
                       ▼
              ┌─────────────────┐
              │   AWS EC2       │
              │  ┌───────────┐  │
              │  │  Nginx    │  │  ← Reverse proxy (port 80)
              │  └─────┬─────┘  │
              │  ┌─────▼─────┐  │
              │  │ Next.js   │  │  ← App container (port 3000)
              │  └───────────┘  │
              └─────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌─────────┐  ┌──────────┐  ┌─────────┐
   │  Neon   │  │  Clerk   │  │ Stripe  │
   │Postgres │  │  Auth    │  │Payments │
   └─────────┘  └──────────┘  └─────────┘
                      │
                      ▼
               ┌─────────────┐
               │Google Gemini│
               │  AI Vision  │
               └─────────────┘
```

---

## CI/CD Pipeline

Every push to `main` triggers:

```
Push to main
    ↓
CI (parallel jobs):
  ├── ESLint
  ├── TypeScript type check
  └── Unit tests (Vitest)
    ↓ (all pass)
  Next.js build
    ↓
CD:
  ├── Build Docker image
  ├── Push to AWS ECR
  └── SSH into EC2 → pull new image → restart container
```

---

## Local Development

### Prerequisites

- Node.js 20+
- A [Clerk](https://clerk.com) account
- A [Neon](https://neon.tech) PostgreSQL database
- A [Stripe](https://stripe.com) account
- A [Google AI Studio](https://aistudio.google.com) API key

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/my-saas-dashboard.git
cd my-saas-dashboard

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your values (see below)

# 4. Push database schema
npx drizzle-kit push

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Gemini AI
GEMINI_API_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run in watch mode during development
npm run test:watch
```

Tests cover:
- `lib/analytics.ts` — `detectMissingDays`, `calculateWeeklySummary`, `calculateStreak`, `calculateMacroRatios`
- `lib/validations.ts` — `GoalSchema`, `MealLogSchema`, `MacroSuggestionSchema`, `HistoricalMealLogSchema`, `GoalAdvisorSchema`

---

## Database Schema

```
usersProfile  — goals, biometrics, Stripe subscription fields
foodLog       — daily meal entries with macro breakdown
foods         — user's custom food library
documents     — files uploaded for AI analysis
```

---

## Subscription Plans

| Feature | Free | Premium ($9.99/mo) |
|---------|------|--------------------|
| Meal logging | ✓ | ✓ |
| Daily macro tracking | ✓ | ✓ |
| 30-day analytics | ✓ | ✓ |
| Food library | ✓ | ✓ |
| AI image analysis | 5/month | Unlimited |
| AI Nutrition Insights | ✗ | ✓ |
| AI Goal Advisor | ✗ | ✓ |

---

## Project Structure

```
├── app/
│   ├── page.tsx              # Dashboard
│   ├── log-meal/             # Meal logging + AI photo analysis
│   ├── analytics/            # 30-day trend analytics
│   ├── ai-insights/          # AI coaching reports
│   ├── food-library/         # Custom food database
│   ├── settings/             # Goals & profile setup
│   ├── pricing/              # Subscription plans
│   └── api/webhooks/stripe/  # Stripe webhook handler
├── lib/
│   ├── actions.tsx           # All server actions
│   ├── analytics.ts          # Data aggregation functions
│   ├── stripe.ts             # Stripe integration
│   ├── validations.ts        # Zod schemas
│   └── db/                   # Drizzle ORM + schema
├── __tests__/                # Vitest unit tests
├── terraform/                # AWS infrastructure as code
└── .github/workflows/        # CI/CD pipelines (ci.yml, cd.yml)
```

---

## Infrastructure (Terraform)

AWS infrastructure is fully defined as code in `terraform/`:

- **EC2** (t3.small) running Docker + Nginx
- **ECR** private Docker image registry with lifecycle policies
- **IAM role** with least-privilege ECR pull permissions
- **Elastic IP** for a static public address
- **Security groups** restricting inbound traffic

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

---

## Interview Notes — How I Built This

### Overview
NutriTrack is a production-grade, full-stack SaaS application I built from scratch to demonstrate end-to-end software engineering skills — from product design and database modelling, all the way through to cloud infrastructure, containerisation, and automated deployment pipelines. The application allows users to track their daily nutrition, log meals using AI-powered photo recognition, view 30-day analytics, and subscribe to a premium tier that unlocks unlimited AI coaching features.

---

### Frontend — Next.js App Router & React Server Components
I chose **Next.js 16 with the App Router** because it blurs the line between server and client rendering in a way that is ideal for a data-heavy dashboard. The majority of the application's pages — the dashboard, analytics, food library, and settings — are **React Server Components**. This means the database queries run on the server at request time, the HTML is streamed to the browser fully populated with real data, and the client receives no unnecessary JavaScript bundle for those pages. This approach significantly improves initial load performance and removes the need for a separate API layer for most data-fetching use cases.

For interactive parts of the UI — such as the meal logging form, the AI image upload client, and the auth header buttons — I used **Client Components** with the `'use client'` directive. One important architectural challenge I solved was the auth state not updating reactively after sign-in. Because the layout's auth buttons were in a Server Component, they only reflected the auth state at the time of the last full page render. I solved this by extracting the buttons into a dedicated `HeaderAuth` client component that uses Clerk's `useAuth()` hook, and calling `router.refresh()` whenever `isSignedIn` transitions from `false` to `true`. This triggers Next.js to re-fetch all Server Components on the current page, so the dashboard content appears immediately after sign-in without requiring a manual browser refresh.

---

### Authentication — Clerk
I integrated **Clerk** for authentication rather than building it myself, because production-grade auth (secure session management, OAuth providers, CSRF protection, MFA) is genuinely difficult to get right. Clerk handles all of that out of the box. I configured the middleware using `clerkMiddleware` with a `createRouteMatcher` to protect all routes by default, with explicit public exceptions for `/sign-in`, `/sign-up`, and `/pricing`. I also created dedicated sign-in and sign-up pages using Clerk's embedded `<SignIn />` and `<SignUp />` components, which are fully customisable and handle the redirect flow back to the app after authentication.

---

### Database — PostgreSQL, Neon & Drizzle ORM
For the database I used **Neon**, a serverless PostgreSQL provider, which gives a fully managed Postgres instance with connection pooling and scales to zero when not in use — ideal for a project at this stage. I used **Drizzle ORM** for all database interactions. Drizzle is a TypeScript-first ORM that generates fully type-safe query builders from the schema definition. This means if I rename a column in the schema, TypeScript immediately surfaces every query that references the old column name — catching breaking changes at compile time rather than at runtime in production. The schema defines four tables: `usersProfile` (storing Clerk's `userId` as the primary key alongside biometrics, calorie goals, macro targets, and all Stripe subscription fields), `foodLog` (individual meal entries with timestamps and full macro breakdown), `foods` (the user's personal food library for quick re-logging), and `documents` (uploaded files for AI analysis).

---

### AI Integration — Google Gemini 2.0 Flash
The AI features are powered by **Google Gemini 2.0 Flash**, which I selected for its multimodal capabilities — it can process both text and images within the same model. I implemented four distinct AI features, all as Next.js Server Actions: (1) **Meal photo analysis**, where a user uploads an image of their food and Gemini extracts a structured JSON response containing the meal description, estimated calories, and macro breakdown — validated client-side against a Zod schema before being pre-filled into the logging form; (2) **Daily AI coaching**, which runs on every dashboard load, takes the user's goals alongside their day's logged totals, and returns a personalised markdown coaching report; (3) **30-day Nutrition Insights**, a comprehensive AI analysis of the user's full month of data that identifies trends, streaks, macro adherence percentages, and specific recommendations; and (4) the **Goal Advisor**, which calculates the user's Basal Metabolic Rate using the Mifflin-St Jeor equation, adjusts for activity level to get TDEE, and then feeds that into Gemini to generate personalised calorie and macro targets based on the user's stated goal (lose, maintain, or gain weight).

---

### Payments — Stripe
I integrated **Stripe** for subscription management with two tiers: a Free plan and a Premium plan at $9.99/month. The integration covers the full subscription lifecycle. When a user clicks "Upgrade", a Server Action calls `stripe.checkout.sessions.create()` and redirects them to Stripe's hosted checkout page. After payment, Stripe fires a webhook to `/api/webhooks/stripe` which updates the user's subscription status, Stripe customer ID, price ID, and `currentPeriodEnd` in the database. The subscription status check (`getUserSubscriptionStatus`) compares the stored `stripeCurrentPeriodEnd` timestamp against `Date.now()` to determine if the subscription is genuinely active — this prevents expired subscriptions from granting access. I also implemented a billing portal session so premium users can manage or cancel their subscription directly from the settings page.

---

### Containerisation — Docker & AWS ECR
The application is containerised using a **multi-stage Dockerfile** with a build stage and a minimal production runtime stage. The build stage installs all dependencies and runs `next build`, which outputs a standalone Next.js bundle. The production stage copies only the standalone output and static assets — keeping the final image lean. I chose **AWS ECR** (Elastic Container Registry) as the private image registry over Docker Hub because ECR integrates natively with IAM authentication, has no pull rate limits, and same-region pulls from EC2 are faster and free. I configured ECR lifecycle policies to automatically delete untagged images after one day and retain only the last 10 tagged versions, preventing unbounded storage costs.

---

### Cloud Infrastructure — AWS EC2 & Terraform
The application runs on an **AWS EC2 t3.small instance** (2 vCPU, 2GB RAM) provisioned entirely through **Terraform**, so the infrastructure is version-controlled and reproducible. The Terraform configuration provisions the EC2 instance with an attached IAM instance profile that grants it ECR pull permissions without storing any AWS credentials on the server — the instance uses its role's temporary credentials which rotate automatically. The instance is bootstrapped via a `user-data.sh` script that installs Docker, sets up Nginx as a reverse proxy on port 80 forwarding to the Next.js container on port 3000, creates a `deploy.sh` script for pulling and restarting the container, and configures a cron job to refresh the ECR authentication token every 6 hours (tokens expire after 12 hours). An **Elastic IP** is attached to the instance to provide a static public IP address that persists across instance stops and starts.

---

### CI/CD Pipeline — GitHub Actions
Every push to the `main` branch triggers a two-workflow pipeline. The **CI workflow** runs three jobs in parallel — ESLint for code style, TypeScript's `tsc --noEmit` for type checking, and Vitest for unit tests — and only proceeds to the build job if all three pass. The **CD workflow** runs after CI succeeds: it builds the Docker image using `docker/build-push-action` with GitHub Actions layer caching (reducing build time from ~4 minutes to ~45 seconds for small changes), pushes the image to ECR tagged with both `:latest` and a commit SHA tag (e.g. `:sha-a1b2c3d`), and then uses `appleboy/ssh-action` to SSH into the EC2 instance and execute `deploy.sh` with the new SHA tag — pulling the exact image just built and restarting the container via Docker Compose. Using the immutable SHA tag means every deployed version is traceable back to its exact commit, and rolling back is as simple as running `./deploy.sh sha-<previous-commit>`.

---

### Testing — Vitest
I wrote **47 unit tests** across two test files using **Vitest**, targeting the pure business logic functions that are most critical and easiest to test in isolation. The analytics tests cover all four data aggregation functions: `detectMissingDays` (verifying it correctly identifies gaps in a 30-day log window), `calculateWeeklySummary` (verifying correct averaging and filtering of data outside the 7-day window), `calculateStreak` (testing consecutive day counting from both today and yesterday as valid starting points — writing these tests actually uncovered a real bug where the function would incorrectly return a streak of 0 when the most recent entry was yesterday rather than today), and `calculateMacroRatios` (verifying the correct caloric weight application of 4kcal/g for protein and carbs versus 9kcal/g for fat). The validation tests cover all five Zod schemas, testing both valid inputs and edge cases like boundary values, invalid enums, and date range constraints on historical meal entries.

---

### Key Engineering Decisions & Trade-offs
- **Server Actions over API routes** — For most mutations (logging meals, updating goals, deleting foods), I used Next.js Server Actions rather than building REST API endpoints. This collocates the mutation logic with the UI that triggers it, eliminates client-side fetch boilerplate, and automatically handles CSRF protection. The trade-off is that Server Actions are tightly coupled to Next.js, but for a single-platform app this is acceptable.
- **Drizzle over Prisma** — I chose Drizzle because it compiles queries to raw SQL at build time with zero runtime overhead, whereas Prisma uses a query engine binary that adds latency and memory usage. For a serverless/edge environment Drizzle is significantly lighter.
- **ECR over GHCR** — Although GitHub Container Registry would have been simpler to set up with GitHub Actions, I chose ECR because the EC2 instance's IAM role can authenticate with ECR automatically via instance metadata — no secrets to store, rotate, or accidentally expose.
- **t3.small over serverless** — A persistent EC2 instance has a fixed monthly cost (~$15) but eliminates cold start latency entirely. For a demo SaaS with a real-time dashboard that runs AI on every page load, cold starts would be unacceptable.
