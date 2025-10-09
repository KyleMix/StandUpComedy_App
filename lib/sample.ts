export interface GigSample {
  id: string;
  title: string;
  venue: string;
  city: string;
  dateISO: string;
  signupUrl: string;
  tags: string[];
  isOpenMic: boolean;
}

export interface ProfileShowcase {
  title: string;
  dateISO: string;
  venue: string;
}

export interface ProfileSample {
  slug: string;
  displayName: string;
  role: "comedian" | "venue" | "fan";
  city: string;
  avatarUrl?: string;
  tagline?: string;
  bio: string;
  experienceYears?: number;
  specialties?: string[];
  credits?: string[];
  upcomingShows?: ProfileShowcase[];
  network?: string[];
  website?: string;
  contactEmail?: string;
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
    isOpenMic: false
  },
  {
    id: "oly-open-late",
    title: "Open Late Mic",
    venue: "Gravity Espresso",
    city: "Olympia, WA",
    dateISO: "2025-02-19",
    signupUrl: "/gigs/oly-open-late",
    tags: ["open mic"],
    isOpenMic: true
  },
  {
    id: "tacoma-sunday",
    title: "Sunday Sitdowns",
    venue: "Blue Mouse Lounge",
    city: "Tacoma, WA",
    dateISO: "2025-02-23",
    signupUrl: "/gigs/tacoma-sunday",
    tags: ["booked"],
    isOpenMic: false
  },
  {
    id: "tacoma-backroom",
    title: "Backroom Banter",
    venue: "Alma Mater Loft",
    city: "Tacoma, WA",
    dateISO: "2025-03-02",
    signupUrl: "/gigs/tacoma-backroom",
    tags: ["open mic"],
    isOpenMic: true
  },
  {
    id: "seattle-late-show",
    title: "Late Show Laugh Riot",
    venue: "Clock-Out Lounge",
    city: "Seattle, WA",
    dateISO: "2025-03-07",
    signupUrl: "/gigs/seattle-late-show",
    tags: ["booked", "paid"],
    isOpenMic: false
  },
  {
    id: "seattle-rain-city",
    title: "Rain City Mic Drop",
    venue: "Laughing Planet Basement",
    city: "Seattle, WA",
    dateISO: "2025-03-12",
    signupUrl: "/gigs/seattle-rain-city",
    tags: ["open mic"],
    isOpenMic: true
  },
  {
    id: "portland-bridge",
    title: "Bridge City Showcase",
    venue: "Helium Annex",
    city: "Portland, OR",
    dateISO: "2025-03-16",
    signupUrl: "/gigs/portland-bridge",
    tags: ["booked"],
    isOpenMic: false
  },
  {
    id: "portland-diy",
    title: "DIY Comedy Hang",
    venue: "The Fixin' To Patio",
    city: "Portland, OR",
    dateISO: "2025-03-20",
    signupUrl: "/gigs/portland-diy",
    tags: ["open mic"],
    isOpenMic: true
  }
];

