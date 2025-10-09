# the-funny

Production-ready starter for a stand-up comedy marketplace built with Next.js 14 and Tailwind. The demo data ships in `data/database.json` so the app works out of the box—no external database or Prisma setup required.

## Features

- Role-based access for comedians, promoters, venues, fans, and admins
- Password-based authentication backed by signed cookies (no external services)
- Gig publishing workflow gated by verification
- Verification request management with document uploads and admin approvals
- Tailwind CSS + shadcn-inspired UI primitives for rapid extension
- REST API endpoints secured with rate limiting and role checks
- Messaging center with offer/quote workflow, payout-protected bookings, and reporting tools
- Vitest unit tests
- Dockerfile and docker-compose for local development

## Getting started

### Prerequisites

- **Node.js 20.x** and **npm 10+** (matching the CI matrix in `.github/workflows/ci.yml`).
- Docker (optional) if you prefer containers over the local Node runtime.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment (optional)

Copy `.env.example` to `.env` if you want to override the defaults:

```bash
cp .env.example .env
```

Key variables:

| Variable | Description | Default |
| --- | --- | --- |
| `SESSION_SECRET` | Secret used to sign authentication cookies. Always override in production. | _(required)_ |
| `DATABASE_URL` | Postgres connection string; when omitted the JSON datastore at `data/database.json` is used. | _(empty)_ |
| `NEXT_PUBLIC_VERCEL_URL` | Hostname allowlist entry for server actions when deploying to Vercel. | _(empty)_ |
| `PLAUSIBLE_DOMAIN` | Enables the Plausible analytics embed for the provided domain. | _(empty)_ |
| `SMTP_*` | Optional SMTP credentials for transactional emails (see [Email](#email-optional)). | _(empty)_ |
| `GOOGLE_CSE_*` | Google Custom Search Engine credentials for open mic ingestion. | _(empty)_ |
| `OPENMIC_ALLOWED_SITES` | Comma-separated origin allowlist for ingestion. | `config/openmic.allowlist.ts` |
| `DEFAULT_CITIES` | Semicolon-separated list of default city/state pairs for discovery filters. | `Olympia,WA; Tacoma,WA; Seattle,WA; Portland,OR` |
| `DEFAULT_RADIUS_MILES` | Default radius (miles) for open mic searches. | `60` |
| `INGEST_WINDOW_DAYS` | How far ahead (days) to look for open mic events. | `45` |
| `ENABLE_REDDIT_OPENMICS` | Toggle for the Reddit ingestion source. | `false` |

All variables have sensible defaults for local development. Leaving `DATABASE_URL` empty keeps persistence on `data/database.json`.

### 3. Start the app

```bash
npm run dev
```

The app is available at `http://localhost:3000` using the bundled JSON dataset. Sign in with the pre-seeded QA admin from `data/database.json`: `master@thefunny.local` / `TestingMaster!123`.

### 4. Build for production

```bash
npm run build
npm run start
```

`npm run build` runs the same checks as CI (`tsc`, `next lint`, unit tests) before generating the production bundle.

### 5. Running in Docker

```bash
docker compose up --build
```

This starts both the Next.js app and a Postgres instance. The application connects to Postgres via the `DATABASE_URL` value declared in `docker-compose.yml`. Comment out that environment variable (or stop the `db` service) if you prefer the JSON datastore during containerized development.

### 6. Production-style Postgres workflow

For parity with production you can boot the compose stack in detached mode, run migrations, and seed the relational database:

```bash
docker compose up -d
docker compose exec web npm run db:generate
docker compose exec web npm run db:migrate
docker compose exec web npm run db:seed
```

With the database ready, restart the web container or run `docker compose restart web` to ensure Prisma reconnects using the seeded schema.

### 7. Quality checks

```bash
npm run lint     # ESLint + Tailwind conventions
npx tsc --noEmit # Type-check the project
npm run test     # Vitest unit tests
```

## Project structure

- `app/` – Next.js App Router routes including API handlers
- `components/` – UI primitives and layout components
- `lib/` – shared utilities, auth, RBAC, rate limiting, mailer, datastore helpers
- `data/` – JSON datastore seeded with demo users, gigs, and verification requests
- `tests/` – Vitest unit tests
- `scripts/` – data seeding (`seed.ts`) and long-running jobs (open mic cron harness)
- `docs/architecture/` – current-state overview and demo walkthroughs for onboarding

### Data & seeding

- The default datastore (`data/database.json`) ships with a Pacific Northwest demo snapshot. Run `npm run db:seed` to regenerate the snapshot from `scripts/seed.ts`.
- All demo accounts—including the QA admin and the `docs/architecture/02_demo_walkthrough.md` personas—share the password `DemoPass123!` (`TestingMaster!123` remains for the master QA admin).
- Updating the JSON datastore is safe for demos; commit the regenerated file if you want to share changes.

### Optional Postgres + Prisma

While the JSON datastore is the default, setting `DATABASE_URL` flips the app into database-backed mode:

1. Start a Postgres instance and expose the connection string in `.env`.
2. Generate the Prisma client (schema lives in `prisma/schema.prisma`):
   ```bash
   npm run db:generate
   ```
3. Run migrations and seeds as needed:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

The helper in [`lib/prisma.ts`](./lib/prisma.ts) proxies datastore calls when Postgres is unavailable, so the rest of the app code can stay agnostic.

### Open mic ingestion workflow (optional)

Set the `GOOGLE_CSE_*`, `OPENMIC_ALLOWED_SITES`, `DEFAULT_CITIES`, `DEFAULT_RADIUS_MILES`, `INGEST_WINDOW_DAYS`, and `ENABLE_REDDIT_OPENMICS` variables to enable ingestion.

- **One-off import:** `npm run openmics:once` executes [`lib/openmics/ingest.ts`](./lib/openmics/ingest.ts) against the configured sources.
- **Cron harness:** `npm run openmics:cron` starts the scheduler in [`scripts/openmic-cron.ts`](./scripts/openmic-cron.ts) for recurring syncs (configure `JOB_INTERVAL_CRON` to change the cadence).
- Both commands require a Postgres-backed Prisma client because open mic data persists to relational tables.

### Automation & CI

- GitHub Actions (`.github/workflows/ci.yml`) installs dependencies with `npm ci` and runs `npm run typecheck`, `npm run lint`, and `npm test -- --run` on Node.js 20.
- An optional Datadog Synthetics workflow (`.github/workflows/datadog-synthetics.yml`) is wired for tagged end-to-end checks when API and application keys are provided.

## Assets & Licenses

All creative assets are served locally from `public/assets` to keep pages fast, private, and compliant. Approved hero imagery and video filenames live in [`lib/assets/hero.ts`](./lib/assets/hero.ts); drop the corresponding files into `public/assets/hero` or `public/assets/video` before launch. Placeholder graphics (e.g., `stage-lights.svg`) are generated in-house and can be replaced with licensed photography when available.

Automated avatar fallbacks use DiceBear's `botttsNeutral` sprite with non-attribution commercial use per DiceBear guidance. Attribution tooling lives in [`lib/assets/licenses.ts`](./lib/assets/licenses.ts) and [`components/ui/AssetAttribution.tsx`](./components/ui/AssetAttribution.tsx), governed by [`lib/assets/config.ts`](./lib/assets/config.ts).

### Provider overview

| Provider | License | How we use it |
| --- | --- | --- |
| [Unsplash](https://unsplash.com/license) | Unsplash License | Optional hero photography stored in `/public/assets/hero`; attribution appreciated but optional. |
| [Pexels](https://www.pexels.com/license/) | Pexels License | Alternative hero photos or b-roll video clips stored locally; no attribution required. |
| [Pixabay](https://pixabay.com/service/license/) | Pixabay License | Backup photography or footage with prohibited-use caveats documented in-source. |
| [unDraw](https://undraw.co/license) | unDraw License | Illustration SVGs saved under `/public/assets/illustrations` for empty states and onboarding flows. |
| [Heroicons](https://github.com/tailwindlabs/heroicons/blob/master/LICENSE) | MIT | UI glyphs available via the icon shim. |
| [Lucide](https://github.com/lucide-icons/lucide/blob/main/LICENSE) | ISC | Default icon set surfaced through `components/ui/Icon.tsx`. |
| [Tabler](https://github.com/tabler/tabler-icons/blob/master/LICENSE) | MIT | Optional icon family accessible through the shim. |
| [Phosphor](https://github.com/phosphor-icons/phosphor-home/blob/master/LICENSE) | MIT | Supplemental icons (e.g., chat) exposed via the shim. |
| [DiceBear](https://www.dicebear.com/licenses) | DiceBear License | `botttsNeutral` avatar sprites hashed with SHA-256; free for commercial use with no attribution required. |
| [OpenMoji](https://openmoji.org/license/) | CC BY-SA 4.0 | Emoji assets—attribution is rendered automatically when enabled. |
| [Google Fonts](https://developers.google.com/fonts/licensing) | Open-source font licenses | `Inter` for UI text and `Bricolage Grotesque` for headlines via `next/font`. |
| [Hero Patterns](https://www.heropatterns.com/) | MIT | Inline SVG patterns rendered by `HeroBackground`. |
| [Haikei](https://app.haikei.app/) | Haikei License | Locally exported wave backgrounds referenced in hero/empty states. |

DiceBear, OpenMoji, and other attribution-sensitive sources respect the global mode defined in [`lib/assets/config.ts`](./lib/assets/config.ts). Toggle to `always` if you prefer permanent credits.

## Master testing account

Always use the dedicated QA account when running manual checks:

- Master tester (admin): `master@thefunny.local` / `TestingMaster!123`

## Default accounts

Additional preloaded accounts from `data/database.json` are available for role-specific flows. Unless otherwise noted they all use `DemoPass123!`:

- Admin: `admin@thefunny.local`
- Promoter: `promoter@thefunny.local`
- Venue: `venue@thefunny.local`
- Comedians: `comic1@thefunny.local`, `comic2@thefunny.local`
- Fan: `fan@thefunny.local`

## Forum integration (NodeBB)

To run the companion community forum with comedian/promoter/venue profiles, install NodeBB and enable the custom plugin located at [`nodebb-plugin-user-role/`](./nodebb-plugin-user-role). Detailed setup instructions, category templates, and automation scripts live in [`docs/nodebb-setup.md`](./docs/nodebb-setup.md) and [`nodebb-config/categories.json`](./nodebb-config/categories.json).

## License

MIT
