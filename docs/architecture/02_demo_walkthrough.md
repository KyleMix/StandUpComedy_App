# Demo Walkthrough (PNW Snapshot)

This snapshot seeds the data store with a curated Pacific Northwest demo so the product team can rehearse bookings end-to-end.

## Test accounts

All demo accounts use the password `DemoPass123!`.

| Role | Name | Email |
| --- | --- | --- |
| Admin | Alex Admin | `admin@thefunny.local` |
| Promoter | Sasha Showcase (Seattle) | `seattle.promoter@thefunny.local` |
| Venue | Laugh Lodge (Seattle) | `laugh.lodge@thefunny.local` |
| Comedian | Ella Evergreen | `ella@thefunny.local` |

Additional promoters, venues, and 11 more comedians are also created so search/browse experiences feel rich.

## Offer → booking → review flow

Use the Seattle clean showcase scenario to exercise the full workflow:

1. **Promoter sends offer** – Sign in as Sasha Showcase and open the gig “Downtown Seattle Clean Showcase.” Launch the existing thread with Ella Evergreen to review the PG-13 terms and the flat $650 offer.
2. **Comedian accepts** – As Ella Evergreen, open the same thread and accept the `offer-sea-clean-ella` proposal. A booking (`booking-sea-clean-ella`) is generated automatically.
3. **Booking completion** – The booking records the clean requirement, payout protection, and payment intent so finance and reporting screens show real numbers.
4. **Mutual reviews** – After the April 12 show, both parties left conversation ratings and public gig reviews. Inspect the review history to see how the platform surfaces responsiveness scores and average ratings.

You can repeat the process with other demo bookings (Olympia Arts Benefit, Tacoma Tech Corporate Luncheon, Bellingham University Night) to showcase different budgets, clean requirements, and review mixes.
