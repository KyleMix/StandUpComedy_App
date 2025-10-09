'use client';

import React, { useState, useEffect } from "react";
import { 
  Search, Mic2, MapPin, Star, CalendarDays, Ticket, Users, Building2,
  ArrowRight, Play, Sparkles, BadgeCheck, Laugh, ThumbsUp, Share2, Menu, X, ChevronDown,
  ExternalLink, Clock, CheckCircle2, AlertTriangle, Info
} from "lucide-react";

// NOTE: This single-file component showcases a mini design system + landing page for
// "The Funny" — a stand-up comedy networking site.
// It's built with React + Tailwind classes and light state. Drop into a Vite/Next app with Tailwind.
// All sections are optional; pick & choose as needed.

// Utility styles
const pill = "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm";
const btn = {
  base: "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 font-semibold transition active:scale-[.98]",
  primary: "bg-indigo-600 text-white hover:bg-indigo-700",
  secondary: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50",
  ghost: "text-indigo-700 hover:bg-indigo-50",
};

const badge = {
  base: "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  info: "bg-blue-50 text-blue-700",
  success: "bg-green-50 text-green-700",
  warn: "bg-amber-50 text-amber-700",
};

// Simple Tooltip
const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
  <span className="relative group">
    {children}
    <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs text-white opacity-0 shadow-md transition group-hover:opacity-100">
      {text}
    </span>
  </span>
);

// Skeleton Loader
const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

// Modal
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ open, onClose, title, children }: ModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button aria-label="Close" className="p-1" onClick={onClose}><X className="h-5 w-5"/></button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Accordion
const Accordion = ({ items }: { items: { q: string; a: string }[] }) => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-gray-200 rounded-2xl border">
      {items.map((it, i) => (
        <button key={i} className="w-full text-left" onClick={() => setOpen(open === i ? null : i)}>
          <div className="flex items-center justify-between p-4">
            <span className="font-medium">{it.q}</span>
            <ChevronDown className={`h-5 w-5 transition ${open===i?"rotate-180":""}`} />
          </div>
          <div className={`px-4 pb-4 text-gray-600 transition-[max-height] ${open===i?"max-h-40":"max-h-0 overflow-hidden"}`}>
            {it.a}
          </div>
        </button>
      ))}
    </div>
  );
};

// Progress
const Progress = ({ value }: { value: number }) => (
  <div className="h-2 w-full rounded-full bg-gray-200">
    <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${value}%` }} />
  </div>
);

// Chip
const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{children}</span>
);

// Card helpers
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${className}`}>{children}</div>
);

