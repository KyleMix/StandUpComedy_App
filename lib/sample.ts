export interface GigSample {
  id: string;
  title: string;
  venue: string;
  city: string;
  dateISO: string;
  signupUrl: string;
  tags: string[];
  isOpenMic: boolean;
  compensationType: "FLAT" | "DOOR_SPLIT" | "TIPS" | "UNPAID";
  payoutUsd: number | null;
  totalSpots: number | null;
  spotsRemaining: number | null;
}

export interface ProfileSample {
  displayName: string;
  role: "comedian" | "venue" | "fan";
  city: string;
  avatarUrl?: string;
}

const dicebear = (seed: string) => `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}`;

export const gigs: GigSample[] = [
  {
    id: "oly-midnight-oil",
    title: "Midnight Oil Showcase",
    venue: "Obsidian Stage",
    city: "Olympia, WA",
    dateISO: "2025-02-14",
    signupUrl: "/gigs/oly-midnight-oil",
    tags: ["booked", "paid"],
    isOpenMic: false,
    compensationType: "FLAT",
    payoutUsd: 100,
    totalSpots: 6,
    spotsRemaining: 2
  },
  {
    id: "oly-open-late",
    title: "Open Late Mic",
    venue: "Gravity Espresso",
    city: "Olympia, WA",
    dateISO: "2025-02-19",
    signupUrl: "/gigs/oly-open-late",
    tags: ["open mic"],
    isOpenMic: true,
    compensationType: "TIPS",
    payoutUsd: null,
    totalSpots: 18,
    spotsRemaining: 7
  },
  {
    id: "tacoma-sunday",
    title: "Sunday Sitdowns",
    venue: "Blue Mouse Lounge",
    city: "Tacoma, WA",
    dateISO: "2025-02-23",
    signupUrl: "/gigs/tacoma-sunday",
    tags: ["booked"],
    isOpenMic: false,
    compensationType: "DOOR_SPLIT",
    payoutUsd: null,
    totalSpots: 5,
    spotsRemaining: 1
  },
  {
    id: "tacoma-backroom",
    title: "Backroom Banter",
    venue: "Alma Mater Loft",
    city: "Tacoma, WA",
    dateISO: "2025-03-02",
    signupUrl: "/gigs/tacoma-backroom",
    tags: ["open mic"],
    isOpenMic: true,
    compensationType: "UNPAID",
    payoutUsd: null,
    totalSpots: null,
    spotsRemaining: null
  },
  {
    id: "seattle-late-show",
    title: "Late Show Laugh Riot",
    venue: "Clock-Out Lounge",
    city: "Seattle, WA",
    dateISO: "2025-03-07",
    signupUrl: "/gigs/seattle-late-show",
    tags: ["booked", "paid"],
    isOpenMic: false,
    compensationType: "FLAT",
    payoutUsd: 200,
    totalSpots: 8,
    spotsRemaining: 4
  },
  {
    id: "seattle-rain-city",
    title: "Rain City Mic Drop",
    venue: "Laughing Planet Basement",
    city: "Seattle, WA",
    dateISO: "2025-03-12",
    signupUrl: "/gigs/seattle-rain-city",
    tags: ["open mic"],
    isOpenMic: true,
    compensationType: "TIPS",
    payoutUsd: null,
    totalSpots: 16,
    spotsRemaining: 9
  },
  {
    id: "portland-bridge",
    title: "Bridge City Showcase",
    venue: "Helium Annex",
    city: "Portland, OR",
    dateISO: "2025-03-16",
    signupUrl: "/gigs/portland-bridge",
    tags: ["booked"],
    isOpenMic: false,
    compensationType: "DOOR_SPLIT",
    payoutUsd: null,
    totalSpots: 5,
    spotsRemaining: 0
  },
  {
    id: "portland-diy",
    title: "DIY Comedy Hang",
    venue: "The Fixin' To Patio",
    city: "Portland, OR",
    dateISO: "2025-03-20",
    signupUrl: "/gigs/portland-diy",
    tags: ["open mic"],
    isOpenMic: true,
    compensationType: "UNPAID",
    payoutUsd: null,
    totalSpots: 20,
    spotsRemaining: 12
  }
];

export const profiles: ProfileSample[] = [
  { displayName: "Rayna Flores", role: "comedian", city: "Olympia, WA", avatarUrl: dicebear("rayna-flores") },
  { displayName: "Milo Kendrick", role: "comedian", city: "Tacoma, WA" },
  { displayName: "Stage One Theater", role: "venue", city: "Olympia, WA", avatarUrl: dicebear("stage-one") },
  { displayName: "Laugh Lab Collective", role: "fan", city: "Seattle, WA", avatarUrl: dicebear("laugh-lab") },
  { displayName: "Gina Park", role: "comedian", city: "Seattle, WA" },
  { displayName: "Bridge City Comedy Club", role: "venue", city: "Portland, OR" },
  { displayName: "Tacoma Crowdwork Crew", role: "fan", city: "Tacoma, WA" },
  { displayName: "Olivia Rhodes", role: "comedian", city: "Portland, OR", avatarUrl: dicebear("olivia-rhodes") },
  { displayName: "Cascadia Booker Hub", role: "fan", city: "Olympia, WA", avatarUrl: dicebear("cascadia-hub") }
];
