"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookingStatus, OfferStatus, Role } from "@/lib/prismaEnums";

type OfferStatusValue = (typeof OfferStatus)[keyof typeof OfferStatus];
type BookingStatusValue = (typeof BookingStatus)[keyof typeof BookingStatus];

interface ParticipantSummary {
  id: string;
  name: string | null;
  role: string;
}

interface OfferSummary {
  id: string;
  fromUserId: string;
  amount: number;
  currency: string;
  terms: string;
  eventDateISO: string;
  expiresAtISO: string | null;
  status: OfferStatusValue;
  createdAtISO: string;
}

interface BookingSummary {
  id: string;
  offerId: string;
  status: BookingStatusValue;
  payoutProtection: boolean;
  cancellationPolicy: string;
  createdAtISO: string;
}

interface ThreadOffersPanelProps {
  threadId: string;
  gigId: string;
  currentUserId: string;
  currentUserRole: string;
  participants: ParticipantSummary[];
  offers: OfferSummary[];
  bookings: BookingSummary[];
}

interface ComposerState {
  amount: string;
  currency: string;
  terms: string;
  eventDate: string;
  expiresAt: string;
}

const defaultComposerState: ComposerState = {
  amount: "",
  currency: "USD",
  terms: "",
  eventDate: "",
  expiresAt: "",
};

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function formatCurrency(amountInCents: number, currency: string): string {
  if (!currencyFormatters.has(currency)) {
    currencyFormatters.set(
      currency,
      new Intl.NumberFormat("en-US", { style: "currency", currency })
    );
  }
  return currencyFormatters.get(currency)!.format(amountInCents / 100);
}

function formatDateTimeLabel(isoString: string): string {
  try {
    return format(new Date(isoString), "PPpp");
  } catch (error) {
    return isoString;
  }
}

function mapOfferResponse(offer: Record<string, unknown>): OfferSummary {
  return {
    id: String(offer.id ?? ""),
    fromUserId: String(offer.fromUserId ?? ""),
    amount: Number(offer.amount ?? 0),
    currency: String((offer.currency ?? "USD") as string).toUpperCase(),
    terms: String(offer.terms ?? ""),
    eventDateISO: String(offer.eventDate ?? ""),
    expiresAtISO: offer.expiresAt ? String(offer.expiresAt) : null,
    status: String(offer.status ?? "PENDING") as OfferStatusValue,
    createdAtISO: String(offer.createdAt ?? new Date().toISOString()),
  };
}

function mapBookingResponse(booking: Record<string, unknown>): BookingSummary {
  return {
    id: String(booking.id ?? ""),
    offerId: String(booking.offerId ?? ""),
    status: String(booking.status ?? "PENDING") as BookingStatusValue,
    payoutProtection: Boolean(booking.payoutProtection ?? false),
    cancellationPolicy: String(booking.cancellationPolicy ?? "STANDARD"),
    createdAtISO: String(booking.createdAt ?? new Date().toISOString()),
  };
}

