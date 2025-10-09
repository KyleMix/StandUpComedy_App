import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { listAllAdSlots, updateAdSlot } from "@/lib/ads";
import {
  listUsers,
  listGigs,
  listGigMetrics,
  listAllReviews,
  listFeatureFlags as loadFeatureFlags,
  listVerificationRequests,
  setFeatureFlag,
  setReviewVisibility,
  setUserPremium,
} from "@/lib/dataStore";
import type { Review, User } from "@/lib/dataStore";
import type { FeatureFlagKey } from "@/lib/config/flags";
import { FEATURE_FLAG_METADATA } from "@/lib/config/flags";
import { rateLimit } from "@/lib/rateLimit";
import { premiumToggleSchema, featureFlagToggleSchema } from "@/lib/zodSchemas";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const TABS = [
  { id: "users", label: "Users" },
  { id: "gigs", label: "Gigs" },
  { id: "reviews", label: "Reviews" },
  { id: "ads", label: "Ad Slots" },
  { id: "flags", label: "Feature Flags" },
] as const;

const FEATURE_FLAG_KEYS = ["premiumBoost", "premiumEarlyApply", "adsEnabled"] as const satisfies readonly FeatureFlagKey[];

type TabId = (typeof TABS)[number]["id"];

type AdminPageProps = {
  searchParams?: {
    tab?: string;
  };
};

function isTabId(value: string | undefined | null): value is TabId {
  return TABS.some((tab) => tab.id === value);
}

function isFeatureFlagKey(value: FormDataEntryValue | null): value is FeatureFlagKey {
  return typeof value === "string" && (FEATURE_FLAG_KEYS as readonly string[]).includes(value);
}

function formatDateTime(date: Date): string {
  return DATE_TIME_FORMATTER.format(date);
}

function formatRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
}

async function toggleUserPremiumAction(formData: FormData) {
  "use server";

  const tab = typeof formData.get("tab") === "string" ? (formData.get("tab") as string) : "users";

  const session = await requireAdmin();

  if (!rateLimit(`admin:premium-toggle:${session.user.id}`)) {
    redirect(`/admin?tab=${tab}`);
  }

  const payload = {
    userId: typeof formData.get("id") === "string" ? (formData.get("id") as string) : "",
    enabled: formData.get("enabled") === "true",
  };

  const parsed = premiumToggleSchema.safeParse(payload);
  if (!parsed.success) {
    redirect(`/admin?tab=${tab}`);
  }

  await setUserPremium(parsed.data.userId, parsed.data.enabled);
  revalidatePath("/admin");
  redirect(`/admin?tab=${tab}`);
}

async function toggleReviewVisibilityAction(formData: FormData) {
  "use server";

  await requireAdmin();

  const reviewId = formData.get("id");
  const visible = formData.get("visible") === "true";
  const tab = typeof formData.get("tab") === "string" ? (formData.get("tab") as string) : "reviews";

  if (typeof reviewId !== "string" || reviewId.length === 0) {
    redirect(`/admin?tab=${tab}`);
  }

  await setReviewVisibility(reviewId, visible);
  revalidatePath("/admin");
  redirect(`/admin?tab=${tab}`);
}

async function toggleAdSlotAction(formData: FormData) {
  "use server";

  const tab = typeof formData.get("tab") === "string" ? (formData.get("tab") as string) : "ads";

  const session = await requireAdmin();

  if (!rateLimit(`ads:toggle:${session.user.id}`)) {
    redirect(`/admin?tab=${tab}`);
  }

  const slotId = formData.get("id");
  const active = formData.get("active") === "true";

  if (typeof slotId !== "string" || slotId.length === 0) {
    redirect(`/admin?tab=${tab}`);
  }

  await updateAdSlot(slotId, { active });
  revalidatePath("/admin");
  redirect(`/admin?tab=${tab}`);
}

async function toggleFeatureFlagAction(formData: FormData) {
  "use server";

  const key = formData.get("key");
  const enabled = formData.get("enabled") === "true";
  const tab = typeof formData.get("tab") === "string" ? (formData.get("tab") as string) : "flags";

  const session = await requireAdmin();

  if (!rateLimit(`admin:flag-toggle:${session.user.id}`)) {
    redirect(`/admin?tab=${tab}`);
  }

  const payload = {
    key: typeof key === "string" ? key : "",
    enabled,
  };

  const parsed = featureFlagToggleSchema.safeParse(payload);
  if (!parsed.success || !isFeatureFlagKey(parsed.data.key)) {
    redirect(`/admin?tab=${tab}`);
  }

  await setFeatureFlag(parsed.data.key, parsed.data.enabled);
  revalidatePath("/admin");
  redirect(`/admin?tab=${tab}`);
}

