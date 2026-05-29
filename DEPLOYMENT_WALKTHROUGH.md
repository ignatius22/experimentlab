# Deployment Walkthrough: ExperimentLab

This guide provides a professional "checklist" for deploying ExperimentLab to production. The platform is designed to run on a serverless architecture for maximum scalability and minimum cost.

## 1. Prerequisites
Ensure you have accounts with the following providers (all have free tiers):
- **Vercel:** Hosting for the Next.js app and API.
- **Neon.tech:** Serverless PostgreSQL database.
- **Clerk:** Authentication and Multi-tenancy.

---

## 2. Database Provisioning
ExperimentLab uses Prisma as its ORM.
1. Create a new project in **Neon.tech**.
2. Create a database (e.g., `experimentlab_prod`).
3. Copy the **Connection String** (Pooled) for `DATABASE_URL` and the **Direct Connection** for `DIRECT_URL`.
4. From your local machine, run the following to initialize the schema:
   ```bash
   pnpm -C packages/db db:push
   ```

---

## 3. Authentication Setup
1. Create a new application in **Clerk**.
2. Enable the **Organizations** feature (essential for ExperimentLab's B2B model).
3. Copy your `Publishable Key` and `Secret Key`.

---

## 4. Vercel Deployment
1. Import your GitHub repository into Vercel.
2. **Project Settings:**
   - **Framework Preset:** Next.js
   - **Root Directory:** Keep as root `./` (Turbo will handle the sub-apps).
   - **Install Command:** `pnpm install`
   - **Build Command:** `pnpm build`
3. **Environment Variables:**
   Add the following keys to Vercel:
   ```env
   # Database
   DATABASE_URL=...
   DIRECT_URL=...

   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app
   ```

---

## 5. SDK & CORS (Important)
Since your SDK will be called from other domains, the platform is pre-configured with a CORS policy in `vercel.json`. 
- By default, it allows `*` (any domain).
- In a strictly production environment, you should update the `Access-Control-Allow-Origin` in `vercel.json` to only allow your clients' specific domains.

---

## 6. Post-Deployment Verification
Once the build is finished:
1. Visit `/login` and create an account.
2. Create an **Organization** in the dashboard.
3. Create your first **Feature Flag**.
4. Go to `/app/performance` and verify that the "Core Web Vitals" are being tracked for your own dashboard session.

## Summary of URL endpoints
- **Dashboard:** `https://your-app.vercel.app/app`
- **SDK Manifest API:** `https://your-app.vercel.app/api/v1/client/manifest`
- **SDK Events API:** `https://your-app.vercel.app/api/v1/client/events`
