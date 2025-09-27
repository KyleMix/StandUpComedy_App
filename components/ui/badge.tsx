import React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  className
}: {
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" ? "bg-brand/10 text-brand" : "border border-slate-200 text-slate-700",
        className
      )}
    >
      {children}
    </span>
  );
}