function sortUsers(users: User[]): User[] {
  return [...users].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function summarizeReviews(reviews: Review[]): { total: number; hidden: number } {
  const total = reviews.length;
  const hidden = reviews.filter((review) => !review.visible).length;
  return { total, hidden };
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const activeTab = isTabId(searchParams?.tab) ? (searchParams!.tab as TabId) : "users";

  const [users, gigs, gigMetrics, reviews, adSlots, featureFlags, verificationRequests] = await Promise.all([
    listUsers(),
    listGigs({ orderByDateStart: "desc" }),
    listGigMetrics(),
    listAllReviews(),
    listAllAdSlots(),
    loadFeatureFlags(),
    listVerificationRequests({ orderBy: { createdAt: "desc" } }),
  ]);

  const userById = new Map(users.map((user) => [user.id, user]));
  const pendingRequests = verificationRequests.filter((request) => request.status === "PENDING");
  const sortedUsers = sortUsers(users);
  const latestGigs = gigs.slice(0, 20);
  const metricsByGig = new Map(gigMetrics.map((metric) => [metric.gigId, metric]));
  const latestGigRows = latestGigs.map((gig) => ({ gig, metrics: metricsByGig.get(gig.id) ?? null }));
  const latestReviews = reviews.slice(0, 20);
  const reviewSummary = summarizeReviews(reviews);

  const now = new Date();
  const gigTotals = {
    total: gigs.length,
    published: gigs.filter((gig) => gig.isPublished).length,
    drafts: gigs.filter((gig) => !gig.isPublished).length,
    upcoming: gigs.filter((gig) => gig.dateStart.getTime() > now.getTime()).length,
  };
  const metricsTotals = gigMetrics.reduce(
    (acc, metric) => {
      acc.totalApplications += metric.totalApplications;
      acc.pendingApplications += metric.pendingApplications;
      acc.favorites += metric.favorites;
      acc.bookings += metric.bookings;
      return acc;
    },
    { totalApplications: 0, pendingApplications: 0, favorites: 0, bookings: 0 }
  );

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Admin console</h1>
        <p className="text-sm text-slate-600">
          Manage premium access, feature flags, reviews, and monetisation tools from a single dashboard.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Link
              key={tab.id}
              href={`/admin?tab=${tab.id}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {activeTab === "users" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle>Users</CardTitle>
              <p className="text-sm text-slate-600">
                {sortedUsers.length} accounts • {sortedUsers.filter((user) => user.isPremium).length} premium
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Role</TableHeaderCell>
                    <TableHeaderCell>Premium</TableHeaderCell>
                    <TableHeaderCell>Joined</TableHeaderCell>
                    <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name ?? user.email}</TableCell>
                      <TableCell className="text-slate-600">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.isPremium ? <Badge className="bg-amber-500 text-white">Premium</Badge> : <span>-</span>}
                      </TableCell>
                      <TableCell className="text-slate-500">{formatDateTime(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <form action={toggleUserPremiumAction} className="inline-flex">
                          <input type="hidden" name="id" value={user.id} />
                          <input type="hidden" name="tab" value="users" />
                          <input type="hidden" name="enabled" value={user.isPremium ? "false" : "true"} />
                          <Button variant="outline" size="sm">
                            {user.isPremium ? "Remove premium" : "Make premium"}
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification queue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-slate-600">No pending requests.</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => {
                    const requester = userById.get(request.userId);
                    return (
                      <div key={request.id} className="rounded-lg border border-slate-200 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-900">{requester?.email ?? request.userId}</p>
                            <p className="text-xs text-slate-500">Requested {formatRelative(request.createdAt)}</p>
                          </div>
                          <Badge variant="outline">{request.roleRequested}</Badge>
                        </div>
                        {request.message && (
                          <p className="mt-3 text-sm text-slate-700">{request.message}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "gigs" && (
        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <CardTitle>Recent gigs</CardTitle>
            <p className="text-sm text-slate-600">Showing {latestGigRows.length} most recent gigs by start date.</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {gigTotals.total === 0 ? (
              <p className="text-sm text-slate-600">No gigs have been created yet.</p>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total gigs</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{gigTotals.total}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Published</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{gigTotals.published}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Drafts</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{gigTotals.drafts}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Upcoming</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{gigTotals.upcoming}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Applications</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{metricsTotals.totalApplications}</p>
                    <p className="text-xs text-slate-500">{metricsTotals.pendingApplications} pending review</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Favorites</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{metricsTotals.favorites}</p>
                    <p className="text-xs text-slate-500">Total saves across gigs</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Bookings</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">{metricsTotals.bookings}</p>
                    <p className="text-xs text-slate-500">Confirmed gigs</p>
                  </div>
                </div>

                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell>Title</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>City</TableHeaderCell>
                      <TableHeaderCell>Start</TableHeaderCell>
                      <TableHeaderCell>Payout</TableHeaderCell>
                      <TableHeaderCell>Applications</TableHeaderCell>
                      <TableHeaderCell>Favorites</TableHeaderCell>
                      <TableHeaderCell>Bookings</TableHeaderCell>
                      <TableHeaderCell>Last activity</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {latestGigRows.map(({ gig, metrics }) => (
                      <TableRow key={gig.id}>
                        <TableCell className="font-medium">{gig.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{gig.status}</Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {gig.city}, {gig.state}
                        </TableCell>
                        <TableCell className="text-slate-500">{formatDateTime(gig.dateStart)}</TableCell>
                        <TableCell className="text-slate-500">
                          {gig.payoutUsd ? `$${gig.payoutUsd.toLocaleString()}` : "—"}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {metrics?.totalApplications ?? 0}
                        </TableCell>
                        <TableCell className="text-slate-600">{metrics?.favorites ?? 0}</TableCell>
                        <TableCell className="text-slate-600">{metrics?.bookings ?? 0}</TableCell>
                        <TableCell className="text-slate-500">
                          {metrics?.lastActivityAt ? formatRelative(metrics.lastActivityAt) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <CardTitle>Reviews</CardTitle>
              <p className="text-sm text-slate-600">
                {reviewSummary.total} reviews • {reviewSummary.hidden} hidden
              </p>
            </CardHeader>
            <CardContent>
              {latestReviews.length === 0 ? (
                <p className="text-sm text-slate-600">No reviews have been submitted yet.</p>
              ) : (
                <div className="space-y-4">
                  {latestReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {review.rating}★ review for {userById.get(review.subjectUserId)?.email ?? review.subjectUserId}
                          </p>
                          <p className="text-xs text-slate-500">{formatRelative(review.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!review.visible && <Badge variant="outline">Hidden</Badge>}
                          <form action={toggleReviewVisibilityAction}>
                            <input type="hidden" name="id" value={review.id} />
                            <input type="hidden" name="tab" value="reviews" />
                            <input type="hidden" name="visible" value={review.visible ? "false" : "true"} />
                            <Button variant="outline" size="sm">
                              {review.visible ? "Hide" : "Unhide"}
                            </Button>
                          </form>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-3 text-sm text-slate-700">{review.comment}</p>
                      )}
                    </div>
                  ))}
                  {reviews.length > latestReviews.length && (
                    <p className="text-xs text-slate-500">Showing latest {latestReviews.length} reviews.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "ads" && (
        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <CardTitle>Ad slots</CardTitle>
            <Link href="/admin/ads" className="text-sm font-medium text-brand hover:underline">
              Open full ad manager
            </Link>
          </CardHeader>
          <CardContent>
            {adSlots.length === 0 ? (
              <p className="text-sm text-slate-600">No ad slots configured yet.</p>
            ) : (
              <div className="space-y-4">
                {adSlots.map((slot) => (
                  <div key={slot.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {slot.page} · {slot.placement}
                      </p>
                      <p className="text-xs text-slate-500">Priority {slot.priority}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={slot.active ? "default" : "outline"}>{slot.active ? "Active" : "Paused"}</Badge>
                      <form action={toggleAdSlotAction}>
                        <input type="hidden" name="id" value={slot.id} />
                        <input type="hidden" name="tab" value="ads" />
                        <input type="hidden" name="active" value={slot.active ? "false" : "true"} />
                        <Button variant="outline" size="sm">
                          {slot.active ? "Pause" : "Activate"}
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "flags" && (
        <Card>
          <CardHeader>
            <CardTitle>Feature flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {featureFlags.map((flag) => {
              const metadata = FEATURE_FLAG_METADATA[flag.key as FeatureFlagKey];
              const lastUpdated = flag.updatedAt.getTime() === 0 ? "Never toggled" : formatRelative(flag.updatedAt);
              return (
                <div key={flag.key} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">{metadata?.label ?? flag.key}</p>
                    {metadata?.description && (
                      <p className="text-xs text-slate-500">{metadata.description}</p>
                    )}
                    <p className="text-xs text-slate-500">{lastUpdated}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={flag.enabled ? "default" : "outline"}>{flag.enabled ? "Enabled" : "Disabled"}</Badge>
                    <form action={toggleFeatureFlagAction}>
                      <input type="hidden" name="key" value={flag.key} />
                      <input type="hidden" name="tab" value="flags" />
                      <input type="hidden" name="enabled" value={flag.enabled ? "false" : "true"} />
                      <Button variant="outline" size="sm">
                        {flag.enabled ? "Disable" : "Enable"}
                      </Button>
                    </form>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