// Navbar
const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <a className="flex items-center gap-2" href="#home">
          <Laugh className="h-7 w-7 text-indigo-600"/>
          <span className="text-lg font-bold">The Funny</span>
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#gigs" className="text-sm text-gray-700 hover:text-gray-900">Gigs</a>
          <a href="#comedians" className="text-sm text-gray-700 hover:text-gray-900">Comedians</a>
          <a href="#shows" className="text-sm text-gray-700 hover:text-gray-900">Shows</a>
          <a href="#pricing" className="text-sm text-gray-700 hover:text-gray-900">Pricing</a>
          <a href="#faq" className="text-sm text-gray-700 hover:text-gray-900">FAQ</a>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <a className={`${btn.base} ${btn.ghost}`} href="#login">Log in</a>
          <a className={`${btn.base} ${btn.primary}`} href="#signup">Get Started</a>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
        </button>
      </div>
      {open && (
        <div className="border-t bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            <a href="#gigs">Gigs</a>
            <a href="#comedians">Comedians</a>
            <a href="#shows">Shows</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
            <div className="mt-2 flex gap-2">
              <a className={`${btn.base} ${btn.ghost} w-full`} href="#login">Log in</a>
              <a className={`${btn.base} ${btn.primary} w-full`} href="#signup">Get Started</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// Hero
const Hero = () => (
  <section id="home" className="relative overflow-hidden">
    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-pink-50"/>
    <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-16 pt-14 md:grid-cols-2">
      <div>
        <div className={`${pill} border-indigo-200 text-indigo-700 mb-4 bg-indigo-50`}>
          <Sparkles className="h-4 w-4"/> Find gigs. Get paid. Build your crowd.
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          The marketplace for <span className="text-indigo-600">stand‑up</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Comedians book shows. Venues and promoters post paid gigs. Fans discover nights out worth leaving the couch for.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a className={`${btn.base} ${btn.primary}`} href="#signup">Create free account <ArrowRight className="h-4 w-4"/></a>
          <a className={`${btn.base} ${btn.secondary}`} href="#demo"><Play className="h-4 w-4"/>Watch demo</a>
        </div>
        <div className="mt-6 flex items-center gap-3 text-sm text-gray-600">
          <BadgeCheck className="h-4 w-4 text-green-600"/> Verified venue & promoter accounts
        </div>
      </div>
      <div className="relative">
        <div className="relative rounded-3xl border bg-white p-4 shadow-xl">
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-2">
            <Search className="h-5 w-5 text-gray-500"/>
            <input className="w-full bg-transparent p-2 outline-none" placeholder="Search gigs, cities, comics…"/>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <Chip><Mic2 className="h-4 w-4"/> Open Mic+</Chip>
            <Chip><Ticket className="h-4 w-4"/> Paid Show</Chip>
            <Chip><Building2 className="h-4 w-4"/> Club</Chip>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Card>
              <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4"/> Seattle, WA</span>
                <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4"/> Fri • 8pm</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold">Capitol Laughs Showcase</h4>
                  <p className="text-sm text-gray-600">7–10 min spots • $50 + drink tickets</p>
                </div>
                <span className={`${badge.base} ${badge.success}`}><ThumbsUp className="h-3.5 w-3.5"/> Bookable</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500"><Star className="h-4 w-4 fill-current"/><Star className="h-4 w-4 fill-current"/><Star className="h-4 w-4 fill-current"/><Star className="h-4 w-4 fill-current"/><Star className="h-4 w-4"/></div>
                <button className={`${btn.base} ${btn.primary}`}>Submit avails</button>
              </div>
            </Card>
            <Card>
              <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
                <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4"/> Portland, OR</span>
                <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4"/> Sat • 9pm</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-semibold">Brewery Crowd‑Work Night</h4>
                  <p className="text-sm text-gray-600">5–7 min • Unpaid (video provided)</p>
                </div>
                <span className={`${badge.base} ${badge.info}`}><Info className="h-3.5 w-3.5"/> Tape Night</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500"><Star className="h-4 w-4 fill-current"/><Star className="h-4 w-4 fill-current"/><Star className="h-4 w-4 fill-current"/><Star className="h-4 w-4"/><Star className="h-4 w-4"/></div>
                <button className={`${btn.base} ${btn.secondary}`}>View details</button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Role Tabs + Search
const RoleSearch = () => {
  const [role, setRole] = useState<'comedian'|'venue'|'fan'>('comedian');
  return (
    <section className="mx-auto max-w-7xl px-4 py-12" id="gigs">
      <div className="mb-6 flex flex-wrap gap-2">
        {([
          { key:'comedian', label:'I\'m a Comedian', icon: <Mic2 className="h-4 w-4"/> },
          { key:'venue', label:'I\'m a Venue/Promoter', icon: <Building2 className="h-4 w-4"/> },
          { key:'fan', label:'I\'m a Fan', icon: <Users className="h-4 w-4"/> },
        ] as const).map(t => (
          <button key={t.key} onClick={()=>setRole(t.key)} className={`${pill} ${role===t.key?"bg-indigo-600 text-white border-indigo-600":"bg-white text-gray-700"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm md:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-xl bg-gray-50 p-2">
          <Search className="h-5 w-5 text-gray-500"/>
          <input className="w-full bg-transparent p-2 outline-none" placeholder={role==='comedian'?"Find paid gigs or open mics…":role==='venue'?"Search comedians by city, credits, style…":"Find shows by city or date…"}/>
        </div>
        <div className="grid grid-cols-2 gap-2 md:flex">
          <button className={`${btn.base} ${btn.secondary}`}>Filters</button>
          <button className={`${btn.base} ${btn.primary}`}>Search</button>
        </div>
      </div>

      {/* Results Examples */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card>
          <div className="mb-1 text-sm text-gray-500">Gig • Seattle, WA</div>
          <h4 className="font-semibold">Late Night at Beacon Club</h4>
          <p className="text-sm text-gray-600">10 min spots • $75 • Crowd 120–180</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-gray-500">Posts on Mondays</div>
            <button className={`${btn.base} ${btn.primary}`}>Submit avails</button>
          </div>
        </Card>
        <Card>
          <div className="mb-1 text-sm text-gray-500">Comedian • Portland, OR</div>
          <h4 className="font-semibold">Alex Rivera</h4>
          <div className="mt-1 flex flex-wrap gap-2 text-sm">
            <Chip>Storytelling</Chip><Chip>Clean</Chip><Chip>Clips 4K</Chip>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1 text-amber-500"><Star className="h-4 w-4 fill-current"/><Star className="h-4 w-4 fill-current"/><Star className="h-4 w-4 fill-current"/><Star className="h-4 w-4 fill-current"/><Star className="h-4 w-4"/></div>
            <a className={`${btn.base} ${btn.secondary}`} href="#">View profile</a>
          </div>
        </Card>
        <Card>
          <div className="mb-1 text-sm text-gray-500">Show • Olympia, WA</div>
          <h4 className="font-semibold">Stoned Goose Showcase</h4>
          <p className="text-sm text-gray-600">Saturday • 8pm • BeatDrop Kitchen</p>
          <div className="mt-3 flex items-center justify-between">
            <a className="text-sm text-indigo-700 hover:underline inline-flex items-center gap-1" href="#"><Ticket className="h-4 w-4"/> Get tickets</a>
            <a className={`${btn.base} ${btn.secondary}`} href="#">Details</a>
          </div>
        </Card>
      </div>
    </section>
  );
};

// Components Gallery (Buttons, Badges, Forms, Tooltips, Progress, Skeleton)
const ComponentsGallery = () => {
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(()=>{
    let id: ReturnType<typeof setInterval> | undefined;
    if (saving) {
      setProgress(0);
      id = setInterval(()=>{
        setProgress(p=>{
          const v = Math.min(p+7,100);
          if (v===100) setSaving(false);
          return v;
        });
      }, 200);
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [saving]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12" id="components">
      <h3 className="mb-6 text-2xl font-bold">UI Components</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h4 className="mb-3 font-semibold">Buttons</h4>
          <div className="flex flex-wrap gap-2">
            <button className={`${btn.base} ${btn.primary}`}><Ticket className="h-4 w-4"/> Primary</button>
            <button className={`${btn.base} ${btn.secondary}`}><Users className="h-4 w-4"/> Secondary</button>
            <button className={`${btn.base} ${btn.ghost}`}><Share2 className="h-4 w-4"/> Ghost</button>
          </div>
        </Card>
        <Card>
          <h4 className="mb-3 font-semibold">Badges & Chips</h4>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`${badge.base} ${badge.success}`}><CheckCircle2 className="h-3.5 w-3.5"/> Verified</span>
            <span className={`${badge.base} ${badge.info}`}><Info className="h-3.5 w-3.5"/> Tape Provided</span>
            <span className={`${badge.base} ${badge.warn}`}><AlertTriangle className="h-3.5 w-3.5"/> Blue Material</span>
            <Chip><Mic2 className="h-4 w-4"/> Crowd Work</Chip>
            <Chip><Clock className="h-4 w-4"/> 10 min</Chip>
          </div>
        </Card>
        <Card>
          <h4 className="mb-3 font-semibold">Form Inputs</h4>
          <form className="grid gap-3">
            <label className="text-sm">Show Title
              <input className="mt-1 w-full rounded-xl border p-2" placeholder="E.g., Friday Funnies"/>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">City
                <input className="mt-1 w-full rounded-xl border p-2" placeholder="Olympia"/>
              </label>
              <label className="text-sm">Date
                <input type="date" className="mt-1 w-full rounded-xl border p-2"/>
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox"/> Paid spot</label>
            <div className="flex gap-2">
              <Tooltip text="Save your draft">
                <button type="button" className={`${btn.base} ${btn.secondary}`} onClick={()=>setSaving(true)}>
                  Save Draft
                </button>
              </Tooltip>
              <button className={`${btn.base} ${btn.primary}`} type="button">Post Show</button>
            </div>
            <div className="mt-2">
              <Progress value={saving?progress:0}/>
              <div className="mt-1 text-xs text-gray-500">{saving?`Saving… ${progress}%`:""}</div>
            </div>
          </form>
        </Card>
        <Card>
          <h4 className="mb-3 font-semibold">Skeleton Loader</h4>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_,i)=> (
              <div key={i} className="rounded-2xl border p-3">
                <Skeleton className="h-24 w-full"/>
                <Skeleton className="mt-2 h-3 w-2/3"/>
                <Skeleton className="mt-2 h-3 w-1/2"/>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};

// Testimonials / Social Proof
const Testimonials = () => (
  <section className="mx-auto max-w-7xl px-4 py-12">
    <div className="mb-6 flex items-center justify-between">
      <h3 className="text-2xl font-bold">Loved by comics, venues & fans</h3>
      <a href="#" className="text-sm text-indigo-700 hover:underline">See all <ExternalLink className="ml-1 inline h-4 w-4"/></a>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {[
        { quote: "I booked my first paid weekend here.", name: "Rae P.", role: "Comedian"},
        { quote: "Easy to fill lineups with the right vibe.", name: "Beacon Club", role: "Venue"},
        { quote: "Found local shows every Friday!", name: "Sam T.", role: "Fan"},
      ].map((t, i)=> (
        <Card key={i}>
          <div className="mb-2 text-amber-500"><Star className="inline h-4 w-4 fill-current"/><Star className="inline h-4 w-4 fill-current"/><Star className="inline h-4 w-4 fill-current"/><Star className="inline h-4 w-4 fill-current"/><Star className="inline h-4 w-4"/></div>
          <p className="">“{t.quote}”</p>
          <div className="mt-3 text-sm text-gray-600">— {t.name}, {t.role}</div>
        </Card>
      ))}
    </div>
  </section>
);

// Pricing
const Pricing = () => (
  <section id="pricing" className="mx-auto max-w-7xl px-4 py-12">
    <h3 className="mb-6 text-2xl font-bold">Simple pricing</h3>
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="relative">
        <div className={`${badge.base} ${badge.info} absolute right-4 top-4`}>Starter</div>
        <h4 className="text-xl font-bold">Free</h4>
        <p className="text-gray-600">For fans & new comics</p>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          <li>• Find shows & open mics</li>
          <li>• Basic profile</li>
          <li>• 3 gig submissions / month</li>
        </ul>
        <a className={`${btn.base} ${btn.secondary} mt-4 w-full`} href="#signup">Get started</a>
      </Card>
      <Card className="relative border-indigo-600 shadow-md">
        <div className={`${badge.base} ${badge.success} absolute right-4 top-4`}>Most Popular</div>
        <h4 className="text-xl font-bold">Pro</h4>
        <p className="text-gray-600">For working comics</p>
        <div className="mt-2 text-3xl font-extrabold">$12<span className="text-base font-medium text-gray-500">/mo</span></div>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          <li>• Unlimited submissions</li>
          <li>• Reel & link hub</li>
          <li>• Avails calendar</li>
          <li>• Verified badge (reviewed)</li>
        </ul>
        <a className={`${btn.base} ${btn.primary} mt-4 w-full`} href="#signup">Upgrade</a>
      </Card>
      <Card className="relative">
        <div className={`${badge.base} ${badge.warn} absolute right-4 top-4`}>For venues</div>
        <h4 className="text-xl font-bold">Venue</h4>
        <p className="text-gray-600">For clubs & promoters</p>
        <div className="mt-2 text-3xl font-extrabold">$29<span className="text-base font-medium text-gray-500">/mo</span></div>
        <ul className="mt-4 space-y-2 text-sm text-gray-700">
          <li>• Post paid gigs & manage rosters</li>
          <li>• Shortlists & booking tools</li>
          <li>• Contract & payout helpers</li>
        </ul>
        <a className={`${btn.base} ${btn.secondary} mt-4 w-full`} href="#signup">Start trial</a>
      </Card>
    </div>
  </section>
);

// FAQ
const FAQ = () => (
  <section id="faq" className="mx-auto max-w-7xl px-4 py-12">
    <h3 className="mb-6 text-2xl font-bold">FAQ</h3>
    <Accordion
      items={[
        {
          q: "How do promoter/venue verifications work?",
          a: "We verify business details and a valid contact so comics know they&apos;re submitting to legit gigs."
        },
        { q: "Is there a fee to submit avails?", a: "Free plan includes 3 submissions/month; Pro unlocks unlimited." },
        {
          q: "Do you handle payments?",
          a: "Venues pay comics directly; we&apos;re rolling out optional escrow and invoice tools soon."
        }
      ]}
    />
  </section>
);

// CTA
const FinalCTA = () => (
  <section className="relative overflow-hidden">
    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-600 via-indigo-500 to-fuchsia-500"/>
    <div className="mx-auto max-w-7xl px-4 py-14 text-white">
      <h3 className="text-3xl font-extrabold">Ready to get funny?</h3>
      <p className="mt-2 max-w-2xl text-indigo-100">Join the network, post gigs, and fill rooms. It&apos;s free to start and takes 60 seconds.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a className={`${btn.base} bg-white text-gray-900`} href="#signup">Create free account</a>
        <a className={`${btn.base} ${btn.ghost} border border-white/30`} href="#demo">See how it works</a>
      </div>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="border-t bg-white">
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
      <div>
        <div className="mb-2 flex items-center gap-2"><Laugh className="h-6 w-6 text-indigo-600"/><span className="font-bold">The Funny</span></div>
        <p className="text-sm text-gray-600">A marketplace for stand‑up: gigs, comics, and shows—organized.</p>
      </div>
      <div>
        <h5 className="mb-2 font-semibold">Product</h5>
        <ul className="space-y-1 text-sm text-gray-600">
          <li><a href="#gigs" className="hover:text-gray-900">Gigs</a></li>
          <li><a href="#comedians" className="hover:text-gray-900">Comedians</a></li>
          <li><a href="#shows" className="hover:text-gray-900">Shows</a></li>
        </ul>
      </div>
      <div>
        <h5 className="mb-2 font-semibold">Company</h5>
        <ul className="space-y-1 text-sm text-gray-600">
          <li><a href="#" className="hover:text-gray-900">About</a></li>
          <li><a href="#" className="hover:text-gray-900">Press</a></li>
          <li><a href="#" className="hover:text-gray-900">Contact</a></li>
        </ul>
      </div>
      <div>
        <h5 className="mb-2 font-semibold">Legal</h5>
        <ul className="space-y-1 text-sm text-gray-600">
          <li><a href="#" className="hover:text-gray-900">Terms</a></li>
          <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t py-4 text-center text-xs text-gray-500">© {new Date().getFullYear()} The Funny. All rights reserved.</div>
  </footer>
);

export default function TheFunnyUIKit() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar/>
      <Hero/>
      <RoleSearch/>

      {/* Modal demo trigger */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <Card className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold">One‑click booking (demo)</h4>
            <p className="text-sm text-gray-600">Open a modal to see a compact booking flow.</p>
          </div>
          <button className={`${btn.base} ${btn.primary}`} onClick={()=>setShowModal(true)}>Open modal</button>
        </Card>
      </section>

      <ComponentsGallery/>
      <Testimonials/>
      <Pricing/>
      <FAQ/>
      <FinalCTA/>
      <Footer/>

      <Modal open={showModal} onClose={()=>setShowModal(false)} title="Book a spot">
        <div className="grid gap-3">
          <label className="text-sm">Preferred date
            <input type="date" className="mt-1 w-full rounded-xl border p-2"/>
          </label>
          <label className="text-sm">Set length
            <select className="mt-1 w-full rounded-xl border p-2">
              <option>5 minutes</option>
              <option>7 minutes</option>
              <option>10 minutes</option>
            </select>
          </label>
          <label className="text-sm">Notes
            <textarea className="mt-1 w-full rounded-xl border p-2" placeholder="Credits, clip links, etc."/>
          </label>
          <div className="mt-2 flex justify-end gap-2">
            <button className={`${btn.base} ${btn.secondary}`} onClick={()=>setShowModal(false)}>Cancel</button>
            <button className={`${btn.base} ${btn.primary}`} onClick={()=>setShowModal(false)}>Submit</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
