# Engineering Standards & Stability

To ensure the long-term stability and security of **ExperimentLab**, all contributors should adhere to the following standards. These are designed to prevent regression errors, broken builds, and deployment blocks.

## 1. Dependency Management

- **Stability Over Newness:** Avoid using `canary`, `experimental`, or `rc` versions for core frameworks (e.g., Next.js, React) unless a specific feature is required.
- **Security Audits:** Run `pnpm audit` weekly. Critical vulnerabilities must be patched immediately to avoid Vercel deployment blocks.
- **Fixed Versions:** When a specific version is required for stability or security (e.g., `15.1.9` for CVE-2025-66478), ensure it is pinned in `package.json`.

## 2. CI/CD Governance

- **Mandatory Checks:** No PR should be merged into `main` unless the following GitHub Actions pass:
  - `lint`: Ensures code style and prevents CLI errors.
  - `typecheck`: Ensures structural integrity and proper API usage (e.g., Clerk, Next.js).
  - `test`: Verifies business logic and prevents regressions.
- **Local Verification:** Before pushing, always run:
  ```bash
  pnpm lint
  pnpm typecheck
  pnpm test
  ```

## 3. Environment Stability

- **Node.js Version:** Use the Node.js version specified in `.nvmrc` or the `engines` field of `package.json` to ensure consistency across dev, CI, and production.
- **Managed Types:** Do not manually edit `next-env.d.ts`. If you need to add custom types, use a separate `types/` directory or a global `.d.ts` file included in `tsconfig.json`.

## 4. Third-Party Integrations

- **API Changes:** When upgrading libraries with external components (e.g., Clerk), always verify that props and features haven't been deprecated by running `typecheck`.
- **Authentication:** Keep SDKs up to date to ensure compatibility with modern browser security policies.
