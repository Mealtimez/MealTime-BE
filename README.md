# MealTime Backend

REST API for the MealTime food delivery platform.

## Tech Stack

- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM

## Getting Started

```bash
pnpm install
cp .env.example .env   # set DATABASE_URL and PORT
pnpm prisma migrate dev
pnpm prisma generate
pnpm dev
```

The API runs on `http://localhost:4000` by default.

## Scripts

- `pnpm dev` — start in watch mode
- `pnpm build` — compile to `dist/`
- `pnpm start` — run the compiled build
- `pnpm test` — run tests

## Related repos

- [MealTime-FE](https://github.com/sudo-dev-lab/MealTime-FE) — frontend application
- [MealTime-Contracts](https://github.com/sudo-dev-lab/MealTime-Contracts) — shared types & validation schemas
- [MealTime-Analytics](https://github.com/sudo-dev-lab/MealTime-Analytics) — analytics ingestion service
