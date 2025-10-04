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

Additional preloaded accounts from `data/database.json` are available for role-specific flows:

- Admin: `admin@thefunny.local` / `password`
- Promoter: `promoter@thefunny.local` / `password`
- Venue: `venue@thefunny.local` / `password`
- Comedians: `comic1@thefunny.local`, `comic2@thefunny.local` / `password`
- Fan: `fan@thefunny.local` / `password`

## License

MIT
