# Cleanup Verification

All cleanup and reseed commands were executed in order:

1. `npm run cleanup:testdata`
2. `npm run cleanup:deadcode`
3. `npm run db:seed`
4. `npm run cleanup:testdata` (rerun after reseeding to capture final counts)

## Snapshot Counts After Pruning
| Collection | Kept | Removed |
| --- | ---: | ---: |
| Users | 6 | 0 |
| Comedian Profiles | 2 | 0 |
| Venue Profiles | 1 | 0 |
| Promoter Profiles | 1 | 0 |
| Gigs | 3 | 0 |
| Threads | 2 | 0 |
| Messages | 3 | 0 |
| Offers | 2 | 0 |
| Bookings | 1 | 0 |
| Conversation Reviews | 1 | 0 |
| Reviews | 2 | 0 |
| Favorites | 1 | 0 |
| Availability | 4 | 0 |
| Comedian Appearances | 1 | 0 |
| Comedian Videos | 2 | 0 |
| Ad Slots | 2 | 0 |
| Feature Flags | 3 | 0 |
| All other collections | 0 | 0 |

(Counts sourced from `docs/cleanup/cleanup-report.md`).

## User Accounts Present
- admin@thefunny.local
- promoter@thefunny.local
- venue@thefunny.local
- comic1@thefunny.local
- comic2@thefunny.local
- fan@thefunny.local

No additional users exist in `data/database.json`.

## Active Demo Graph
- **Waterfront Weekend Showcase** (`gig-seattle-showcase`) – created by `user-promoter`.
- **Portland Brewery Comedy Night** (`gig-portland-open`) – created by `user-venue`.
- **Rooftop Spring Finale** (`gig-portland-past`) – created by `user-promoter` and used for the booked/reviewed flow.

Associated threads, offers, bookings, reviews, and availability records only reference the six test accounts above.

## Dead Code & Dependency Notes
- Removed dependencies are listed in `docs/cleanup/removed_deps.md` and were pruned via `npm run cleanup:deadcode`.
- `depcheck` continues to flag `postcss` even though it is required by the Tailwind + Next.js PostCSS pipeline; it is retained intentionally.
- The analyzer produced no deletions, but generated `docs/cleanup/removed_files.md` to document unused-export signals for manual review.

### Kept by Design (Dynamic/Config)
Certain files appear unused to static analysis but are required by framework conventions:
- Next.js App Router pages (`app/**/page.tsx`), route handlers (`app/api/**/route.ts`), layout/error/loading/not-found boundaries, and metadata exports are invoked by the filesystem router.
- Configuration modules (e.g., `tailwind.config.ts`, `postcss.config.js`, `lib/config/**`, `lib/assets/**`) are consumed via runtime configuration and bundler side effects.
- API utilities such as `lib/auth.ts`, `lib/dataStore.ts`, and ingestion helpers are referenced through dynamic routing or scheduled tasks.

These retained modules are documented so future dead-code sweeps can continue to ignore them.
