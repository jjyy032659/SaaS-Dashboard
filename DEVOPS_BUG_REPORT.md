# NutriTrack — DevOps Bug Report & Resolution Log

**Project:** NutriTrack — AI-Powered Nutrition SaaS
**Stack:** Next.js 16, Docker, AWS EC2, AWS ECR, GitHub Actions, Terraform, Clerk, Neon PostgreSQL, Stripe, Google Gemini
**Purpose:** Learning DevOps through building and shipping a full-stack SaaS application end-to-end

---

## Bug 1 — CD Pipeline Not Deploying After Push

### Symptom
CI passed on every push to `main`, but the application on EC2 was never updated. The server kept running the old Docker image.

### Root Cause
The `.github/workflows/cd.yml` file had been modified locally to include the SSH deploy job, but the file was never staged in the `git add` command before committing. Only the CI workflow was being pushed to GitHub, so the deploy job never existed in the remote repository.

### Fix
Explicitly added `cd.yml` to the git staging area:
```bash
git add .github/workflows/cd.yml
git commit -m "Add deploy job to CD workflow"
git push
```

### Lesson
Always run `git status` before committing to verify all intended files are staged. A CI/CD pipeline that appears to pass but never deploys is often a sign that the pipeline definition itself was never pushed.

---

## Bug 2 — 502 Bad Gateway After First Deployment

### Symptom
After the CD pipeline ran successfully and confirmed the Docker image was pulled and restarted, visiting the EC2 Elastic IP returned:
```
502 Bad Gateway — nginx/1.18.0 (Ubuntu)
```

### Root Cause
The `.env` file at `/opt/app/.env` on the EC2 instance was empty. The Terraform `user-data.sh` bootstrap script creates the file as a placeholder but does not populate it with real values. Without environment variables, the Next.js application crashed immediately on startup, and Nginx received no response from port 3000, causing the 502.

### Fix
1. SCP the local `.env.server` file to the EC2 instance:
```bash
scp -i /c/Users/User/Downloads/my-saas-dashboard-key.pem \
  .env.server ubuntu@54.252.116.221:/tmp/envfile
```
2. Copy it into place and restart:
```bash
sudo cp /tmp/envfile /opt/app/.env
docker compose down && docker compose up -d
```

### Lesson
Infrastructure provisioning (Terraform) and application secrets management are separate concerns. Terraform should never store secrets, but there must be a defined process for injecting them into a new instance. The long-term fix was automating this in the CD pipeline (see Bug 6).

---

## Bug 3 — Windows Terminal Stripping Newlines in SSH Session

### Symptom
When attempting to write the `.env` file by pasting multi-line content into the SSH terminal, all variables merged onto a single line:
```
NODE_ENV=productionCLERK_SECRET_KEY=sk_test_...DATABASE_URL=...
```
`grep` for specific variables returned nothing, even though `cat` appeared to show content.

### Root Cause
Windows terminal emulators (Git Bash / Windows Terminal) collapse newlines when pasting multi-line text into an SSH session. The heredoc (`<< 'EOF'`) appeared to work visually but the content was written as one continuous string without line breaks. Docker reads `.env` files line by line, so all variables were unrecognised.

### Fix
Used `scp` to transfer the file from the local machine directly — bypassing the terminal paste entirely:
```bash
scp -i /path/to/key.pem .env.server ubuntu@EC2_IP:/tmp/envfile
sudo cp /tmp/envfile /opt/app/.env
```
This preserved all newlines exactly as written in the local file.

### Lesson
Never paste multi-line configuration into a Windows SSH terminal. Always transfer files with `scp` or use a tool like `ssh-keyscan`. Validate the file was written correctly with `wc -l` and `grep` for a known key before restarting services.

---

## Bug 4 — SSH Host Key Verification Failed After Instance Replacement

