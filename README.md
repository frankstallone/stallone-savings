# F4 Goal Tracker

F4 Goal Tracker is a goal‑based savings tracker built with Next.js, shadcn/Base UI, Kysely, and a Neon Postgres database. It lets you organize deposits and withdrawals into goals, view per‑goal ledgers, and choose Unsplash cover imagery with attribution.

## Features

- Goal cards with balances, champions, and cover images.
- Per‑goal ledger with deposits/withdrawals and net movement.
- Goal creation page with Unsplash search + attribution tracking.
- Toast confirmations for create/delete actions.
- Vitest 4 test suite.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
DATABASE_URL=postgres://...
UNSPLASH_ACCESS_KEY=your_key
BETTER_AUTH_SECRET=your_32+_char_secret
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
# Optional: lock the app to specific accounts
ALLOWED_EMAILS=you@example.com,partner@example.com
```

## Database Setup

1. Ensure the Better Auth tables are created in your database (run Better Auth's schema setup).
2. Apply app migrations:

```bash
npm run db:migrate
```

Optional seed data:

```bash
npm run db:seed
```

## Data Access

Database access uses Kysely with a typed schema in `lib/db-types.ts`. The `getDb()` helper in `lib/db.ts` returns the Kysely instance. Prefer the query builder for standard CRUD, and use `sql\`...\`.execute(db)` when you need raw SQL.

## Scripts

- `npm run dev` – start the dev server.
- `npm run build` – production build.
- `npm run start` – run the build locally.
- `npm run db:migrate` – apply SQL migrations from `db/migrations`.
- `npm run db:seed` – load anonymized sample goals.
- `npm run lint` – ESLint.
- `npm run test` – Vitest.
- `npm run format` – Prettier.

## Deployment

Deploy on Vercel. Ensure `DATABASE_URL` and `UNSPLASH_ACCESS_KEY` are set for dev/preview/prod environments.

## License

This project is licensed under the O'Saasy License. See `LICENSE`.
