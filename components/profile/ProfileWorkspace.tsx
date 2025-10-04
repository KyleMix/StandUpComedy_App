"use client";

import { useEffect, useMemo, useState } from "react";
import type { CommunityBoardCategory } from "@/types/database";
import { Role } from "@/lib/prismaEnums";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export type ProfileRoleTab = "COMEDIAN" | "PROMOTER" | "VENUE";

interface BaseProfilePayload {
  createdAt: string;
  updatedAt: string;
}

interface ComedianProfilePayload extends BaseProfilePayload {
  stageName: string;
  bio: string | null;
  credits: string | null;
  website: string | null;
  reelUrl: string | null;
  instagram: string | null;
  tiktokHandle: string | null;
  youtubeChannel: string | null;
  travelRadiusMiles: number | null;
  homeCity: string | null;
  homeState: string | null;
}

interface PromoterProfilePayload extends BaseProfilePayload {
  organization: string;
  contactName: string;
  phone: string | null;
  website: string | null;
  verificationStatus: string;
}

interface VenueProfilePayload extends BaseProfilePayload {
  venueName: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  postalCode: string;
  capacity: number | null;
  contactEmail: string;
  phone: string | null;
  verificationStatus: string;
}

export interface BoardMessagePayload {
  id: string;
  authorId: string;
  authorRole: Role;
  authorName: string | null;
  content: string;
  category: CommunityBoardCategory;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileWorkspaceProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: Role;
    comedian: ComedianProfilePayload | null;
    promoter: PromoterProfilePayload | null;
    venue: VenueProfilePayload | null;
  };
  boardMessages: BoardMessagePayload[];
}

interface BoardMessage extends Omit<BoardMessagePayload, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

const ROLE_TABS: ProfileRoleTab[] = ["COMEDIAN", "PROMOTER", "VENUE"];

const CATEGORY_LABELS: Record<CommunityBoardCategory, string> = {
  ASK: "Request",
  OFFER: "Opportunity",
  ANNOUNCEMENT: "Announcement"
};

function allowedCategoriesFor(role: Role): CommunityBoardCategory[] {
  switch (role) {
    case "COMEDIAN":
      return ["ASK", "ANNOUNCEMENT"] as CommunityBoardCategory[];
    case "PROMOTER":
      return ["OFFER", "ANNOUNCEMENT"] as CommunityBoardCategory[];
    case "VENUE":
      return ["OFFER", "ANNOUNCEMENT"] as CommunityBoardCategory[];
    default:
      return ["ANNOUNCEMENT", "OFFER", "ASK"] as CommunityBoardCategory[];
  }
}

function categoryAccent(category: CommunityBoardCategory) {
  switch (category) {
    case "ASK":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "OFFER":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "ANNOUNCEMENT":
    default:
      return "border-sky-200 bg-sky-50 text-sky-700";
  }
}

function formatTimestamp(date: Date) {
  return date.toLocaleString();
}

