import Image from "next/image";
import Link from "next/link";

import { listActiveAdSlots } from "@/lib/ads";
import { cn } from "@/lib/utils";
import type { AdSlotPlacement, AdSlotPage } from "@/types/database";

interface AdSlotProps {
  page: AdSlotPage;
  placement: AdSlotPlacement;
  className?: string;
}

function renderSlotContent(slot: Awaited<ReturnType<typeof listActiveAdSlots>>[number]) {
  if (slot.html) {
    return (
      <div
        className="prose prose-sm max-w-none text-base-content"
        dangerouslySetInnerHTML={{ __html: slot.html }}
      />
    );
  }

  const image = slot.imageUrl ? (
    <Image
      src={slot.imageUrl}
      alt="Advertisement"
      width={600}
      height={400}
      unoptimized
      className="h-auto w-full rounded-lg"
    />
  ) : null;

  if (slot.linkUrl) {
    const content = image ?? (
      <span className="text-sm font-medium text-brand">{slot.linkUrl}</span>
    );
    return (
      <Link
        href={slot.linkUrl}
        target="_blank"
        rel="noreferrer"
        className="flex flex-col items-center gap-3 text-center"
      >
        {content}
      </Link>
    );
  }

  return image ?? (
    <p className="text-sm text-base-content/70">Promote your next show with The Funny.</p>
  );
}

export default async function AdSlot({ page, placement, className }: AdSlotProps) {
  const slots = await listActiveAdSlots(page, placement);

  if (slots.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)} aria-label="Sponsored content">
      {slots.map((slot) => (
        <div
          key={slot.id}
          className="rounded-2xl border border-base-300 bg-white/90 p-4 shadow-sm"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">
            Sponsored
          </p>
          {renderSlotContent(slot)}
        </div>
      ))}
    </div>
  );
}
