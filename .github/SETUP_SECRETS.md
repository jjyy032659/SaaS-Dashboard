# GitHub Actions — Required Secrets Setup

Before the CI/CD workflows can run, add all 9 secrets to GitHub.

## How to add secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret below

---

## All 9 secrets

### Baked into the JS bundle at BUILD time
These are `NEXT_PUBLIC_*` variables — needed during `next build` so Next.js can
embed them into the client-side JavaScript. Must be real values, not placeholders.

| Secret Name | Where to find it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `NEXT_PUBLIC_APP_URL` | Your production domain, e.g. `https://myapp.com` |

### Read by the server at RUNTIME — but include for build safety
Next.js Server Components and middleware may reference these during `next build`.
Safe practice: always include them so the build never fails unexpectedly.

| Secret Name | Where to find it |
|---|---|
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `DATABASE_URL` | Neon Dashboard → Connection string |
| `POSTGRES_URL` | Same value as `DATABASE_URL` (`@vercel/postgres` uses this name) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_PREMIUM_PRICE_ID` | Stripe Dashboard → Products → your price ID |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks → your endpoint's signing secret |
| `GEMINI_API_KEY` | Google AI Studio → API Keys |

---

## Notes

- `GITHUB_TOKEN` is **automatic** — GitHub provides it for free, no setup needed
- `NEXT_PUBLIC_APP_URL` should be your **real production domain**, not `localhost`
- Server-side secrets (non-NEXT_PUBLIC) are also passed at **Docker runtime** via
  `docker run --env-file .env.production` — they don't get baked into the image

## Quick tip: why two DB variables?

`@vercel/postgres` (used by `sql` template tag) looks for `POSTGRES_URL`.
Drizzle ORM looks for `DATABASE_URL`.
Both point to the same Neon connection string — just two different names.