export const profiles: ProfileSample[] = [
  {
    slug: "rayna-flores",
    displayName: "Rayna Flores",
    role: "comedian",
    city: "Olympia, WA",
    avatarUrl: dicebear("rayna-flores"),
    tagline: "Story-driven comic elevating PNW stages",
    bio: "Rayna is a storyteller and comedy producer who weaves heartfelt moments into punchy, crowd-pleasing sets.",
    experienceYears: 6,
    specialties: ["Storytelling", "Crowd work", "Hosting"],
    credits: ["PNW Comedy Festival", "Rain City Laughs Podcast"],
    upcomingShows: [
      { title: "Midnight Oil Showcase", dateISO: "2025-02-14", venue: "Obsidian Stage" },
      { title: "Backroom Banter", dateISO: "2025-03-02", venue: "Alma Mater Loft" }
    ],
    network: ["milo-kendrick", "gina-park"],
    website: "https://raynaflores.com",
    contactEmail: "rayna@funny.io"
  },
  {
    slug: "milo-kendrick",
    displayName: "Milo Kendrick",
    role: "comedian",
    city: "Tacoma, WA",
    avatarUrl: dicebear("milo-kendrick"),
    tagline: "High-energy joke writer with a love for tags",
    bio: "Milo's quick pacing and tightly crafted jokes have made him a regular feature in Tacoma's club circuit.",
    experienceYears: 4,
    specialties: ["One-liners", "Roast battles"],
    credits: ["Laugh Lab Roast Champion", "Late Night Northwest"],
    upcomingShows: [
      { title: "Sunday Sitdowns", dateISO: "2025-02-23", venue: "Blue Mouse Lounge" }
    ],
    network: ["rayna-flores", "olivia-rhodes"],
    website: "https://milokendrick.com",
    contactEmail: "booking@milokendrick.com"
  },
  {
    slug: "stage-one-theater",
    displayName: "Stage One Theater",
    role: "venue",
    city: "Olympia, WA",
    avatarUrl: dicebear("stage-one"),
    tagline: "Olympia's hub for live comedy and improv",
    bio: "Stage One is a 120-seat black box venue with full lighting, sound, and a deep bench of local comedy talent.",
    specialties: ["Showcase nights", "Improv jams", "Workshop series"],
    credits: ["Olympia Fringe Festival", "All City Comedy Finals"],
    upcomingShows: [
      { title: "Open Late Mic", dateISO: "2025-02-19", venue: "Stage One Theater" }
    ],
    network: ["rayna-flores", "gina-park"],
    website: "https://stageonetheater.com",
    contactEmail: "bookings@stageonetheater.com"
  },
  {
    slug: "laugh-lab-collective",
    displayName: "Laugh Lab Collective",
    role: "fan",
    city: "Seattle, WA",
    avatarUrl: dicebear("laugh-lab"),
    tagline: "Grassroots group amplifying indie comedy",
    bio: "Laugh Lab is a team of superfans who organize comedy field trips and highlight emerging performers online.",
    specialties: ["Street teams", "Social promotion"],
    credits: ["Seattle Comedy Week", "Bridge City Showcase"],
    network: ["rayna-flores", "stage-one-theater"],
    upcomingShows: [],
    website: "https://laughlabcollective.org",
    contactEmail: "hello@laughlabcollective.org"
  },
  {
    slug: "gina-park",
    displayName: "Gina Park",
    role: "comedian",
    city: "Seattle, WA",
    avatarUrl: dicebear("gina-park"),
    tagline: "Smart, sharp, and unapologetically nerdy",
    bio: "Gina blends tech world insights with razor-sharp satire, making her a favorite with festival crowds.",
    experienceYears: 5,
    specialties: ["Satire", "Corporate gigs", "Hosting"],
    credits: ["Geek Out Comedy Fest", "Tech Laughs Live"],
    upcomingShows: [
      { title: "Rain City Mic Drop", dateISO: "2025-03-12", venue: "Laughing Planet Basement" }
    ],
    network: ["rayna-flores", "stage-one-theater"],
    website: "https://ginaparkcomedy.com",
    contactEmail: "booking@ginaparkcomedy.com"
  },
  {
    slug: "bridge-city-comedy-club",
    displayName: "Bridge City Comedy Club",
    role: "venue",
    city: "Portland, OR",
    avatarUrl: dicebear("bridge-city"),
    tagline: "Independent venue spotlighting Pacific Northwest comics",
    bio: "Bridge City Comedy Club curates balanced lineups of regional favorites and up-and-coming voices.",
    specialties: ["Weekend showcases", "Festival previews"],
    credits: ["Portland Bridge Festival", "Cascadia Comedy Awards"],
    upcomingShows: [
      { title: "Bridge City Showcase", dateISO: "2025-03-16", venue: "Helium Annex" }
    ],
    network: ["olivia-rhodes", "tacoma-crowdwork-crew"],
    website: "https://bridgecitycomedy.club",
    contactEmail: "hello@bridgecitycomedy.club"
  },
  {
    slug: "tacoma-crowdwork-crew",
    displayName: "Tacoma Crowdwork Crew",
    role: "fan",
    city: "Tacoma, WA",
    avatarUrl: dicebear("tacoma-crowdwork"),
    tagline: "Volunteer hype squad for emerging Tacoma comics",
    bio: "The Crew records shows, clips highlights, and helps Tacoma comics build their digital presence.",
    specialties: ["Videography", "Social clips"],
    credits: ["South Sound Standup", "Tacoma Sunday Showcase"],
    network: ["milo-kendrick", "bridge-city-comedy-club"],
    upcomingShows: [],
    website: "https://tacomacrowdworkcrew.org",
    contactEmail: "crew@tacomacrowdwork.org"
  },
  {
    slug: "olivia-rhodes",
    displayName: "Olivia Rhodes",
    role: "comedian",
    city: "Portland, OR",
    avatarUrl: dicebear("olivia-rhodes"),
    tagline: "Deadpan storyteller with a love of weird history",
    bio: "Olivia pairs offbeat history deep-dives with dry wit, creating unforgettable long-form bits.",
    experienceYears: 7,
    specialties: ["Long-form storytelling", "Writing rooms"],
    credits: ["Cascadia Comedy Awards finalist", "History's Hysterics Podcast"],
    upcomingShows: [
      { title: "Bridge City Showcase", dateISO: "2025-03-16", venue: "Helium Annex" }
    ],
    network: ["milo-kendrick", "bridge-city-comedy-club"],
    website: "https://oliviarhodescomedy.com",
    contactEmail: "hello@oliviarhodescomedy.com"
  },
  {
    slug: "cascadia-booker-hub",
    displayName: "Cascadia Booker Hub",
    role: "fan",
    city: "Olympia, WA",
    avatarUrl: dicebear("cascadia-hub"),
    tagline: "Talent matchmakers connecting comics and stages",
    bio: "Cascadia Booker Hub helps match Pacific Northwest comics with venues looking to diversify their lineups.",
    specialties: ["Talent booking", "Workshops"],
    credits: ["Cascadia Comedy Awards", "Northwest Night Out"],
    network: ["rayna-flores", "bridge-city-comedy-club"],
    upcomingShows: [],
    website: "https://cascadiabookerhub.com",
    contactEmail: "team@cascadiabookerhub.com"
  }
];
