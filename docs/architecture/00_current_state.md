# Current State Overview

## Stack Summary
- **Frontend:** Next.js 14 App Router located under `/app`, styled with Tailwind CSS (`tailwind.config.ts`) and shadcn-inspired UI primitives in `/components/ui`.
- **API Routes:** Server actions live in `/app/api/*` leveraging Next.js route handlers.
- **Persistence:** File-backed data store implemented in `lib/dataStore.ts` reading/writing `data/database.json`. Prisma schema exists but is not the active persistence layer.
- **Auth & Access:** Authentication helpers in `lib/auth.ts`, role-based access control in `lib/rbac.ts`, and validation helpers in `lib/zodSchemas.ts`. Rate limiting utilities live in `lib/rateLimit.ts`.

## Key Application Areas
- `/app/gigs` – gig browsing and management UI.
- `/app/post-gig` – gig creation form for promoters/venues.
- `/app/profiles` – public directory of comedian profiles.
- `/app/profile` – authenticated user profile dashboard (role-specific views in nested routes such as `/app/profile/comedian`).
- `/app/inbox` – messaging threads between users; integrates offers and bookings once implemented.
- `/app/api/gigs`, `/app/api/applications`, `/app/api/auth`, `/app/api/profile/*` – currently implemented API endpoints supporting gigs, applications, authentication, and profile management flows.

## Domain Modules (lib/dataStore.ts)
The file-backed store encapsulates all persistence logic. Core record collections include users, comedian/promoter/venue profiles, gigs, applications, favorites, threads & messages, offers, bookings, verification requests, reports, community board messages, and availability entries. Helper functions manage CRUD workflows, conversions between DTOs and record shapes, and snapshot serialization/deserialization.

## Known Gaps / 501 Placeholders
- `/app/api/offers` – both GET and POST return HTTP 501 (Not Implemented).
- `/app/api/bookings` – both GET and POST return HTTP 501 (Not Implemented).

## Planned Direction
Future work will extend the existing file-backed store (keeping Prisma optional) to support richer profiles, offers, bookings, premium features, reviews, ads, and admin tooling as outlined in the implementation plan.
