"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CLEAN_RATING_OPTIONS = [
  { value: "", label: "All ratings" },
  { value: "CLEAN", label: "Clean" },
  { value: "PG13", label: "PG-13" },
  { value: "R", label: "R-rated" },
] as const;

const SORT_OPTIONS = [
  { value: "rating", label: "Top rated" },
  { value: "distance", label: "Closest first" },
  { value: "responsiveness", label: "Most responsive" },
  { value: "premium", label: "Premium spotlight" },
] as const;

interface ComedianFiltersProps {
  initialValues: {
    search: string;
    city: string;
    state: string;
    cleanRating: string;
    rateMin: string;
    rateMax: string;
    minExperience: string;
    styles: string[];
    sort: (typeof SORT_OPTIONS)[number]["value"];
  };
  searchParamsString: string;
}

type FormValues = ComedianFiltersProps["initialValues"];

type FormState = FormValues & {
  styleDraft: string;
};

const INITIAL_STATE: FormState = {
  search: "",
  city: "",
  state: "",
  cleanRating: "",
  rateMin: "",
  rateMax: "",
  minExperience: "",
  styles: [],
  sort: "rating",
  styleDraft: "",
};

export function ComedianFilters({ initialValues, searchParamsString }: ComedianFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [formState, setFormState] = useState<FormState>({ ...INITIAL_STATE, ...initialValues, styleDraft: "" });
  const [currentSearchParams, setCurrentSearchParams] = useState(searchParamsString);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFormState({ ...INITIAL_STATE, ...initialValues, styleDraft: "" });
  }, [initialValues]);

  useEffect(() => {
    setCurrentSearchParams(searchParamsString);
  }, [searchParamsString]);

  function updateQuery(params: FormState) {
    const next = new URLSearchParams(currentSearchParams);
    next.delete("page");

    const trimmedSearch = params.search.trim();
    if (trimmedSearch) {
      next.set("search", trimmedSearch);
    } else {
      next.delete("search");
    }

    const trimmedCity = params.city.trim();
    if (trimmedCity) {
      next.set("city", trimmedCity);
    } else {
      next.delete("city");
    }

    const stateValue = params.state.trim().toUpperCase();
    if (stateValue) {
      next.set("state", stateValue);
    } else {
      next.delete("state");
    }

    if (params.cleanRating) {
      next.set("cleanRating", params.cleanRating);
    } else {
      next.delete("cleanRating");
    }

    const rateMinValue = params.rateMin.trim();
    if (rateMinValue) {
      next.set("rateMin", rateMinValue);
    } else {
      next.delete("rateMin");
    }

    const rateMaxValue = params.rateMax.trim();
    if (rateMaxValue) {
      next.set("rateMax", rateMaxValue);
    } else {
      next.delete("rateMax");
    }

    const minExperienceValue = params.minExperience.trim();
    if (minExperienceValue) {
      next.set("minExperience", minExperienceValue);
    } else {
      next.delete("minExperience");
    }

    next.delete("styles");
    params.styles
      .map((style) => style.trim())
      .filter((style) => style.length > 0)
      .forEach((style) => next.append("styles", style));

    if (params.sort && params.sort !== "rating") {
      next.set("sort", params.sort);
    } else {
      next.delete("sort");
    }

    const queryString = next.toString();
    setCurrentSearchParams(queryString);

    startTransition(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQuery(formState);
  }

  function handleReset() {
    setFormState(INITIAL_STATE);
    setCurrentSearchParams("");
    startTransition(() => {
      router.push(pathname);
    });
  }

  function handleStyleAdd() {
    const draft = formState.styleDraft.trim();
    if (!draft) return;
    setFormState((state) => {
      if (state.styles.some((style) => style.toLowerCase() === draft.toLowerCase())) {
        return { ...state, styleDraft: "" };
      }
      return { ...state, styles: [...state.styles, draft], styleDraft: "" };
    });
  }

  function handleStyleRemove(style: string) {
    setFormState((state) => ({
      ...state,
      styles: state.styles.filter((current) => current !== style),
    }));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-base-300 bg-base-200/40 p-6 shadow-sm"
      aria-label="Comedian search filters"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]">
        <label className="flex flex-col gap-2 text-sm font-medium text-base-content/80">
          <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">Search</span>
          <Input
            value={formState.search}
            onChange={(event) => setFormState((state) => ({ ...state, search: event.target.value }))}
            placeholder="Name, style, or credit"
            aria-label="Search comedians"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-base-content/80">
          <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">City</span>
          <Input
            value={formState.city}
            onChange={(event) => setFormState((state) => ({ ...state, city: event.target.value }))}
            placeholder="e.g. Chicago"
            aria-label="Filter by city"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-base-content/80">
          <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">State</span>
          <Input
            value={formState.state}
            onChange={(event) =>
              setFormState((state) => ({ ...state, state: event.target.value.toUpperCase() }))
            }
            placeholder="IL"
            aria-label="Filter by state"
            maxLength={2}
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-base-content/80">
          <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">Clean rating</span>
          <select
            value={formState.cleanRating}
            onChange={(event) =>
              setFormState((state) => ({ ...state, cleanRating: event.target.value }))
            }
            className="select select-bordered h-10 min-h-0 bg-base-100"
            aria-label="Filter by cleanliness"
          >
            {CLEAN_RATING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-base-content/80">
          <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">Sort by</span>
          <select
            value={formState.sort}
            onChange={(event) =>
              setFormState((state) => ({ ...state, sort: event.target.value as FormState["sort"] }))
            }
            className="select select-bordered h-10 min-h-0 bg-base-100"
            aria-label="Sort comedians"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
        <label className="flex flex-col gap-2 text-sm font-medium text-base-content/80">
          <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">Min rate</span>
          <Input
            value={formState.rateMin}
            onChange={(event) => setFormState((state) => ({ ...state, rateMin: event.target.value }))}
            placeholder="100"
            inputMode="numeric"
            aria-label="Minimum rate"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-base-content/80">
          <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">Max rate</span>
          <Input
            value={formState.rateMax}
            onChange={(event) => setFormState((state) => ({ ...state, rateMax: event.target.value }))}
            placeholder="500"
            inputMode="numeric"
            aria-label="Maximum rate"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-base-content/80">
          <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">Experience</span>
          <Input
            value={formState.minExperience}
            onChange={(event) => setFormState((state) => ({ ...state, minExperience: event.target.value }))}
            placeholder="Years"
            inputMode="numeric"
            aria-label="Minimum years of experience"
          />
        </label>
        <div className="flex flex-col gap-2 text-sm font-medium text-base-content/80">
          <span className="text-xs font-semibold uppercase tracking-wide text-base-content/60">Comedy styles</span>
          <div className="flex gap-2">
            <Input
              value={formState.styleDraft}
              onChange={(event) => setFormState((state) => ({ ...state, styleDraft: event.target.value }))}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleStyleAdd();
                }
              }}
              placeholder="Add a style"
              aria-label="Add comedy style"
            />
            <Button type="button" variant="outline" onClick={handleStyleAdd} disabled={isPending}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formState.styles.length === 0 && (
              <span className="text-xs text-base-content/60">No styles selected</span>
            )}
            {formState.styles.map((style) => (
              <Badge key={style} variant="outline" className="gap-1">
                {style}
                <button
                  type="button"
                  onClick={() => handleStyleRemove(style)}
                  className="ml-1 rounded-full bg-base-300/60 px-1 text-[10px] uppercase tracking-wide text-base-content/70"
                  aria-label={`Remove ${style}`}
                  disabled={isPending}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          Apply filters
        </Button>
        <Button type="button" variant="outline" onClick={handleReset} disabled={isPending}>
          Reset
        </Button>
      </div>
    </form>
  );
}

