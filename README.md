# MealTime Backend

The REST API behind **MealTime**, a food delivery platform that connects customers with local restaurants. This service owns the core business data — users, restaurants, menus, and orders — and exposes it over HTTP to the [MealTime frontend](https://github.com/Mealtimez/MealTime-FE) and any other client.

> **Status:** early scaffold. The route structure, server setup, and database schema are in place, but the endpoints currently return placeholder data and are not yet wired to the database. See [Current status](#current-status).

---

## Table of contents

- [Where this fits](#where-this-fits)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [API reference](#api-reference)
- [Data model](#data-model)
- [Current status](#current-status)
- [Contributing](#contributing)
- [Related repositories](#related-repositories)

---

## Where this fits

MealTime is split into four repositories. This one is the system of record.

```mermaid
flowchart LR
    FE[MealTime-FE<br/>Next.js app] -->|HTTP / JSON| BE[MealTime-BE<br/>this repo]
    BE --> DB[(PostgreSQL)]
    FE -.->|events| AN[MealTime-Analytics]
    BE -.->|events| AN
    CT[MealTime-Contracts<br/>shared types & schemas] -.-> FE
    CT -.-> BE
```

- **MealTime-FE** calls this API to list restaurants and place orders.
- **MealTime-Contracts** defines the request/response shapes both sides agree on.
- **MealTime-Analytics** receives product events (e.g. "order placed").

## Tech stack

| Concern | Choice |
| --- | --- |
| Runtime | Node.js 18+ |
| Language | TypeScript (strict mode) |
| Web framework | Express 4 |
| Database | PostgreSQL 14+ |
| ORM | Prisma 5 |
| Validation | zod (installed, not yet wired into routes) |
| Dev server | tsx (watch mode) |
| Tests | Jest (configured, no tests yet) |

## Prerequisites

- **Node.js** 18 or newer — check with `node -v`
- **npm** (bundled with Node)
- **PostgreSQL** 14 or newer, running locally or reachable over the network

If you don't have Postgres installed, Docker is the quickest route:

```bash
docker run --name mealtime-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mealtime \
  -p 5432:5432 -d postgres:16
```

## Getting started

```bash
# 1. Clone
git clone https://github.com/Mealtimez/MealTime-BE.git
cd MealTime-BE

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# then edit .env — at minimum set DATABASE_URL

# 4. Create the database tables and generate the Prisma client
npx prisma migrate dev --name init
npx prisma generate

# 5. Start the dev server (restarts on file changes)
npm run dev
```

Verify it's up:

```bash
curl http://localhost:4000/health
# {"status":"ok","service":"MealTime API"}
```

## Environment variables

Defined in `.env` (copy from `.env.example`). Never commit your real `.env`.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string, e.g. `postgresql://user:password@localhost:5432/mealtime` |
| `PORT` | No | `4000` | Port the HTTP server listens on |
| `NODE_ENV` | No | `development` | `development`, `test`, or `production` |
| `API_BASE_URL` | No | `http://localhost:4000` | Public base URL of this API (reserved for links/callbacks) |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the server with `tsx watch` — reloads on change |
| `npm run build` | Compile TypeScript from `src/` to `dist/` |
| `npm start` | Run the compiled server from `dist/index.js` |
| `npm test` | Run the Jest test suite |
| `npx prisma migrate dev` | Create/apply a migration after editing `schema.prisma` |
| `npx prisma studio` | Open a browser UI to inspect the database |

## Project structure

```
MealTime-BE/
├── prisma/
│   └── schema.prisma        # Database models (User, Restaurant, MenuItem, Order, OrderItem)
├── src/
│   ├── index.ts             # App entry: middleware, /health, route mounting
│   └── routes/
│       ├── restaurants.ts   # /api/restaurants
│       └── orders.ts        # /api/orders
├── .env.example             # Template for local configuration
├── package.json
└── tsconfig.json
```

**Adding an endpoint:** create a router in `src/routes/`, then mount it in `src/index.ts` with `app.use('/api/<resource>', <router>)`.

## API reference

Base URL: `http://localhost:4000`. All request and response bodies are JSON. CORS is open to all origins in the current setup.

### Health

#### `GET /health`

```json
{ "status": "ok", "service": "MealTime API" }
```

### Restaurants

#### `GET /api/restaurants`

List restaurants.

```bash
curl http://localhost:4000/api/restaurants
```

```json
{
  "restaurants": [
    { "id": "1", "name": "Sample Restaurant", "cuisine": "Italian", "rating": 4.5 }
  ]
}
```

#### `GET /api/restaurants/:id`

Get one restaurant and its menu.

```json
{ "id": "1", "name": "Sample Restaurant", "cuisine": "Italian", "menu": [] }
```

### Orders

#### `GET /api/orders`

List orders.

```json
{ "orders": [] }
```

#### `POST /api/orders`

Create an order.

```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "1",
    "items": [{ "menuItemId": "10", "quantity": 2, "price": 12.5 }],
    "totalAmount": 25
  }'
```

Response — `201 Created`:

```json
{
  "id": "1",
  "restaurantId": "1",
  "items": [{ "menuItemId": "10", "quantity": 2, "price": 12.5 }],
  "totalAmount": 25,
  "status": "pending"
}
```

#### `GET /api/orders/:id`

Get an order's status.

```json
{ "id": "1", "status": "pending" }
```

## Data model

Defined in [`prisma/schema.prisma`](prisma/schema.prisma). All IDs are UUIDs.

```mermaid
erDiagram
    User ||--o{ Order : places
    Restaurant ||--o{ MenuItem : offers
    Restaurant ||--o{ Order : receives
    Order ||--|{ OrderItem : contains
    MenuItem ||--o{ OrderItem : "appears in"
```

| Model | Key fields |
| --- | --- |
| **User** | `email` (unique), `name`, `phone?` |
| **Restaurant** | `name`, `description?`, `cuisine`, `address`, `rating` (default `0`) |
| **MenuItem** | `name`, `description?`, `price`, `category`, `available` (default `true`), `restaurantId` |
| **Order** | `userId`, `restaurantId`, `totalAmount`, `status` (default `"pending"`) |
| **OrderItem** | `orderId`, `menuItemId`, `quantity`, `price` (price captured at order time) |

## Current status

What works today:

- Express server with CORS, JSON body parsing, and a health check
- Route layout for restaurants and orders
- Complete Prisma schema for the core domain

Known gaps — good first issues:

- **Routes return hard-coded data.** None of the handlers query Prisma yet.
- **No request validation.** `POST /api/orders` accepts any body; the zod schemas in [MealTime-Contracts](https://github.com/Mealtimez/MealTime-Contracts) are ready to plug in.
- **No authentication.** Orders aren't tied to a logged-in user.
- **No tests.** Jest is installed but there are no test files.
- **`npm run lint` is not set up.** The script calls ESLint, but ESLint isn't installed or configured.
- **Migrations are git-ignored** (`prisma/migrations/`). Decide whether to commit them before deploying anywhere shared.

## Contributing

1. Pick or open an issue and comment with your approach.
2. Branch from `main` using a prefix: `feature/`, `fix/`, `docs/`, `refactor/`, `test/`.
3. Keep changes focused; update this README if you change setup, env vars, or endpoints.
4. Use [Conventional Commits](https://www.conventionalcommits.org/): `feat: add restaurant search`, `fix: correct order total`.
5. Make sure `npm run build` passes, then open a pull request describing what changed and how you tested it.

**Security:** never commit `.env` files or credentials. Report vulnerabilities privately to the maintainers rather than in a public issue.

## Related repositories

| Repository | Purpose |
| --- | --- |
| [MealTime-FE](https://github.com/Mealtimez/MealTime-FE) | Customer-facing Next.js web app |
| [MealTime-Contracts](https://github.com/Mealtimez/MealTime-Contracts) | Shared TypeScript types and zod validation schemas |
| [MealTime-Analytics](https://github.com/Mealtimez/MealTime-Analytics) | Product event ingestion service |
