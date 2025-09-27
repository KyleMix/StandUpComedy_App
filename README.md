# the-funny

Production-ready starter for a stand-up comedy marketplace built with Next.js 14 and Tailwind. The demo data ships in `data/database.json` so the app works out of the box—no external database or Prisma setup required.

## Features

- Role-based access for comedians, promoters, venues, fans, and admins
- Password-based authentication backed by signed cookies (no external services)
- Gig publishing workflow gated by verification
- Verification request management with document uploads and admin approvals
- Tailwind CSS + shadcn-inspired UI primitives for rapid extension
- REST API endpoints secured with rate limiting and role checks
- Vitest unit tests
- Dockerfile and docker-compose for local development

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment (optional)

Copy `.env.example` to `.env` if you want to override the defaults:

```bash
cp .env.example .env
```

The application reads `SESSION_SECRET` for cookie signing and SMTP settings for notification emails. If those variables are omitted the app still runs with sensible fallbacks (SMTP emails are skipped).

### 3. Start the app

```bash
npm run dev
```

The app will be available at `http://localhost:3000` using the bundled JSON dataset.

### 4. Running in Docker

```bash
docker-compose up --build
```

This starts the Next.js app using the same on-disk JSON datastore.

### 5. Tests and linting

```bash
npm run test
npm run lint
```

## Project structure

- `app/` – Next.js App Router routes including API handlers
- `components/` – UI primitives and layout components
- `lib/` – shared utilities, auth, RBAC, rate limiting, mailer, datastore helpers
- `data/` – JSON datastore seeded with demo users, gigs, and verification requests
- `tests/` – Vitest unit tests

## Default accounts

Use the preloaded accounts from `data/database.json` to explore:

- Admin: `admin@thefunny.local` / `password`
- Promoter: `promoter@thefunny.local` / `password`
- Venue: `venue@thefunny.local` / `password`
- Comedians: `comic1@thefunny.local`, `comic2@thefunny.local` / `password`
- Fan: `fan@thefunny.local` / `password`

## License

MIT
