import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  getGigById,
  getUserById,
  listBookingsForThread,
  listMessagesForThread,
  listOffersForThread,
  listReviewsForGig,
  listThreadsForUser,
  scheduleReviewRemindersForPastBookings
} from "@/lib/dataStore";
import { SAFETY_TIPS } from "@/lib/config/commerce";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThreadOffersPanel } from "./ThreadOffersPanel";

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sign in to view messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>You need an account to access the messaging center.</p>
          <Link className="text-brand" href="/auth/sign-in">
            Go to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  await scheduleReviewRemindersForPastBookings();

  const threads = await listThreadsForUser(session.user.id);
  if (threads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your inbox is quiet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>No conversations yet. Start by applying to a gig or messaging a comedian.</p>
          <div>
            <h2 className="text-xs uppercase tracking-wide text-slate-500">Safety tips</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {SAFETY_TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hydrated = await Promise.all(
    threads.map(async (thread) => {
      const gig = await getGigById(thread.gigId);
      const participants = await Promise.all(thread.participantIds.map((id) => getUserById(id)));
      const messages = await listMessagesForThread(thread.id);
      const offers = await listOffersForThread(thread.id);
      const reviews = await listReviewsForGig(thread.gigId);
      return {
        thread,
        gig,
        participants: participants.filter((value): value is NonNullable<typeof value> => Boolean(value)),
        messages,
        offers,
        bookings: await listBookingsForThread(thread.id),
        reviews
      };
    })
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Threads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          {hydrated.map(({ thread, gig }) => (
            <div key={thread.id} className="rounded-md border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{gig?.title ?? "Private gig"}</span>
                <Badge variant="outline">{thread.state}</Badge>
              </div>
              <p className="text-xs text-slate-500">Last message {thread.lastMessageAt.toLocaleString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {hydrated.map(({ thread, gig, participants, messages, offers, bookings, reviews }) => (
          <Card key={thread.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                <span>{gig?.title ?? "Gig conversation"}</span>
                <Badge variant="secondary">{participants.length} participants</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-900">
                <strong className="block text-amber-900">Payment protection</strong>
                Keep communication on The Funny to qualify for payout coverage and dispute support.
              </div>

              <div className="space-y-3">
                {messages.map((message) => {
                  const sender = participants.find((user) => user.id === message.senderId);
                  const offer = offers.find((item) => item.id === message.offerId);
                  return (
                    <div key={message.id} className="rounded-md border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{sender?.name ?? "System"}</span>
                        <span className="text-xs text-slate-500">{message.createdAt.toLocaleString()}</span>
                      </div>
                      {message.body && <p className="mt-2 whitespace-pre-line text-slate-700">{message.body}</p>}
                      {offer && (
                        <div className="mt-3 rounded-md bg-brand/5 p-2 text-xs text-brand">
                          Offer attached – review the timeline below for full details.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <ThreadOffersPanel
                bookings={bookings.map((booking) => ({
                  id: booking.id,
                  offerId: booking.offerId,
                  status: booking.status,
                  payoutProtection: booking.payoutProtection,
                  cancellationPolicy: booking.cancellationPolicy,
                  createdAtISO: booking.createdAt.toISOString()
                }))}
                currentUserId={session.user.id}
                currentUserRole={session.user.role}
                threadId={thread.id}
                gigId={thread.gigId}
                offers={offers.map((offer) => ({
                  id: offer.id,
                  fromUserId: offer.fromUserId,
                  amount: offer.amount,
                  currency: offer.currency,
                  terms: offer.terms,
                  eventDateISO: offer.eventDate.toISOString(),
                  expiresAtISO: offer.expiresAt ? offer.expiresAt.toISOString() : null,
                  status: offer.status,
                  createdAtISO: offer.createdAt.toISOString()
                }))}
                reviews={reviews.map((review) => ({
                  id: review.id,
                  authorUserId: review.authorUserId,
                  subjectUserId: review.subjectUserId,
                  gigId: review.gigId,
                  rating: review.rating,
                  comment: review.comment,
                  createdAtISO: review.createdAt.toISOString()
                }))}
                participants={participants.map((participant) => ({
                  id: participant.id,
                  name: participant.name,
                  role: participant.role
                }))}
              />

              <div>
                <h3 className="text-xs uppercase tracking-wide text-slate-500">Safety tips</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600">
                  {SAFETY_TIPS.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
