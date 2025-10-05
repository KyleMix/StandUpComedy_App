const libraries = [
  {
    name: "Next.js",
    description: "React framework for the app router experience.",
    license: "MIT License"
  },
  {
    name: "Tailwind CSS",
    description: "Utility-first CSS framework powering layout and spacing.",
    license: "MIT License"
  },
  {
    name: "daisyUI",
    description: "Tailwind component library used for cards, buttons, and navigation.",
    license: "MIT License"
  },
  {
    name: "Heroicons",
    description: "Outline icons for navigation controls and actions.",
    license: "MIT License"
  },
  {
    name: "Lucide",
    description: "Line icons for gig and profile metadata.",
    license: "ISC License"
  },
  {
    name: "@fontsource",
    description: "Self-hosted Inter and Manrope font families.",
    license: "MIT License"
  }
] as const;

export default function CreditsPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3 text-center lg:text-left">
        <h1 className="text-4xl font-manrope">Credits &amp; Licenses</h1>
        <p className="text-base text-base-content/70">
          Tools, libraries, and creative assets that help The Funny shine.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {libraries.map((library) => (
          <article key={library.name} className="rounded-2xl border border-base-300 bg-base-200/40 p-6">
            <h2 className="text-xl font-manrope">{library.name}</h2>
            <p className="mt-2 text-sm text-base-content/70">{library.description}</p>
            <p className="mt-4 inline-flex rounded-full bg-base-300/30 px-3 py-1 text-xs uppercase tracking-wide text-base-content/60">
              {library.license}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-warning/40 bg-warning/10 p-6">
        <h2 className="text-lg font-manrope">Usage reminder</h2>
        <p className="mt-3 text-sm text-warning-content/80">
          Always review third-party licenses and verify usage rights before launching commercial campaigns or paid experiences.
          When in doubt, reach out to the original creators.
        </p>
      </section>
    </div>
  );
}
