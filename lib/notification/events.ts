import "server-only";

import type { Prisma } from "@/generated/prisma/client";

export const bookingEmailTopics = {
  confirmed: "email.booking.confirmed",
  cancellationRequested: "email.booking.cancellation-requested",
  cancelled: "email.booking.cancelled",
  refunded: "email.booking.refunded",
} as const;

export type BookingEmailTopic = typeof bookingEmailTopics[keyof typeof bookingEmailTopics];

export async function enqueueBookingEmail(
  tx: Prisma.TransactionClient,
  input: { bookingId: string; topic: BookingEmailTopic; dedupeKey?: string },
) {
  return tx.outboxEvent.create({
    data: {
      eventKey: `${input.topic}:${input.dedupeKey ?? input.bookingId}`,
      topic: input.topic,
      aggregateType: "BOOKING",
      aggregateId: input.bookingId,
      payload: { bookingId: input.bookingId },
    },
  });
}