const ProfileWorkspace = ({ user, boardMessages }: ProfileWorkspaceProps) => {
  const [currentUser, setCurrentUser] = useState(user);
  const initialRoleTab: ProfileRoleTab =
    user.role === "PROMOTER" ? "PROMOTER" : user.role === "VENUE" ? "VENUE" : "COMEDIAN";
  const [activeRole, setActiveRole] = useState<ProfileRoleTab>(initialRoleTab);

  const [comedianForm, setComedianForm] = useState({
    legalName: user.name ?? "",
    stageName: user.comedian?.stageName ?? "",
    bio: user.comedian?.bio ?? "",
    credits: user.comedian?.credits ?? "",
    website: user.comedian?.website ?? "",
    reelUrl: user.comedian?.reelUrl ?? "",
    instagram: user.comedian?.instagram ?? "",
    tiktokHandle: user.comedian?.tiktokHandle ?? "",
    youtubeChannel: user.comedian?.youtubeChannel ?? "",
    travelRadiusMiles: user.comedian?.travelRadiusMiles ? String(user.comedian.travelRadiusMiles) : "",
    homeCity: user.comedian?.homeCity ?? "",
    homeState: user.comedian?.homeState ?? ""
  });

  const [promoterForm, setPromoterForm] = useState({
    organization: user.promoter?.organization ?? "",
    contactName: user.promoter?.contactName ?? user.name ?? "",
    phone: user.promoter?.phone ?? "",
    website: user.promoter?.website ?? ""
  });

  const [venueForm, setVenueForm] = useState({
    venueName: user.venue?.venueName ?? "",
    address1: user.venue?.address1 ?? "",
    address2: user.venue?.address2 ?? "",
    city: user.venue?.city ?? "",
    state: user.venue?.state ?? "",
    postalCode: user.venue?.postalCode ?? "",
    capacity: user.venue?.capacity ? String(user.venue.capacity) : "",
    contactEmail: user.venue?.contactEmail ?? user.email,
    phone: user.venue?.phone ?? ""
  });

  const [comedianSaving, setComedianSaving] = useState(false);
  const [promoterSaving, setPromoterSaving] = useState(false);
  const [venueSaving, setVenueSaving] = useState(false);

  const [comedianFeedback, setComedianFeedback] = useState<string | null>(null);
  const [promoterFeedback, setPromoterFeedback] = useState<string | null>(null);
  const [venueFeedback, setVenueFeedback] = useState<string | null>(null);

  const [comedianError, setComedianError] = useState<string | null>(null);
  const [promoterError, setPromoterError] = useState<string | null>(null);
  const [venueError, setVenueError] = useState<string | null>(null);

  const [messages, setMessages] = useState<BoardMessage[]>(
    boardMessages.map((message) => ({
      ...message,
      createdAt: new Date(message.createdAt),
      updatedAt: new Date(message.updatedAt)
    }))
  );
  const [messageContent, setMessageContent] = useState("");
  const allowedMessageCategories = useMemo(
    () => allowedCategoriesFor(currentUser.role),
    [currentUser.role]
  );
  const [messageCategory, setMessageCategory] = useState<CommunityBoardCategory>(
    allowedMessageCategories[0] ?? "ANNOUNCEMENT"
  );
  const [messageSaving, setMessageSaving] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  const isAdmin = currentUser.role === "ADMIN";
  const canEditActiveTab = isAdmin || activeRole === currentUser.role;

  useEffect(() => {
    if (!allowedMessageCategories.includes(messageCategory)) {
      setMessageCategory(allowedMessageCategories[0] ?? "ANNOUNCEMENT");
    }
  }, [allowedMessageCategories, messageCategory]);

  async function handleComedianSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEditActiveTab || activeRole !== "COMEDIAN") {
      return;
    }
    setComedianSaving(true);
    setComedianFeedback(null);
    setComedianError(null);

    const payload = {
      legalName: comedianForm.legalName.trim(),
      stageName: comedianForm.stageName.trim(),
      bio: comedianForm.bio.trim() ? comedianForm.bio.trim() : null,
      credits: comedianForm.credits.trim() ? comedianForm.credits.trim() : null,
      website: comedianForm.website.trim() ? comedianForm.website.trim() : null,
      reelUrl: comedianForm.reelUrl.trim() ? comedianForm.reelUrl.trim() : null,
      instagram: comedianForm.instagram.trim() ? comedianForm.instagram.trim() : null,
      tiktokHandle: comedianForm.tiktokHandle.trim() ? comedianForm.tiktokHandle.trim() : null,
      youtubeChannel: comedianForm.youtubeChannel.trim() ? comedianForm.youtubeChannel.trim() : null,
      travelRadiusMiles: comedianForm.travelRadiusMiles ? Number(comedianForm.travelRadiusMiles) : null,
      homeCity: comedianForm.homeCity.trim() ? comedianForm.homeCity.trim() : null,
      homeState: comedianForm.homeState.trim() ? comedianForm.homeState.trim().toUpperCase() : null
    };

    try {
      const response = await fetch("/api/profile/comedian", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error?.formErrors?.join(" ") ?? result.error?.message ?? "Failed to save");
      }
      setCurrentUser((prev) => ({
        ...prev,
        name: result.user?.name ?? prev.name,
        comedian: result.profile
          ? {
              ...result.profile,
              createdAt: result.profile.createdAt,
              updatedAt: result.profile.updatedAt
            }
          : prev.comedian
      }));
      if (result.profile) {
        setComedianForm({
          legalName: result.user?.name ?? comedianForm.legalName,
          stageName: result.profile.stageName ?? "",
          bio: result.profile.bio ?? "",
          credits: result.profile.credits ?? "",
          website: result.profile.website ?? "",
          reelUrl: result.profile.reelUrl ?? "",
          instagram: result.profile.instagram ?? "",
          tiktokHandle: result.profile.tiktokHandle ?? "",
          youtubeChannel: result.profile.youtubeChannel ?? "",
          travelRadiusMiles: result.profile.travelRadiusMiles
            ? String(result.profile.travelRadiusMiles)
            : "",
          homeCity: result.profile.homeCity ?? "",
          homeState: result.profile.homeState ?? ""
        });
      }
      setComedianFeedback("Your comedian profile is up to date!");
    } catch (error) {
      setComedianError(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setComedianSaving(false);
    }
  }

  async function handlePromoterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEditActiveTab || activeRole !== "PROMOTER") {
      return;
    }
    setPromoterSaving(true);
    setPromoterFeedback(null);
    setPromoterError(null);

    const payload = {
      organization: promoterForm.organization.trim(),
      contactName: promoterForm.contactName.trim(),
      phone: promoterForm.phone.trim() ? promoterForm.phone.trim() : null,
      website: promoterForm.website.trim() ? promoterForm.website.trim() : null
    };

    try {
      const response = await fetch("/api/profile/promoter", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error?.formErrors?.join(" ") ?? result.error?.message ?? "Failed to save");
      }
      setCurrentUser((prev) => ({
        ...prev,
        name: result.user?.name ?? prev.name,
        promoter: result.profile
          ? {
              ...result.profile,
              createdAt: result.profile.createdAt,
              updatedAt: result.profile.updatedAt
            }
          : prev.promoter
      }));
      if (result.profile) {
        setPromoterForm({
          organization: result.profile.organization ?? "",
          contactName: result.profile.contactName ?? "",
          phone: result.profile.phone ?? "",
          website: result.profile.website ?? ""
        });
      }
      setPromoterFeedback("Promoter details saved successfully.");
    } catch (error) {
      setPromoterError(error instanceof Error ? error.message : "Failed to save promoter profile");
    } finally {
      setPromoterSaving(false);
    }
  }

  async function handleVenueSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canEditActiveTab || activeRole !== "VENUE") {
      return;
    }
    setVenueSaving(true);
    setVenueFeedback(null);
    setVenueError(null);

    const payload = {
      venueName: venueForm.venueName.trim(),
      address1: venueForm.address1.trim(),
      address2: venueForm.address2.trim() ? venueForm.address2.trim() : null,
      city: venueForm.city.trim(),
      state: venueForm.state.trim().toUpperCase(),
      postalCode: venueForm.postalCode.trim(),
      capacity: venueForm.capacity ? Number(venueForm.capacity) : null,
      contactEmail: venueForm.contactEmail.trim(),
      phone: venueForm.phone.trim() ? venueForm.phone.trim() : null
    };

    try {
      const response = await fetch("/api/profile/venue", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error?.formErrors?.join(" ") ?? result.error?.message ?? "Failed to save");
      }
      setCurrentUser((prev) => ({
        ...prev,
        name: result.user?.name ?? prev.name,
        venue: result.profile
          ? {
              ...result.profile,
              createdAt: result.profile.createdAt,
              updatedAt: result.profile.updatedAt
            }
          : prev.venue
      }));
      if (result.profile) {
        setVenueForm({
          venueName: result.profile.venueName ?? "",
          address1: result.profile.address1 ?? "",
          address2: result.profile.address2 ?? "",
          city: result.profile.city ?? "",
          state: result.profile.state ?? "",
          postalCode: result.profile.postalCode ?? "",
          capacity: result.profile.capacity ? String(result.profile.capacity) : "",
          contactEmail: result.profile.contactEmail ?? venueForm.contactEmail,
          phone: result.profile.phone ?? ""
        });
      }
      setVenueFeedback("Venue profile saved. Time to book more shows!");
    } catch (error) {
      setVenueError(error instanceof Error ? error.message : "Failed to save venue profile");
    } finally {
      setVenueSaving(false);
    }
  }

  async function handleMessageSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!messageContent.trim()) {
      return;
    }
    setMessageSaving(true);
    setMessageError(null);
    try {
      const response = await fetch("/api/profile/board/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent.trim(), category: messageCategory })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error?.message ?? "Unable to post message");
      }
      const message = {
        ...result.message,
        createdAt: new Date(result.message.createdAt),
        updatedAt: new Date(result.message.updatedAt)
      } as BoardMessage;
      setMessages((prev) => [message, ...prev]);
      setMessageContent("");
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : "Unable to post message");
    } finally {
      setMessageSaving(false);
    }
  }

  async function handleMessageUpdate(messageId: string, payload: Record<string, unknown>) {
    setMessageError(null);
    try {
      const response = await fetch(`/api/profile/board/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error?.message ?? "Unable to update message");
      }
      const updated = {
        ...result.message,
        createdAt: new Date(result.message.createdAt),
        updatedAt: new Date(result.message.updatedAt)
      } as BoardMessage;
      setMessages((prev) => prev.map((message) => (message.id === messageId ? { ...message, ...updated } : message)));
      setEditingMessageId(null);
      setEditingContent("");
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : "Unable to update message");
    }
  }

  function renderComedianBoard() {
    const announcements = messages.filter((message) => message.category === "ANNOUNCEMENT");
    const opportunities = messages.filter((message) => message.category === "OFFER");
    const asks = messages.filter((message) => message.category === "ASK");

    return (
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { title: "Announcements", items: announcements },
          { title: "Opportunities", items: opportunities },
          { title: "Comic requests", items: asks }
        ].map((section) => (
          <div key={section.title} className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">{section.title}</h3>
            {section.items.length === 0 ? (
              <p className="text-sm text-slate-400">Nothing here yet.</p>
            ) : (
              section.items.map((message) => renderMessageCard(message))
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderPromoterBoard() {
    const pinned = messages.filter((message) => message.isPinned);
    const others = messages
      .filter((message) => !message.isPinned)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return (
      <div className="space-y-6">
        {pinned.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Pinned spotlights</h3>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                {pinned.length}
              </Badge>
            </div>
            <div className="space-y-3">{pinned.map((message) => renderMessageCard(message, { highlight: true }))}</div>
          </div>
        )}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Latest conversations</h3>
          <div className="space-y-3">{others.map((message) => renderMessageCard(message))}</div>
        </div>
      </div>
    );
  }

  function renderVenueBoard() {
    const ordered = [...messages].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return (
      <ol className="space-y-4">
        {ordered.map((message) => (
          <li key={message.id} className="relative pl-6">
            <span className="absolute left-2 top-3 h-2 w-2 rounded-full bg-brand" aria-hidden />
            {renderMessageCard(message, { compact: true })}
          </li>
        ))}
      </ol>
    );
  }

  function renderMessageCard(
    message: BoardMessage,
    options: { highlight?: boolean; compact?: boolean } = {}
  ) {
    const isAuthor = message.authorId === currentUser.id;
    const canEditContent = (currentUser.role === "COMEDIAN" || currentUser.role === "ADMIN") && isAuthor;
    const canTogglePin = currentUser.role === "PROMOTER" && isAuthor;
    const canChangeCategory = currentUser.role === "VENUE" && isAuthor;
    const isEditing = editingMessageId === message.id;

    return (
      <div
        key={message.id}
        className={cn(
          "rounded-lg border border-slate-200 bg-white p-4 shadow-sm",
          options.highlight && "border-amber-300 bg-amber-50",
          options.compact && "py-3"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-slate-800">{message.authorName ?? "Community member"}</p>
            <p className="text-xs text-slate-500">{formatTimestamp(message.updatedAt)}</p>
          </div>
          <Badge className={cn("border text-xs", categoryAccent(message.category))}>
            {CATEGORY_LABELS[message.category]}
          </Badge>
        </div>
        {isEditing ? (
          <form
            className="mt-3 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!editingContent.trim()) return;
              void handleMessageUpdate(message.id, { content: editingContent.trim() });
            }}
          >
            <Textarea value={editingContent} onChange={(event) => setEditingContent(event.target.value)} />
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm">
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingMessageId(null);
                  setEditingContent("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{message.content}</p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          {message.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
              Pinned
            </span>
          )}
          {isAuthor && !isEditing && (
            <div className="flex items-center gap-2">
              {canEditContent && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingMessageId(message.id);
                    setEditingContent(message.content);
                  }}
                >
                  Edit text
                </Button>
              )}
              {canTogglePin && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => void handleMessageUpdate(message.id, { isPinned: !message.isPinned })}
                >
                  {message.isPinned ? "Unpin" : "Pin"}
                </Button>
              )}
              {canChangeCategory && (
                <select
                  value={message.category}
                  onChange={(event) =>
                    void handleMessageUpdate(message.id, {
                      category: event.target.value as CommunityBoardCategory
                    })
                  }
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                >
                  {allowedCategoriesFor(currentUser.role).map((category) => (
                    <option key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderBoard() {
    if (currentUser.role === "PROMOTER") {
      return renderPromoterBoard();
    }
    if (currentUser.role === "VENUE") {
      return renderVenueBoard();
    }
    return renderComedianBoard();
  }

  return (
    <div className="space-y-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-slate-900">Complete your profile</CardTitle>
          <CardDescription>
            Switch between the three profile types to see what information is collected for each community member.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {ROLE_TABS.map((role) => (
              <Button
                key={role}
                type="button"
                variant={activeRole === role ? "default" : "outline"}
                onClick={() => setActiveRole(role)}
              >
                {role.charAt(0) + role.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>
          {activeRole === "COMEDIAN" && (
            <form onSubmit={handleComedianSubmit} className="space-y-4">
              {!canEditActiveTab && (
                <p className="rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-500">
                  Viewing the comedian form. Sign in as a comedian to edit these details.
                </p>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Legal name</label>
                  <Input
                    value={comedianForm.legalName}
                    onChange={(event) => setComedianForm((prev) => ({ ...prev, legalName: event.target.value }))}
                    disabled={!canEditActiveTab}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Stage name</label>
                  <Input
                    value={comedianForm.stageName}
                    onChange={(event) => setComedianForm((prev) => ({ ...prev, stageName: event.target.value }))}
                    disabled={!canEditActiveTab}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Bio</label>
                <Textarea
                  value={comedianForm.bio}
                  onChange={(event) => setComedianForm((prev) => ({ ...prev, bio: event.target.value }))}
                  rows={4}
                  disabled={!canEditActiveTab}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Credits</label>
                <Textarea
                  value={comedianForm.credits}
                  onChange={(event) => setComedianForm((prev) => ({ ...prev, credits: event.target.value }))}
                  rows={2}
                  disabled={!canEditActiveTab}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Website</label>
                  <Input
                    value={comedianForm.website}
                    onChange={(event) => setComedianForm((prev) => ({ ...prev, website: event.target.value }))}
                    disabled={!canEditActiveTab}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Reel URL</label>
                  <Input
                    value={comedianForm.reelUrl}
                    onChange={(event) => setComedianForm((prev) => ({ ...prev, reelUrl: event.target.value }))}
                    disabled={!canEditActiveTab}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Instagram</label>
                  <Input
                    value={comedianForm.instagram}
                    onChange={(event) => setComedianForm((prev) => ({ ...prev, instagram: event.target.value }))}
                    disabled={!canEditActiveTab}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">TikTok</label>
                  <Input
                    value={comedianForm.tiktokHandle}
                    onChange={(event) => setComedianForm((prev) => ({ ...prev, tiktokHandle: event.target.value }))}
                    disabled={!canEditActiveTab}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">YouTube</label>
                  <Input
                    value={comedianForm.youtubeChannel}
                    onChange={(event) =>
                      setComedianForm((prev) => ({ ...prev, youtubeChannel: event.target.value }))
                    }
                    disabled={!canEditActiveTab}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Travel radius (miles)</label>
                  <Input
                    value={comedianForm.travelRadiusMiles}
                    onChange={(event) =>
                      setComedianForm((prev) => ({ ...prev, travelRadiusMiles: event.target.value }))
                    }
                    disabled={!canEditActiveTab}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Home city</label>
                  <Input
                    value={comedianForm.homeCity}
                    onChange={(event) => setComedianForm((prev) => ({ ...prev, homeCity: event.target.value }))}
                    disabled={!canEditActiveTab}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Home state</label>
                  <Input
                    value={comedianForm.homeState}
                    onChange={(event) => setComedianForm((prev) => ({ ...prev, homeState: event.target.value }))}
                    maxLength={2}
                    disabled={!canEditActiveTab}
                  />
                </div>
              </div>
              {comedianError && <p className="text-sm text-red-600">{comedianError}</p>}
              {comedianFeedback && <p className="text-sm text-emerald-600">{comedianFeedback}</p>}
              <Button type="submit" disabled={!canEditActiveTab || comedianSaving}>
                {comedianSaving ? "Saving..." : "Save comedian profile"}
              </Button>
            </form>
          )}

          {activeRole === "PROMOTER" && (
            <form onSubmit={handlePromoterSubmit} className="space-y-4">
              {!canEditActiveTab && (
                <p className="rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-500">
                  Viewing the promoter details. Sign in as a promoter to edit this section.
                </p>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Organization</label>
                  <Input
                    value={promoterForm.organization}
                    onChange={(event) =>
                      setPromoterForm((prev) => ({ ...prev, organization: event.target.value }))
                    }
                    disabled={!canEditActiveTab}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Primary contact</label>
                  <Input
                    value={promoterForm.contactName}
                    onChange={(event) =>
                      setPromoterForm((prev) => ({ ...prev, contactName: event.target.value }))
                    }
                    disabled={!canEditActiveTab}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Website</label>
                  <Input
                    value={promoterForm.website}
                    onChange={(event) => setPromoterForm((prev) => ({ ...prev, website: event.target.value }))}
                    disabled={!canEditActiveTab}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Phone</label>
                  <Input
                    value={promoterForm.phone}
                    onChange={(event) => setPromoterForm((prev) => ({ ...prev, phone: event.target.value }))}
                    disabled={!canEditActiveTab}
                  />
                </div>
              </div>
              {promoterError && <p className="text-sm text-red-600">{promoterError}</p>}
              {promoterFeedback && <p className="text-sm text-emerald-600">{promoterFeedback}</p>}
              <Button type="submit" disabled={!canEditActiveTab || promoterSaving}>
                {promoterSaving ? "Saving..." : "Save promoter profile"}
              </Button>
            </form>
          )}

          {activeRole === "VENUE" && (
            <form onSubmit={handleVenueSubmit} className="space-y-4">
              {!canEditActiveTab && (
                <p className="rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-500">
                  Viewing the venue profile. Sign in as a venue manager to make updates.
                </p>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Venue name</label>
                  <Input
                    value={venueForm.venueName}
                    onChange={(event) => setVenueForm((prev) => ({ ...prev, venueName: event.target.value }))}
                    disabled={!canEditActiveTab}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Contact email</label>
                  <Input
                    value={venueForm.contactEmail}
                    onChange={(event) =>
                      setVenueForm((prev) => ({ ...prev, contactEmail: event.target.value }))
                    }
                    disabled={!canEditActiveTab}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Address line 1</label>
                  <Input
                    value={venueForm.address1}
                    onChange={(event) => setVenueForm((prev) => ({ ...prev, address1: event.target.value }))}
                    disabled={!canEditActiveTab}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Address line 2</label>
                  <Input
                    value={venueForm.address2}
                    onChange={(event) => setVenueForm((prev) => ({ ...prev, address2: event.target.value }))}
                    disabled={!canEditActiveTab}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-slate-700">City</label>
                  <Input
                    value={venueForm.city}
                    onChange={(event) => setVenueForm((prev) => ({ ...prev, city: event.target.value }))}
                    disabled={!canEditActiveTab}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">State</label>
                  <Input
                    value={venueForm.state}
                    onChange={(event) => setVenueForm((prev) => ({ ...prev, state: event.target.value }))}
                    maxLength={2}
                    disabled={!canEditActiveTab}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Postal code</label>
                  <Input
                    value={venueForm.postalCode}
                    onChange={(event) => setVenueForm((prev) => ({ ...prev, postalCode: event.target.value }))}
                    disabled={!canEditActiveTab}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Capacity</label>
                  <Input
                    value={venueForm.capacity}
                    onChange={(event) => setVenueForm((prev) => ({ ...prev, capacity: event.target.value }))}
                    disabled={!canEditActiveTab}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Phone</label>
                  <Input
                    value={venueForm.phone}
                    onChange={(event) => setVenueForm((prev) => ({ ...prev, phone: event.target.value }))}
                    disabled={!canEditActiveTab}
                  />
                </div>
              </div>
              {venueError && <p className="text-sm text-red-600">{venueError}</p>}
              {venueFeedback && <p className="text-sm text-emerald-600">{venueFeedback}</p>}
              <Button type="submit" disabled={!canEditActiveTab || venueSaving}>
                {venueSaving ? "Saving..." : "Save venue profile"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-slate-900">Community message board</CardTitle>
          <CardDescription>
            Share updates with comedians, promoters, and venues. Each role sees a unique layout tailored to their workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleMessageSubmit} className="space-y-3">
            <Textarea
              value={messageContent}
              onChange={(event) => setMessageContent(event.target.value)}
              placeholder="Post an update, ask for help, or announce an opportunity"
              rows={3}
            />
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Category</label>
                <select
                  value={messageCategory}
                  onChange={(event) => setMessageCategory(event.target.value as CommunityBoardCategory)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {allowedMessageCategories.map((category) => (
                    <option key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" disabled={messageSaving || !messageContent.trim()}>
                {messageSaving ? "Posting..." : "Share with the community"}
              </Button>
            </div>
            {messageError && <p className="text-sm text-red-600">{messageError}</p>}
          </form>

          <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-600">
            {currentUser.role === "COMEDIAN" && (
              <p>
                Comedians can edit the text of their own messages to keep their reel and availability current.
              </p>
            )}
            {currentUser.role === "PROMOTER" && (
              <p>Promoters can pin or unpin their posts to keep marquee opportunities at the top of the board.</p>
            )}
            {currentUser.role === "VENUE" && (
              <p>Venues can reclassify their updates to highlight new booking windows or special announcements.</p>
            )}
          </div>

          {renderBoard()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileWorkspace;