### Symptom
After running `terraform apply` to change the EC2 instance type from `t3.small` to `t3.micro`, SSH connections to the same Elastic IP failed with:
```
WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!
Host key verification failed.
```

### Root Cause
Terraform destroyed the old EC2 instance and created a new one. The new instance generated a new SSH host key, but the local `~/.ssh/known_hosts` file still held the fingerprint of the old instance. SSH correctly flagged this as a potential man-in-the-middle attack.

### Fix
Remove the stale host key and reconnect:
```bash
ssh-keygen -R 54.252.116.221
ssh -i /path/to/key.pem ubuntu@54.252.116.221
# Type "yes" to accept the new fingerprint
```

### Lesson
This is expected and correct security behaviour whenever a server is replaced. The Elastic IP stays the same but the underlying machine changes. Always clear the known_hosts entry after any infrastructure replacement. In automated pipelines, use `StrictHostKeyChecking=no` only in CI/CD contexts where it is acceptable, not on developer machines.

---

## Bug 5 — `POSTGRES_URL` Missing, Causing Database Connection Failure

### Symptom
After the new t3.micro instance was running, the app showed "Application error: a server-side exception has occurred". Docker logs showed:
```
VercelPostgresError - 'missing_connection_string':
You did not supply a 'connectionString' and no 'POSTGRES_URL' env var was found.
```

### Root Cause
The `.env` file on the new instance was the old version uploaded in a previous session, which predated the addition of `POSTGRES_URL`. The database client (Vercel Postgres SDK) requires `POSTGRES_URL` specifically — `DATABASE_URL` alone is not sufficient for that SDK.

### Fix
Added `POSTGRES_URL` alongside `DATABASE_URL` in the `.env` file (both pointing to the same Neon connection string) and restarted the container:
```
POSTGRES_URL=postgresql://neondb_owner:...@neon.tech/neondb?sslmode=require
```

### Lesson
When using third-party database SDKs, always check which exact environment variable name the SDK expects. Drizzle uses `DATABASE_URL`; the Vercel Postgres SDK looks for `POSTGRES_URL`. Both can coexist pointing to the same value.

---

## Bug 6 — .env Lost on Every New Instance (Systemic Fix)

### Symptom
Every time Terraform provisioned a new EC2 instance, the `.env` file had to be manually recreated via SCP. This was error-prone, time-consuming, and a deployment blocker.

### Root Cause
The CD pipeline only pulled and restarted the Docker image. It had no step to ensure the `.env` file contained valid values. New instances created by Terraform started with an empty placeholder file.

### Fix
Added a dedicated step to the CD pipeline (`cd.yml`) that writes the `.env` file from GitHub Secrets before every deploy:
```yaml
- name: Write .env file on EC2
  uses: appleboy/ssh-action@v1
  with:
    host: ${{ secrets.EC2_HOST }}
    username: ubuntu
    key: ${{ secrets.EC2_SSH_KEY }}
    script: |
      sudo tee /opt/app/.env > /dev/null << 'ENVEOF'
      NODE_ENV=production
      CLERK_SECRET_KEY=${{ secrets.CLERK_SECRET_KEY }}
      DATABASE_URL=${{ secrets.DATABASE_URL }}
      POSTGRES_URL=${{ secrets.DATABASE_URL }}
      GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}
      ...
      ENVEOF
```
All secrets are stored in GitHub → Settings → Secrets and never written as plaintext in any committed file.

### Lesson
Secrets management in a CI/CD pipeline should be centralised in one place (GitHub Secrets, AWS Secrets Manager, etc.) and injected automatically on every deploy. Manual steps in a deployment process will eventually be forgotten and cause outages.

---

## Bug 7 — Clerk Auth Infinite Redirect Loop

### Symptom
After signing in, the browser entered an infinite redirect loop between `/sign-in` and the dashboard, never landing on a page.

