import React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default"
}: {
  children: React.ReactNode;
  variant?: "default" | "outline";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" ? "bg-brand/10 text-brand" : "border border-slate-200 text-slate-700"
      )}
    >
      {children}
    </span>
  );
}
