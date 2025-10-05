export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <span className="loading loading-dots loading-lg text-primary" aria-hidden="true" />
      <p className="text-sm text-base-content/70">Setting the stage…</p>
    </div>
  );
}
