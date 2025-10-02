"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FormState {
  search: string;
  city: string;
  state: string;
}

const INITIAL_STATE: FormState = {
  search: "",
  city: "",
  state: ""
};

export function GigFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [formState, setFormState] = useState<FormState>(INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";
    const currentCity = searchParams.get("city") ?? "";
    const currentState = searchParams.get("state") ?? "";

    setFormState({
      search: currentSearch,
      city: currentCity,
      state: currentState
    });
  }, [searchParams]);

  function updateQuery(params: FormState) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("page");

    const trimmedSearch = params.search.trim();
    const trimmedCity = params.city.trim();
    const upperState = params.state.trim().toUpperCase();

    if (trimmedSearch) {
      next.set("search", trimmedSearch);
    } else {
      next.delete("search");
    }

    if (trimmedCity) {
      next.set("city", trimmedCity);
    } else {
      next.delete("city");
    }

    if (upperState) {
      next.set("state", upperState);
    } else {
      next.delete("state");
    }

    const queryString = next.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;

    startTransition(() => {
      router.push(url);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQuery(formState);
  }

  function handleReset() {
    setFormState(INITIAL_STATE);
    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_80px_auto]">
        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Search gigs</span>
          <Input
            value={formState.search}
            onChange={(event) => setFormState((state) => ({ ...state, search: event.target.value }))}
            placeholder="Search by title or description"
            aria-label="Search gigs"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">City</span>
          <Input
            value={formState.city}
            onChange={(event) => setFormState((state) => ({ ...state, city: event.target.value }))}
            placeholder="e.g. Chicago"
            aria-label="City"
          />
        </label>
        <label className="space-y-1 text-sm font-medium text-slate-700">
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">State</span>
          <Input
            value={formState.state}
            onChange={(event) =>
              setFormState((state) => ({ ...state, state: event.target.value.toUpperCase() }))
            }
            placeholder="IL"
            aria-label="State"
            maxLength={2}
          />
        </label>
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
            Apply
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full md:w-auto"
            onClick={handleReset}
            disabled={isPending}
          >
            Reset
          </Button>
        </div>
      </div>
    </form>
  );
}
