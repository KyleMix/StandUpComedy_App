import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "@/components/ads/AdSlot";
import { searchComedians, type ComedianSearchFilters } from "@/lib/dataStore";
import { comedianSearchFiltersSchema } from "@/lib/zodSchemas";
import { ComedianFilters } from "./ComedianFilters";
import { ComedianResultCard } from "./ComedianResultCard";

export const metadata: Metadata = {
  title: "Find comedians",
  description: "Search comedians by style, location, and responsiveness to find the right fit for your show.",
};

const DEFAULT_PAGE_SIZE = 12;

function toSearchParams(input: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry != null) params.append(key, entry);
      });
    } else if (value != null) {
      params.append(key, value);
    }
  }
  return params;
}

function parseFilters(searchParams: Record<string, string | string[] | undefined>) {
  const params = toSearchParams(searchParams);
  const styles = params
    .getAll("styles")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  const parsed = comedianSearchFiltersSchema.safeParse({
    search: params.get("search") ?? undefined,
    city: params.get("city") ?? undefined,
    state: params.get("state") ?? undefined,
    styles: styles.length > 0 ? styles : undefined,
    cleanRating: params.get("cleanRating") ?? undefined,
    rateMin: params.get("rateMin") ?? undefined,
    rateMax: params.get("rateMax") ?? undefined,
    minExperience: params.get("minExperience") ?? undefined,
    sort: params.get("sort") ?? undefined,
    page: params.get("page") ?? undefined,
  });

  if (!parsed.success) {
    return {
      filters: {
        page: 1,
        sort: "rating",
        styles: [] as string[],
      } as ComedianSearchFilters,
      searchParams,
      searchParamsString: params.toString(),
    };
  }

  const data = parsed.data;
  return {
    filters: {
      search: data.search,
      city: data.city,
      state: data.state,
      styles: data.styles ?? [],
      cleanRating: data.cleanRating,
      rateMin: data.rateMin,
      rateMax: data.rateMax,
      minExperienceYears: data.minExperience,
      sort: data.sort,
      page: data.page,
    } satisfies ComedianSearchFilters,
    searchParams,
    searchParamsString: params.toString(),
  };
}

function createPageHref(
  searchParams: Record<string, string | string[] | undefined>,
  targetPage: number
) {
  const params = toSearchParams(searchParams);
  params.delete("page");
  if (targetPage > 1) {
    params.set("page", String(targetPage));
  }
  const query = params.toString();
  return query ? `/profiles?${query}` : `/profiles`;
}

function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (totalPages <= 1) return null;

  const previousPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-base-300 bg-base-200/40 p-4 text-sm"
    >
      <span className="text-base-content/70">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        {previousPage ? (
          <Link href={createPageHref(searchParams, previousPage)} className="btn btn-outline btn-sm">
            Previous
          </Link>
        ) : (
          <span className="btn btn-outline btn-sm btn-disabled">Previous</span>
        )}
        {nextPage ? (
          <Link href={createPageHref(searchParams, nextPage)} className="btn btn-outline btn-sm">
            Next
          </Link>
        ) : (
          <span className="btn btn-outline btn-sm btn-disabled">Next</span>
        )}
      </div>
    </nav>
  );
}

interface ProfilesPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function ProfilesPage({ searchParams }: ProfilesPageProps) {
  const { filters, searchParamsString } = parseFilters(searchParams);
  const result = await searchComedians({ ...filters, pageSize: DEFAULT_PAGE_SIZE });

  if (result.page > 1 && result.items.length === 0) {
    notFound();
  }

  const startIndex = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const endIndex = result.total === 0 ? 0 : startIndex + result.items.length - 1;
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  const initialValues = {
    search: filters.search ?? "",
    city: filters.city ?? "",
    state: filters.state ?? "",
    cleanRating: filters.cleanRating ?? "",
    rateMin: filters.rateMin != null ? String(filters.rateMin) : "",
    rateMax: filters.rateMax != null ? String(filters.rateMax) : "",
    minExperience: filters.minExperienceYears != null ? String(filters.minExperienceYears) : "",
    styles: filters.styles ?? [],
    sort: filters.sort ?? "rating",
  };

  return (
    <div className="space-y-8">
      <AdSlot page="search" placement="top" />
      <header className="space-y-3 text-center lg:text-left">
        <h1 className="text-4xl font-manrope">Discover the right comic for your stage</h1>
        <p className="text-base text-base-content/70">
          Filter comedians by location, clean rating, price range, and responsiveness to build a reliable lineup.
        </p>
      </header>

      <ComedianFilters initialValues={initialValues} searchParamsString={searchParamsString} />

      <section aria-live="polite" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-base-content/70">
          <span>
            Showing {result.items.length === 0 ? 0 : `${startIndex}-${endIndex}`} of {result.total} comedian
            {result.total === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {result.items.map((item) => (
            <ComedianResultCard key={item.profile.userId} item={item} />
          ))}
          <AdSlot page="search" placement="inline" className="lg:col-span-2" />
        </div>

        {result.items.length === 0 && (
          <div className="alert alert-info">
            <span>No comedians match those filters yet—try widening your search.</span>
          </div>
        )}
      </section>

      <Pagination currentPage={result.page} totalPages={totalPages} searchParams={searchParams} />
    </div>
  );
}

