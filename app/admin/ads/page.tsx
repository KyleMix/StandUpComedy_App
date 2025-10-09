import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import AdSlot from "@/components/ads/AdSlot";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@/lib/auth";
import {
  createAdSlot,
  deleteAdSlot as deleteAdSlotRecord,
  listAllAdSlots,
  updateAdSlot as updateAdSlotRecord,
} from "@/lib/ads";
import type { AdSlotPage, AdSlotPlacement } from "@/types/database";
import { cn } from "@/lib/utils";

const PAGES: AdSlotPage[] = ["home", "search", "profile"];
const PLACEMENTS: AdSlotPlacement[] = ["top", "inline", "sidebar"];

function isAdSlotPage(value: FormDataEntryValue | null): value is AdSlotPage {
  return typeof value === "string" && PAGES.includes(value as AdSlotPage);
}

function isAdSlotPlacement(value: FormDataEntryValue | null): value is AdSlotPlacement {
  return typeof value === "string" && PLACEMENTS.includes(value as AdSlotPlacement);
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
}

async function createSlot(formData: FormData) {
  "use server";

  await requireAdmin();

  const rawPage = formData.get("page");
  const rawPlacement = formData.get("placement");
  if (!isAdSlotPage(rawPage) || !isAdSlotPlacement(rawPlacement)) {
    throw new Error("Invalid ad slot configuration");
  }

  const html = formData.get("html");
  const imageUrl = formData.get("imageUrl");
  const linkUrl = formData.get("linkUrl");
  const active = formData.get("active") === "on";
  const priorityValue = Number(formData.get("priority") ?? 0);
  const priority = Number.isFinite(priorityValue) ? Math.round(priorityValue) : 0;

  await createAdSlot({
    page: rawPage,
    placement: rawPlacement,
    html: typeof html === "string" && html.trim().length > 0 ? html : null,
    imageUrl: typeof imageUrl === "string" && imageUrl.trim().length > 0 ? imageUrl : null,
    linkUrl: typeof linkUrl === "string" && linkUrl.trim().length > 0 ? linkUrl : null,
    active,
    priority,
  });

  revalidatePath("/admin/ads");
}

async function updateSlot(formData: FormData) {
  "use server";

  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    throw new Error("Missing ad slot id");
  }

  const rawPage = formData.get("page");
  const rawPlacement = formData.get("placement");
  const html = formData.get("html");
  const imageUrl = formData.get("imageUrl");
  const linkUrl = formData.get("linkUrl");
  const priorityValue = Number(formData.get("priority") ?? 0);

  const payload: Parameters<typeof updateAdSlotRecord>[1] = {};
  if (isAdSlotPage(rawPage)) {
    payload.page = rawPage;
  }
  if (isAdSlotPlacement(rawPlacement)) {
    payload.placement = rawPlacement;
  }
  if (typeof html === "string") {
    payload.html = html.trim().length > 0 ? html : null;
  }
  if (typeof imageUrl === "string") {
    payload.imageUrl = imageUrl.trim().length > 0 ? imageUrl : null;
  }
  if (typeof linkUrl === "string") {
    payload.linkUrl = linkUrl.trim().length > 0 ? linkUrl : null;
  }
  payload.active = formData.get("active") === "on";
  if (Number.isFinite(priorityValue)) {
    payload.priority = Math.round(priorityValue);
  }

  await updateAdSlotRecord(id, payload);
  revalidatePath("/admin/ads");
}

async function deleteSlot(formData: FormData) {
  "use server";

  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return;
  }

  await deleteAdSlotRecord(id);
  revalidatePath("/admin/ads");
}

