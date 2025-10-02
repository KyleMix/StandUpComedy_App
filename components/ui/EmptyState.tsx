import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  message: string;
  illustration: string;
  actions?: ReactNode;
  className?: string;
}

export function EmptyState({ title, message, illustration, actions, className }: EmptyStateProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-dashed border-slate-200 bg-white p-10", className)}>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600">{message}</p>
          {actions}
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <Image
            src={`/assets/illustrations/${illustration}`}
            alt=""
            width={480}
            height={360}
            className="h-auto w-full"
            priority={false}
          />
        </div>
      </div>
    </div>
  );
}
