# Repository Guidelines

## Project Structure & Module Organization

- `app/` is the Next.js App Router surface: `/` goals grid, `/goals/new` for creation, `/goals/[goalSlug]` for detail + ledger, `app/api/unsplash/*` for search/download tracking, and `app/api/storage/*` for upload targets + local/vercel upload handling.
- `components/` holds app UI (goal cards, empty state, goal ledger table, new-goal form). `components/ui/` is shadcn/Base UI output.
- `db/migrations/` holds SQL migrations (start with `001_init.sql` for goals tables).
- `db/schema.sql` mirrors the app tables for quick reference.
- `lib/db.ts` provides the Kysely connection; `lib/db-types.ts` defines typed tables/columns.
- `scripts/` contains database tooling (`migrate.js`, `seed.js`).
- `lib/` for utilities and data access: `lib/data/*`, `lib/ledger`, `lib/unsplash`, `lib/storage` (provider adapters + upload helpers).
- Tests live in `lib/__tests__/` and `components/__tests__/`.

## Shadcn Components (Base UI)

- Use the shadcn CLI with Base UI; keep `@base-ui/react` and `components.json` committed.
- Add components: `npx shadcn@latest add button`.
- Base UI registry: `npx shadcn@latest add @basecn/button` (or `https://basecn.dev/r/button.json`).
- Forms should use shadcn `Form` + `Field` components; date inputs use the shadcn `Calendar` component.

## Build, Test, and Development Commands

- `npm run dev`, `npm run build`, `npm run start`.
- `npm run db:migrate` to apply `db/migrations`.
- `npm run db:seed` to load anonymized sample goals.
- `npm run lint` (ESLint), `npm run test` (Vitest 4).
- `npm run format` / `npm run format:check` (Prettier).
- Husky + lint-staged run format/lint/test on commit.

## Coding Style & Naming Conventions

- TypeScript everywhere; keep types close to usage.
- Tailwind: use standard utility sizes only (no `text-[…]` or `tracking-[…]`).
- Component files in PascalCase; hooks/utilities in camelCase.
- Route folders under `app/` should match URLs (lowercase).
- Database access uses Kysely. Prefer the query builder; use `sql\`...\`.execute(db)` for complex SQL.

## Testing Guidelines

- Vitest 4 is the runner; use `*.test.ts` / `*.test.tsx`.
- Prioritize ledger math, formatting, and data shaping; add focused component tests where needed (e.g., empty state).

## Commit & Pull Request Guidelines

- Keep messages short and imperative (prefixes optional).
- PRs should include summary + UI screenshots when visuals change.
- Release Please runs on `main`. Prefer Conventional Commits (`feat:`, `fix:`, `feat!:` / `BREAKING CHANGE`) so version bumps and GitHub Releases are generated automatically.

## Configuration & Deployment Notes

- Copy `.env.example` to `.env.local`.
- Required: `DATABASE_URL`, `UNSPLASH_ACCESS_KEY`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- Optional: `ALLOWED_EMAILS=you@example.com,partner@example.com` to restrict access.
- Storage providers are configured via `STORAGE_PROVIDER` plus provider-specific env vars (see `.env.example`).
- Vercel deploys from this repo; keep env vars synced across dev/preview/prod.
