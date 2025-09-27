# the-funny

Production-ready starter for a stand-up comedy marketplace built with Next.js 14, Prisma, and Tailwind.

## Features

- Role-based access for comedians, promoters, venues, fans, and admins
- Email/password & Google authentication with NextAuth
- Gig publishing workflow gated by verification
- Verification request management with document uploads and admin approvals
- Prisma/PostgreSQL schema with seeds for demo data
- Tailwind CSS + shadcn-inspired UI primitives for rapid extension
- REST API endpoints secured with rate limiting and role checks
- Vitest unit tests
- Dockerfile and docker-compose for local development

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and set the values:

```bash
cp .env.example .env
```

At minimum, configure `DATABASE_URL`, `NEXTAUTH_SECRET`, and SMTP credentials if you want email delivery.

### 3. Database setup

Run Prisma migrations and seed the database:

```bash
npm run db:push
npm run db:seed
```

### 4. Start the app

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 5. Running in Docker

```bash
docker-compose up --build
```

This starts both the Next.js app and a PostgreSQL database. Adjust environment variables in `.env` as needed.

### 6. Tests and linting

```bash
npm run test
npm run lint
```

## Project structure

- `app/` – Next.js App Router routes including API handlers
- `components/` – UI primitives and layout components
- `lib/` – shared utilities, auth, RBAC, rate limiting, mailer, and schema helpers
- `prisma/` – Prisma schema and seed script
- `tests/` – Vitest unit tests

## Default accounts

After running the seed script, you can sign in with:

- Admin: `admin@thefunny.local` / `password`
- Promoter: `promoter@thefunny.local` / `password`
- Venue: `venue@thefunny.local` / `password`
- Comedians: `comic1@thefunny.local` – `comic5@thefunny.local` / `password`

## License

MIT
