# Deployment & Hosting Guide: ExperimentLab

This document outlines the strategy for hosting and scaling your ExperimentLab SaaS platform.

## Infrastructure Strategy

### 1. Application Layer (Next.js)
**Provider:** [Vercel](https://vercel.com)
*   **Role:** Hosts the dashboard, the marketing site, and the API endpoints.
*   **Configuration:** Vercel automatically detects the Turbo monorepo.
*   **Scaling:** Serverless functions scale automatically with incoming SDK traffic.

### 2. Database Layer (PostgreSQL)
**Provider:** [Neon](https://neon.tech) or [Supabase](https://supabase.com)
*   **Role:** Persistent storage for experiments, flags, and analytics events.
*   **Connectivity:** Uses Prisma ORM with connection pooling enabled for serverless compatibility.

### 3. Authentication Layer
**Provider:** [Clerk](https://clerk.com)
*   **Role:** B2B multi-tenancy, user management, and organization switching.

---

## Step-by-Step Launch Guide

### 1. Database Setup
1. Create a project on **Neon.tech**.
2. Copy the `DATABASE_URL` (ensure it uses the `?sslmode=require` parameter).

### 2. Vercel Configuration
1. Import your GitHub repository into Vercel.
2. Set the **Root Directory** to `apps/web`.
3. Add the following **Environment Variables**:
   *   `DATABASE_URL`: Your production Postgres string.
   *   `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: From Clerk dashboard.
   *   `CLERK_SECRET_KEY`: From Clerk dashboard.
   *   `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: `/login`
   *   `NEXT_PUBLIC_CLERK_SIGN_UP_URL`: `/signup`
   *   `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`: `/app`
   *   `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`: `/app`

### 3. Build & Deploy
1. Vercel will run the build command defined in `apps/web/package.json`.
2. Ensure your build command includes Prisma generation: `prisma generate && next build`.

---

## Production Readiness Checklist
- [ ] Change Clerk instance from **Development** to **Production**.
- [ ] Enable **Connection Pooling** in your database provider (essential for serverless).
- [ ] Set up a custom domain (e.g., `app.experimentlab.com`).
- [ ] Verify CORS settings in `api/v1/client/manifest` match your expected production SDK usage.

## Estimated Cost (Starting Out)
| Service | Tier | Cost/Mo |
| :--- | :--- | :--- |
| Vercel | Hobby / Pro | $0 - $20 |
| Neon DB | Launch | $0 |
| Clerk | Free / Pro | $0 |
| **Total** | | **$0 - $20** |
