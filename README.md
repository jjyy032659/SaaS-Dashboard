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
