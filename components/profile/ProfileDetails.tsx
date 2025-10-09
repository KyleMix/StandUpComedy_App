"use client";

/* eslint-disable @next/next/no-img-element */

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { ProfileSample } from "@/lib/sample";
import { avatarFor } from "@/utils/avatar";
import { formatDateShort } from "@/utils/format";
import { ExternalLink, Mail, UserPlus, Users } from "lucide-react";

interface ProfileDetailsProps {
  profile: ProfileSample;
  allProfiles: ProfileSample[];
}

type FeedbackState = { type: "connect" | "message"; text: string } | null;

type MessageFormState = {
  recipientSlug: string;
  subject: string;
  body: string;
};

export function ProfileDetails({ profile, allProfiles }: ProfileDetailsProps) {
  const [networkSlugs, setNetworkSlugs] = useState<string[]>(profile.network ?? []);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [messageForm, setMessageForm] = useState<MessageFormState>({
    recipientSlug: "",
    subject: "",
    body: "",
  });

  const otherProfiles = useMemo(
    () => allProfiles.filter((candidate) => candidate.slug !== profile.slug),
    [allProfiles, profile.slug]
  );

  const networkProfiles = useMemo(
    () =>
      otherProfiles.filter((candidate) =>
        networkSlugs.includes(candidate.slug)
      ),
    [networkSlugs, otherProfiles]
  );

  const comedianRecipients = useMemo(
    () => networkProfiles.filter((candidate) => candidate.role === "comedian"),
    [networkProfiles]
  );

  const suggestedConnections = useMemo(() => {
    const available = otherProfiles.filter((candidate) => !networkSlugs.includes(candidate.slug));
    return available.sort((a, b) => {
      if (a.role === profile.role && b.role !== profile.role) {
        return -1;
      }
      if (a.role !== profile.role && b.role === profile.role) {
        return 1;
      }
      if (a.role === "comedian" && b.role !== "comedian") {
        return -1;
      }
      if (a.role !== "comedian" && b.role === "comedian") {
        return 1;
      }
      return a.displayName.localeCompare(b.displayName);
    });
  }, [otherProfiles, networkSlugs, profile.role]);

  useEffect(() => {
    if (!comedianRecipients.some((recipient) => recipient.slug === messageForm.recipientSlug)) {
      setMessageForm((current) => ({
        ...current,
        recipientSlug: comedianRecipients[0]?.slug ?? "",
      }));
    }
  }, [comedianRecipients, messageForm.recipientSlug]);

  const displayAvatar = avatarFor(profile.displayName, profile.avatarUrl);

  const handleConnect = (candidate: ProfileSample) => {
    setNetworkSlugs((current) => {
      if (current.includes(candidate.slug)) {
        setFeedback({ type: "connect", text: `You're already connected with ${candidate.displayName}.` });
        return current;
      }

      const updated = [...current, candidate.slug];
      setFeedback({ type: "connect", text: `You added ${candidate.displayName} to your network.` });
      return updated;
    });
  };

  const handleMessageSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const recipient = comedianRecipients.find((candidate) => candidate.slug === messageForm.recipientSlug);

    if (!recipient) {
      setFeedback({ type: "message", text: "Please connect with a comedian before sending a message." });
      return;
    }

    setFeedback({ type: "message", text: `Message sent to ${recipient.displayName}! They'll get back to you soon.` });
    setMessageForm((current) => ({ ...current, subject: "", body: "" }));
  };

  return (
    <div className="space-y-10">
      <header className="card border border-base-300 bg-base-200/40 shadow-sm">
        <div className="card-body gap-6 lg:flex lg:items-center lg:justify-between">
          <div className="flex items-start gap-6">
            <img
              src={displayAvatar}
              alt={profile.displayName}
              className="h-24 w-24 rounded-full border border-base-300/60 bg-base-100 object-cover"
            />
            <div className="space-y-2">
              <div>
                <h1 className="text-3xl font-manrope">{profile.displayName}</h1>
                <p className="text-base text-base-content/70">{profile.city}</p>
                {profile.tagline && <p className="text-base text-base-content/80">{profile.tagline}</p>}
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-base-content/70">
                {profile.experienceYears != null && (
                  <span className="badge badge-outline border-base-300/70">{profile.experienceYears}+ years experience</span>
                )}
                {profile.specialties?.map((specialty) => (
                  <span key={specialty} className="badge badge-outline border-secondary/40">
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            {profile.website && (
              <Link
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-outline btn-sm gap-2"
              >
                <Icon icon={ExternalLink} className="h-4 w-4" /> Website
              </Link>
            )}
            {profile.contactEmail && (
              <a href={`mailto:${profile.contactEmail}`} className="btn btn-primary btn-sm gap-2">
                <Icon icon={Mail} className="h-4 w-4" /> Contact
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">About</h2>
            <p className="leading-relaxed text-base text-base-content/80">{profile.bio}</p>
          </div>

          {profile.credits && profile.credits.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Highlights</h3>
              <ul className="list-disc space-y-2 pl-6 text-base text-base-content/80">
                {profile.credits.map((credit) => (
                  <li key={credit}>{credit}</li>
                ))}
              </ul>
            </div>
          )}

          {profile.upcomingShows && profile.upcomingShows.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Upcoming Shows</h3>
              <ul className="space-y-3">
                {profile.upcomingShows.map((show) => (
                  <li
                    key={`${show.title}-${show.dateISO}`}
                    className="flex flex-col gap-1 rounded-lg border border-base-300/70 bg-base-200/50 p-4 text-sm text-base-content/80"
                  >
                    <span className="font-semibold text-base-content">{show.title}</span>
                    <span>{show.venue}</span>
                    <span>{formatDateShort(show.dateISO)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className="card border border-base-300 bg-base-200/40 shadow-sm">
            <div className="card-body space-y-4">
              <header className="flex items-center gap-2 text-base font-semibold">
                <Icon icon={Users} className="h-5 w-5" /> Your Network
              </header>

              <div aria-live="polite" className="text-sm text-secondary">
                {feedback?.type === "connect" && feedback.text}
              </div>

              {networkProfiles.length > 0 ? (
                <ul className="space-y-3">
                  {networkProfiles.map((connection) => (
                    <li key={connection.slug} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{connection.displayName}</p>
                        <p className="text-sm text-base-content/70">{connection.city}</p>
                      </div>
                      <span className="badge badge-sm badge-outline border-secondary/40 uppercase tracking-wide">
                        {connection.role}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-base-content/70">Add a connection to build your comedy crew.</p>
              )}
            </div>
          </section>

          <section className="card border border-base-300 bg-base-200/40 shadow-sm">
            <div className="card-body space-y-4">
              <header className="flex items-center gap-2 text-base font-semibold">
                <Icon icon={UserPlus} className="h-5 w-5" /> Connect with someone
              </header>

              {suggestedConnections.length > 0 ? (
                <ul className="space-y-3">
                  {suggestedConnections.map((candidate) => (
                    <li key={candidate.slug} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{candidate.displayName}</p>
                        <p className="text-sm text-base-content/70">{candidate.city}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleConnect(candidate)}
                        className="btn btn-outline btn-xs"
                      >
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-base-content/70">You&apos;re connected with everyone in your area!</p>
              )}
            </div>
          </section>

          <section className="card border border-base-300 bg-base-200/40 shadow-sm">
            <div className="card-body space-y-4">
              <header className="flex items-center gap-2 text-base font-semibold">
                <Icon icon={Mail} className="h-5 w-5" /> Message a comedian
              </header>

              <div aria-live="polite" className="text-sm text-secondary">
                {feedback?.type === "message" && feedback.text}
              </div>

              {comedianRecipients.length > 0 ? (
                <form className="space-y-3" onSubmit={handleMessageSubmit}>
                  <label className="form-control w-full text-sm">
                    <span className="label-text">Send to</span>
                    <select
                      className="select select-bordered select-sm"
                      value={messageForm.recipientSlug}
                      onChange={(event) =>
                        setMessageForm((current) => ({ ...current, recipientSlug: event.target.value }))
                      }
                      required
                    >
                      {comedianRecipients.map((recipient) => (
                        <option key={recipient.slug} value={recipient.slug}>
                          {recipient.displayName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="form-control w-full text-sm">
                    <span className="label-text">Subject</span>
                    <input
                      type="text"
                      className="input input-bordered input-sm"
                      value={messageForm.subject}
                      onChange={(event) =>
                        setMessageForm((current) => ({ ...current, subject: event.target.value }))
                      }
                      placeholder="Let&apos;s collaborate on a show"
                      required
                    />
                  </label>

                  <label className="form-control w-full text-sm">
                    <span className="label-text">Message</span>
                    <textarea
                      className="textarea textarea-bordered min-h-[120px]"
                      value={messageForm.body}
                      onChange={(event) =>
                        setMessageForm((current) => ({ ...current, body: event.target.value }))
                      }
                      placeholder="Share your idea, dates, or show concept."
                      required
                    />
                  </label>

                  <button type="submit" className="btn btn-primary btn-sm w-full">
                    Send message
                  </button>
                </form>
              ) : (
                <p className="text-sm text-base-content/70">
                  Connect with at least one comedian to unlock messaging. Once connected, you can coordinate directly from
                  here.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

