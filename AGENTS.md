# Repository Guidelines

## Project Structure & Module Organization

- `app/` is the Next.js App Router surface: `/` goals grid, `/goals/new` for creation, `/goals/[goalSlug]` for detail + ledger, and `app/api/unsplash/*` for search/download tracking.
- `components/` holds app UI (goal cards, empty state, goal ledger table, new-goal form). `components/ui/` is shadcn/Base UI output.
- `db/schema.sql` defines Neon/Postgres tables (`goals`, `goal_transactions`, `goal_champions`).
- `lib/` for utilities and data access: `lib/data/*`, `lib/ledger`, `lib/unsplash`.
- Tests live in `lib/__tests__/` and `components/__tests__/`.

## Shadcn Components (Base UI)

- Use the shadcn CLI with Base UI; keep `@base-ui/react` and `components.json` committed.
- Add components: `npx shadcn@latest add button`.
- Base UI registry: `npx shadcn@latest add @basecn/button` (or `https://basecn.dev/r/button.json`).
- Forms should use shadcn `Form` + `Field` components; date inputs use the shadcn `Calendar` component.

## Build, Test, and Development Commands

- `npm run dev`, `npm run build`, `npm run start`.
- `npm run lint` (ESLint), `npm run test` (Vitest 4).
- `npm run format` / `npm run format:check` (Prettier).
- Husky + lint-staged run format/lint/test on commit.

## Coding Style & Naming Conventions

- TypeScript everywhere; keep types close to usage.
- Tailwind: use standard utility sizes only (no `text-[…]` or `tracking-[…]`).
- Component files in PascalCase; hooks/utilities in camelCase.
- Route folders under `app/` should match URLs (lowercase).

## Testing Guidelines

- Vitest 4 is the runner; use `*.test.ts` / `*.test.tsx`.
- Prioritize ledger math, formatting, and data shaping; add focused component tests where needed (e.g., empty state).

## Commit & Pull Request Guidelines

- Keep messages short and imperative (prefixes optional).
- PRs should include summary + UI screenshots when visuals change.

## Configuration & Deployment Notes

- `.env.local` for secrets. Required: `DATABASE_URL`, `UNSPLASH_ACCESS_KEY`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Optional: `ALLOWED_EMAILS=you@example.com,partner@example.com` to restrict access.
- Vercel deploys from this repo; keep env vars synced across dev/preview/prod.
