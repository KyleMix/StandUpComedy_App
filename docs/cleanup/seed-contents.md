# Seed Contents Overview

The seed script populates the file-backed datastore with a minimal graph centered on six test accounts.

## Users
- **admin@thefunny.local** – Admin account for platform management.
- **promoter@thefunny.local** – Promoter running showcase bookings.
- **venue@thefunny.local** – Harbor Lights Comedy Club venue account.
- **comic1@thefunny.local** – Casey Quick, a Seattle-based comedian.
- **comic2@thefunny.local** – Riley Riff, a Portland-based comedian.
- **fan@thefunny.local** – Frankie Fan, used for consumer journeys and favorites.

## Profiles & Availability
- Promoter profile for Northwest Laugh Co. tied to promoter@.
- Venue profile for Harbor Lights Comedy Club tied to venue@.
- Comedian profiles for Casey Quick and Riley Riff with sample media, styles, rates, and limited availability slots.

## Gigs & Threads
- `gig-seattle-showcase` (OPEN) – Promoter-led Seattle showcase with a pending offer to Casey Quick.
- `gig-portland-open` (OPEN) – Venue-led Portland brewery night ready for outreach.
- `gig-portland-past` (CLOSED) – Completed rooftop event used for booked/fulfilled flows.
- `thread-seattle-offer` with a pending offer (`offer-seattle-casey`) for Casey Quick.
- `thread-portland-booked` with an accepted offer (`offer-portland-riley`) that leads to the completed booking.

## Bookings & Reviews
- `booking-portland-riley` finalizes the rooftop show with Riley Riff and supports post-show reviews.
- Conversation review from the promoter and two public reviews (promoter + fan) referencing the booked gig.

## Other Records
- Favorites: fan@ bookmarking the open Seattle showcase.
- Ad slots: two simple creatives promoting Harbor Lights programming and Riley Riff’s clean comedy offering.
- Feature flags seeded from defaults; all other collections start empty.
