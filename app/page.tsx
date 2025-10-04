const sections = [
  {
    title: "Plan shows together",
    description:
      "Collect details about rooms, lineups, and schedules in one shared workspace so everyone knows what happens next.",
  },
  {
    title: "Keep responsibilities clear",
    description:
      "Outline who is booking, who is promoting, and what each night requires without getting lost in extra features.",
  },
  {
    title: "Grow when you are ready",
    description:
      "This foundation keeps the essentials in view. Add the pieces you need later without rebuilding from scratch.",
  },
];

export default function LandingPage() {
  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Skeleton</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">the-funny workspace</h1>
        <p className="max-w-2xl text-base text-slate-600">
          A clean outline for connecting comedians, promoters, and venues. Start here, agree on the essentials, and layer in
          more when the structure feels right.
        </p>
      </section>

      <section className="grid gap-8 sm:grid-cols-2">
        {sections.map((section) => (
          <article key={section.title} className="space-y-3 rounded-lg border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-900">{section.title}</h2>
            <p className="text-sm text-slate-600">{section.description}</p>
          </article>
        ))}
      </section>

      <section className="space-y-4 rounded-lg border border-dashed border-slate-200 p-6 text-sm text-slate-600">
        <h2 className="text-base font-medium text-slate-900">What happens next?</h2>
        <p>
          Document your workflow, invite collaborators, and decide which tools belong here. This version keeps only the
          backbone so that future layers are intentional.
        </p>
      </section>
    </div>
  );
}