export default async function AdminAdsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const slots = await listAllAdSlots();

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Ad slots</h1>
        <p className="text-sm text-slate-600">
          Manage sponsored placements across public pages. Use HTML for advanced creatives or provide image and link URLs for
          simple cards.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create new slot</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createSlot} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="page">
                  Page
                </label>
                <select
                  id="page"
                  name="page"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  defaultValue="home"
                >
                  {PAGES.map((page) => (
                    <option key={page} value={page}>
                      {page}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="placement">
                  Placement
                </label>
                <select
                  id="placement"
                  name="placement"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                  defaultValue="top"
                >
                  {PLACEMENTS.map((placement) => (
                    <option key={placement} value={placement}>
                      {placement}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="priority">
                  Priority
                </label>
                <Input id="priority" name="priority" type="number" defaultValue={0} min={0} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="html">
                HTML content
              </label>
              <Textarea id="html" name="html" rows={4} placeholder="Optional HTML snippet" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="imageUrl">
                  Image URL
                </label>
                <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://example.com/ad.png" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="linkUrl">
                  Link URL
                </label>
                <Input id="linkUrl" name="linkUrl" type="url" placeholder="https://example.com" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" name="active" defaultChecked className="rounded border-slate-300" />
                Active
              </label>
              <Button type="submit">Create slot</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Existing slots</h2>
        {slots.length === 0 ? (
          <p className="text-sm text-slate-600">No slots configured yet.</p>
        ) : (
          <div className="grid gap-6">
            {slots.map((slot) => (
              <Card key={slot.id}>
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center gap-3 text-base">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      {slot.page} · {slot.placement}
                    </span>
                    <span className="text-sm font-normal text-slate-500">Priority {slot.priority}</span>
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        slot.active ? "text-emerald-600" : "text-rose-600"
                      )}
                    >
                      {slot.active ? "Active" : "Paused"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form action={updateSlot} className="space-y-4">
                    <input type="hidden" name="id" value={slot.id} />
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1">
                        <label
                          className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                          htmlFor={`page-${slot.id}`}
                        >
                          Page
                        </label>
                        <select
                          id={`page-${slot.id}`}
                          name="page"
                          defaultValue={slot.page}
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                        >
                          {PAGES.map((page) => (
                            <option key={page} value={page}>
                              {page}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label
                          className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                          htmlFor={`placement-${slot.id}`}
                        >
                          Placement
                        </label>
                        <select
                          id={`placement-${slot.id}`}
                          name="placement"
                          defaultValue={slot.placement}
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                        >
                          {PLACEMENTS.map((placement) => (
                            <option key={placement} value={placement}>
                              {placement}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label
                          className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                          htmlFor={`priority-${slot.id}`}
                        >
                          Priority
                        </label>
                        <Input
                          id={`priority-${slot.id}`}
                          name="priority"
                          type="number"
                          defaultValue={slot.priority}
                          min={0}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                        htmlFor={`html-${slot.id}`}
                      >
                        HTML content
                      </label>
                      <Textarea id={`html-${slot.id}`} name="html" rows={4} defaultValue={slot.html ?? ""} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <label
                          className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                          htmlFor={`imageUrl-${slot.id}`}
                        >
                          Image URL
                        </label>
                        <Input
                          id={`imageUrl-${slot.id}`}
                          name="imageUrl"
                          type="url"
                          defaultValue={slot.imageUrl ?? ""}
                        />
                      </div>
                      <div className="space-y-1">
                        <label
                          className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                          htmlFor={`linkUrl-${slot.id}`}
                        >
                          Link URL
                        </label>
                        <Input
                          id={`linkUrl-${slot.id}`}
                          name="linkUrl"
                          type="url"
                          defaultValue={slot.linkUrl ?? ""}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          name="active"
                          defaultChecked={slot.active}
                          className="rounded border-slate-300"
                        />
                        Active
                      </label>
                      <div className="flex gap-2">
                        <Button type="submit" variant="outline">
                          Save changes
                        </Button>
                        <Button type="submit" formAction={deleteSlot} variant="ghost" name="id" value={slot.id}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Preview active placements</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Home sidebar</h3>
            <AdSlot page="home" placement="sidebar" />
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Search inline</h3>
            <AdSlot page="search" placement="inline" />
          </div>
        </div>
      </section>
    </div>
  );
}