### Root Cause
The `middleware.ts` was configured to protect specific routes but had no `/sign-in` or `/sign-up` public exception. Clerk's middleware redirected unauthenticated users to `/sign-in`, which was itself protected, causing the loop. Additionally, the dedicated sign-in and sign-up pages (`app/sign-in/[[...sign-in]]/page.tsx`) did not exist.

### Fix
Rewrote the middleware to protect all routes by default with explicit public exceptions:
```ts
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});
```
Created the missing sign-in and sign-up pages using Clerk's embedded components.

### Lesson
Auth middleware must explicitly whitelist the auth pages themselves. Protecting everything-by-default is the right security posture, but it requires the public routes to be defined before applying it.

---

## Bug 8 — Dashboard Content Blank After Sign-In

### Symptom
After signing in successfully, the navigation bar updated to show the user avatar, but all page content (dashboard, meal log, food library) remained blank.

### Root Cause
The page content was rendered in React Server Components. Server Components only re-render on a full server round-trip — they do not reactively respond to client-side auth state changes. When the user signed in, Clerk's client-side state updated, but the Server Components still rendered as if the user was unauthenticated (returning null/empty for protected data).

### Fix
Created a `HeaderAuth` client component that uses Clerk's `useAuth()` hook and calls `router.refresh()` whenever `isSignedIn` transitions from `false` to `true`:
```tsx
'use client';
export default function HeaderAuth() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const prevSignedIn = useRef(isSignedIn);

  useEffect(() => {
    if (isSignedIn && !prevSignedIn.current) {
      router.refresh(); // Forces all Server Components to re-render
    }
    prevSignedIn.current = isSignedIn;
  }, [isSignedIn, router]);
  // ...
}
```
`router.refresh()` triggers Next.js to re-fetch all Server Components on the current page with the new auth context.

### Lesson
In Next.js App Router, Server Components and Client Components have separate rendering lifecycles. Client-side state changes (like auth) do not automatically propagate to Server Components. `router.refresh()` is the correct mechanism to bridge this gap.

---

## Bug 9 — `calculateStreak` Returning 0 When Last Log Was Yesterday

### Symptom
A unit test for the streak calculation function failed. When a user's most recent log entry was yesterday (not today), the function returned `currentStreak: 0` instead of the correct streak count.

### Root Cause
The original implementation started the streak counter from today and broke immediately if today had no entry — without checking whether yesterday was a valid streak start point. A user who logs every day but hasn't logged yet today would incorrectly show a broken streak.

### Fix
Added logic to detect whether the streak should start from yesterday:
```ts
const startFromYesterday =
  !sortedDates.includes(todayStr) && sortedDates.includes(yesterdayStr);

const checkDate = startFromYesterday
  ? new Date(today.getTime() - 24 * 60 * 60 * 1000)
  : new Date(today);
```
This bug was discovered through unit testing — the test was written first, it failed, which revealed the bug in the implementation.

### Lesson
Pure business logic functions should always have unit tests. This bug existed silently in production — users who logged yesterday but not yet today saw their streak reset to 0 every morning. Writing tests for edge cases (today vs. yesterday as streak start) catches these subtle off-by-one errors before they reach users.

---

## Summary Table

| # | Bug | Category | Discovery Method |
|---|-----|----------|-----------------|
| 1 | CD pipeline never deploying | CI/CD | Manual observation |
| 2 | 502 Bad Gateway — empty .env | Deployment | Browser + docker logs |
| 3 | Windows terminal stripping newlines | Environment | `grep` returning empty |
| 4 | SSH host key changed after instance replacement | Infrastructure | SSH error message |
| 5 | POSTGRES_URL missing from .env | Configuration | Docker logs |
| 6 | .env lost on every new instance | Process/Automation | Recurring manual work |
| 7 | Clerk infinite redirect loop | Authentication | Browser network tab |
| 8 | Dashboard blank after sign-in | Frontend/Auth | Visual observation |
| 9 | calculateStreak returns 0 for yesterday | Business Logic | Unit test failure |
