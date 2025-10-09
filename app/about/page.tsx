import Link from "next/link";

const resourceSections = [
  {
    title: "Finding your voice",
    description: (
      <>
        Dive into memoirs and craft books like <em>Born Standing Up</em> by Steve Martin, <em>How to Be Funny</em> by Jon Macks, and
        <em>The Comic Toolbox</em> by John Vorhaus to explore joke mechanics, narrative framing, and the long game of honing a point of view.
      </>
    ),
    href: "https://bookshop.org/lists/stand-up-essentials",
    label: "Explore book list"
  },
  {
    title: "Listening lab",
    description: (
      <>
        Study the rhythm of stand-up with podcasts such as <em>Working It Out</em>, <em>Good One</em>, and <em>The Comedy Cellar: Live From the Table</em>.
        Pair episodes with classic specials to hear how sets evolve from idea to delivery.
      </>
    ),
    href: "https://open.spotify.com/playlist/5Wf8KSP7zYp4oKJ2JYQFy8",
    label: "Queue up episodes"
  },
  {
    title: "Stagecraft & business",
    description: (
      <>
        Bookmark newsletters like <em>Hot Breath!</em>, <em>Comedy Call Sheet</em>, and <em>Kill Tony Notes</em> for booking intel, networking tips, and production
        checklists that keep you ready for the next opportunity.
      </>
    ),
    href: "https://thehotbreathpodcast.com/",
    label: "Visit resource hub"
  }
] as const;

const roadmapSections = [
  {
    title: "Write & refine material",
    bullets: [
      {
        lead: "Build a writing habit:",
        copy: "Freewrite setups daily, tag the funniest angles, and test one new bit every mic to keep momentum."
      },
      {
        lead: "Workshop with peers:",
        copy: "Swap sets with trusted comics, track what lands, and punch up premises by asking ‘why now?’ and ‘why you?’."
      },
      {
        lead: "Record everything:",
        copy: "Audio from mics reveals pacing, filler words, and opportunities for callbacks you might miss onstage."
      }
    ]
  },
  {
    title: "Find stage time & book gigs",
    bullets: [
      {
        lead: "Start with open mics:",
        copy: "Build relationships with hosts, arrive early, and volunteer to support the room so you become a familiar face."
      },
      {
        lead: "Curate your reel:",
        copy: "Keep a two-minute clip and tight bio ready for submission pages, festival applications, and cold emails."
      },
      {
        lead: "Track outreach:",
        copy: "Maintain a simple CRM for rooms, producers, and fellow comics so follow-ups stay timely and respectful."
      }
    ]
  },
  {
    title: "Practice pro etiquette",
    bullets: [
      {
        lead: "Respect the room:",
        copy: "Know the show format, stick to your time, and thank staff and producers—consistency builds trust."
      },
      {
        lead: "Be a solid hang:",
        copy: "Listen more than you pitch, support other comics, and keep backstage chatter positive and inclusive."
      },
      {
        lead: "Handle business cleanly:",
        copy: "Confirm details in writing, invoice promptly, and promote the show on your socials to signal you’re a collaborative partner."
      }
    ]
  }
] as const;

export default function AboutPage() {
  return (
    <div className="space-y-14">
      <header className="space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary">About</p>
        <h1 className="text-4xl font-manrope">What is The Funny?</h1>
        <p className="text-base text-base-content/70">
          The Funny is a community-powered launchpad for comedians, producers, and fans shaping the next wave of stand-up. We curate knowledge,
          opportunities, and connections so every comic can find their voice and every audience can discover a new favorite.
        </p>
      </header>

      <section className="card border border-base-300 bg-base-200/40">
        <div className="card-body space-y-4">
          <h2 className="text-2xl font-manrope">Mission: Fuel the funny</h2>
          <p className="text-base text-base-content/70">
            We believe the funniest stages are the ones filled with bold, prepared, and generous comics. The Funny exists to make stand-up more
            accessible by demystifying the craft, surfacing transparent booking paths, and celebrating the etiquette that keeps rooms welcoming.
            Our hope is to help comics experiment fearlessly, producers collaborate openly, and fans feel close to the magic of live comedy.
          </p>
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-3">
          <h2 className="text-2xl font-manrope">Recommended reading &amp; listening</h2>
          <p className="text-sm text-base-content/70">
            Curated resources to deepen your comedic toolkit—from joke structure to the business of booking.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {resourceSections.map((resource) => (
            <article key={resource.title} className="card h-full border border-base-300 bg-base-100/80">
              <div className="card-body flex h-full flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-manrope capitalize">{resource.title}</h3>
                  <p className="text-sm text-base-content/70">{resource.description}</p>
                </div>
                <a
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80"
                  href={resource.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {resource.label}
                  <span aria-hidden>→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-3">
          <h2 className="text-2xl font-manrope">How to break into stand-up</h2>
          <p className="text-sm text-base-content/70">
            Your roadmap from first joke to building a sustainable career—crafted with insights from comics, producers, and festival bookers across
            the Pacific Northwest.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {roadmapSections.map((section) => (
            <article key={section.title} className="card border border-base-300 bg-base-200/50">
              <div className="card-body space-y-4">
                <h3 className="text-lg font-manrope">{section.title}</h3>
                <ul className="space-y-3 text-sm text-base-content/70">
                  {section.bullets.map((bullet) => (
                    <li key={bullet.lead}>
                      <span className="font-semibold text-base-content">{bullet.lead}</span> {bullet.copy}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card border border-dashed border-primary/40 bg-primary/10">
        <div className="card-body items-center space-y-4 text-center">
          <h2 className="text-2xl font-manrope">Share what you’re learning</h2>
          <p className="text-sm text-base-content/70">
            Have a must-read newsletter, a go-to writing exercise, or a booking story that could help another comic? Drop it in our community forum
            so we can amplify the wisdom.
          </p>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-primary bg-primary px-5 py-2 text-sm font-semibold text-primary-content transition hover:bg-primary/90"
            href="/profiles"
          >
            Join the conversation
          </Link>
        </div>
      </section>
    </div>
  );
}