export function ThreadOffersPanel({
  threadId,
  gigId,
  currentUserId,
  currentUserRole,
  participants,
  offers: initialOffers,
  bookings: initialBookings,
}: ThreadOffersPanelProps) {
  const [offers, setOffers] = useState<OfferSummary[]>(initialOffers);
  const [bookings, setBookings] = useState<BookingSummary[]>(initialBookings);
  const [composer, setComposer] = useState<ComposerState>(defaultComposerState);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [composerSuccess, setComposerSuccess] = useState<string | null>(null);
  const [composerSubmitting, setComposerSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    | { offerId: string; type: "accept" | "decline" | "booking" }
    | null
  >(null);

  const participantMap = useMemo(() => {
    return new Map(participants.map((participant) => [participant.id, participant]));
  }, [participants]);

  const sortedOffers = useMemo(() => {
    return [...offers].sort(
      (a, b) => new Date(a.createdAtISO).getTime() - new Date(b.createdAtISO).getTime()
    );
  }, [offers]);

  const bookingsByOfferId = useMemo(() => {
    return bookings.reduce<Record<string, BookingSummary>>((accumulator, booking) => {
      accumulator[booking.offerId] = booking;
      return accumulator;
    }, {});
  }, [bookings]);

  const comedian = useMemo(
    () => participants.find((participant) => participant.role === Role.COMEDIAN) ?? null,
    [participants]
  );

  const promoter = useMemo(
    () =>
      participants.find(
        (participant) => participant.role === Role.PROMOTER || participant.role === Role.VENUE
      ) ?? null,
    [participants]
  );

  const canComposeOffer =
    currentUserRole === Role.PROMOTER || currentUserRole === Role.VENUE;
  const canRespondToOffer = currentUserRole === Role.COMEDIAN;
  const canCreateBooking =
    currentUserRole === Role.PROMOTER || currentUserRole === Role.VENUE;

  async function handleComposerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setComposerError(null);
    setComposerSuccess(null);

    const parsedAmount = Number.parseFloat(composer.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setComposerError("Enter a valid offer amount.");
      return;
    }

    if (!composer.terms.trim()) {
      setComposerError("Add terms so the comedian knows the expectations.");
      return;
    }

    if (!composer.eventDate) {
      setComposerError("Select an event date.");
      return;
    }

    setComposerSubmitting(true);
    try {
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          amount: Math.round(parsedAmount * 100),
          currency: composer.currency.trim().toUpperCase(),
          terms: composer.terms,
          eventDateISO: new Date(composer.eventDate).toISOString(),
          expiresAtISO: composer.expiresAt ? new Date(composer.expiresAt).toISOString() : undefined,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error?.message ?? payload.error ?? "Failed to send offer.");
      }

      const payload = await response.json();
      if (!payload.offer) {
        throw new Error("Offer created but response was missing data.");
      }

      const offer = mapOfferResponse(payload.offer as Record<string, unknown>);
      setOffers((previous) => {
        const withoutCurrent = previous.filter((item) => item.id !== offer.id);
        return [...withoutCurrent, offer];
      });
      setComposerSuccess("Offer sent successfully.");
      setComposer(defaultComposerState);
    } catch (error) {
      setComposerError(error instanceof Error ? error.message : "Failed to send offer.");
    } finally {
      setComposerSubmitting(false);
    }
  }

  async function updateOfferStatus(offerId: string, status: OfferStatusValue) {
    setActionError(null);
    setPendingAction({ offerId, type: status === "ACCEPTED" ? "accept" : "decline" });
    try {
      const response = await fetch(`/api/offers/${offerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error?.message ?? payload.error ?? "Failed to update offer.");
      }

      const payload = await response.json();
      if (!payload.offer) {
        throw new Error("Offer updated but response was missing data.");
      }

      const offer = mapOfferResponse(payload.offer as Record<string, unknown>);
      setOffers((previous) =>
        previous.map((current) => (current.id === offer.id ? offer : current))
      );

      if (payload.booking) {
        const booking = mapBookingResponse(payload.booking as Record<string, unknown>);
        setBookings((previous) => {
          const withoutCurrent = previous.filter((item) => item.offerId !== booking.offerId);
          return [booking, ...withoutCurrent];
        });
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to update offer.");
    } finally {
      setPendingAction(null);
    }
  }

  async function handleCreateBooking(offerId: string) {
    if (!comedian || !promoter) {
      setActionError("Missing participant details to create a booking.");
      return;
    }

    setActionError(null);
    setPendingAction({ offerId, type: "booking" });

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gigId,
          comedianId: comedian.id,
          promoterId: promoter.id,
          offerId,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error?.message ?? payload.error ?? "Failed to create booking.");
      }

      const payload = await response.json();
      if (!payload.booking) {
        throw new Error("Booking created but response was missing data.");
      }

      const booking = mapBookingResponse(payload.booking as Record<string, unknown>);
      setBookings((previous) => {
        const withoutCurrent = previous.filter((item) => item.offerId !== booking.offerId);
        return [booking, ...withoutCurrent];
      });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to create booking.");
    } finally {
      setPendingAction(null);
    }
  }

  function isActionPending(offerId: string, type: "accept" | "decline" | "booking") {
    return pendingAction?.offerId === offerId && pendingAction?.type === type;
  }

  return (
    <div className="space-y-5">
      {canComposeOffer && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Send a new offer</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleComposerSubmit}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Amount</span>
                  <Input
                    inputMode="decimal"
                    min="0"
                    name="amount"
                    onChange={(event) =>
                      setComposer((previous) => ({ ...previous, amount: event.target.value }))
                    }
                    placeholder="450"
                    required
                    step="0.01"
                    type="number"
                    value={composer.amount}
                  />
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-700">Currency</span>
                  <Input
                    maxLength={3}
                    minLength={3}
                    name="currency"
                    onChange={(event) =>
                      setComposer((previous) => ({ ...previous, currency: event.target.value }))
                    }
                    placeholder="USD"
                    required
                    value={composer.currency}
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Event date</span>
                <Input
                  name="eventDate"
                  onChange={(event) =>
                    setComposer((previous) => ({ ...previous, eventDate: event.target.value }))
                  }
                  required
                  type="datetime-local"
                  value={composer.eventDate}
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Offer expires (optional)</span>
                <Input
                  name="expiresAt"
                  onChange={(event) =>
                    setComposer((previous) => ({ ...previous, expiresAt: event.target.value }))
                  }
                  type="datetime-local"
                  value={composer.expiresAt}
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-700">Terms</span>
                <Textarea
                  name="terms"
                  onChange={(event) =>
                    setComposer((previous) => ({ ...previous, terms: event.target.value }))
                  }
                  placeholder="Set length, arrival time, payout details, etc."
                  required
                  rows={4}
                  value={composer.terms}
                />
              </label>

              {composerError && (
                <p className="text-sm text-red-600" role="alert">
                  {composerError}
                </p>
              )}
              {composerSuccess && (
                <p className="text-sm text-emerald-600" role="status">
                  {composerSuccess}
                </p>
              )}

              <div className="flex justify-end">
                <Button disabled={composerSubmitting} type="submit">
                  {composerSubmitting ? "Sending…" : "Send offer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Offer timeline</h3>
          <span className="text-xs text-slate-500">
            {sortedOffers.length === 0
              ? "No offers yet"
              : `${sortedOffers.length} offer${sortedOffers.length === 1 ? "" : "s"}`}
          </span>
        </div>

        {actionError && (
          <p className="text-sm text-red-600" role="alert">
            {actionError}
          </p>
        )}

        <ol className="space-y-3">
          {sortedOffers.map((offer) => {
            const author = participantMap.get(offer.fromUserId);
            const booking = bookingsByOfferId[offer.id];
            const isIncomingOffer = offer.fromUserId !== currentUserId;
            const showResponseButtons =
              canRespondToOffer && offer.status === OfferStatus.PENDING && isIncomingOffer;
            const showBookingPrompt =
              canCreateBooking && offer.status === OfferStatus.ACCEPTED && !booking;

            return (
              <li key={offer.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {formatCurrency(offer.amount, offer.currency)} offer
                    </p>
                    <p className="text-xs text-slate-500">
                      Sent {formatDateTimeLabel(offer.createdAtISO)}
                      {author ? ` by ${author.name ?? "Unnamed user"}` : ""}
                    </p>
                  </div>
                  <Badge variant={offer.status === OfferStatus.ACCEPTED ? "default" : "outline"}>
                    {offer.status}
                  </Badge>
                </div>

                <dl className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-slate-700">Event date</dt>
                    <dd>{formatDateTimeLabel(offer.eventDateISO)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-700">Expires</dt>
                    <dd>{offer.expiresAtISO ? formatDateTimeLabel(offer.expiresAtISO) : "No expiry"}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-slate-700">Terms</dt>
                    <dd className="whitespace-pre-wrap text-slate-700">{offer.terms}</dd>
                  </div>
                </dl>

                {showResponseButtons && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      disabled={isActionPending(offer.id, "accept")}
                      onClick={() => updateOfferStatus(offer.id, OfferStatus.ACCEPTED)}
                    >
                      {isActionPending(offer.id, "accept") ? "Accepting…" : "Accept"}
                    </Button>
                    <Button
                      disabled={isActionPending(offer.id, "decline")}
                      onClick={() => updateOfferStatus(offer.id, OfferStatus.DECLINED)}
                      variant="outline"
                    >
                      {isActionPending(offer.id, "decline") ? "Declining…" : "Decline"}
                    </Button>
                  </div>
                )}

                {showBookingPrompt && (
                  <div className="mt-4 rounded-md border border-brand/30 bg-brand/5 p-3">
                    <p className="text-sm font-medium text-slate-800">
                      The comedian accepted this offer. Create a booking to lock it in.
                    </p>
                    <Button
                      className="mt-3"
                      disabled={isActionPending(offer.id, "booking")}
                      onClick={() => handleCreateBooking(offer.id)}
                    >
                      {isActionPending(offer.id, "booking") ? "Creating…" : "Create booking"}
                    </Button>
                  </div>
                )}

                {booking && (
                  <Card className="mt-4 border-slate-200">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Booking status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">Status</span>
                        <Badge variant="secondary">{booking.status}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">Created</span>
                        <span>{formatDateTimeLabel(booking.createdAtISO)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">Payout protection</span>
                        <span>{booking.payoutProtection ? "Enabled" : "Disabled"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">Cancellation policy</span>
                        <span className="uppercase">{booking.cancellationPolicy}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

