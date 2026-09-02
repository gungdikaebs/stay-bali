import "server-only";

import type { Job } from "bullmq";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createEmailAdapter } from "./email-adapter";
import { bookingEmailTopics } from "./events";
import { renderBookingEmail, type BookingEmailTemplate } from "./templates";

const jobDataSchema = z.object({ outboxEventId: z.string().min(1).max(30) }).strict();
const payloadSchema = z.object({ bookingId: z.string().min(1).max(30) }).strict();

const templateByTopic: Record<string, BookingEmailTemplate> = {
  [bookingEmailTopics.confirmed]: "BOOKING_CONFIRMED",
  [bookingEmailTopics.cancellationRequested]: "CANCELLATION_REQUESTED",
  [bookingEmailTopics.cancelled]: "BOOKING_CANCELLED",
  [bookingEmailTopics.refunded]: "BOOKING_REFUNDED",
};

function safeError(error: unknown) {
  return (error instanceof Error ? error.message : "Unknown email error").slice(0, 1000);
}

export async function processEmailJob(job: Job<{ outboxEventId: string }>) {
  const { outboxEventId } = jobDataSchema.parse(job.data);
  const event = await prisma.outboxEvent.findUnique({ where: { id: outboxEventId } });
  if (!event) throw new Error("Outbox event was not found.");
  const template = templateByTopic[event.topic];
  if (!template) throw new Error("Unsupported email event topic.");
  const { bookingId } = payloadSchema.parse(event.payload);
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      bookingCode: true,
      propertyName: true,
      roomName: true,
      guestName: true,
      guestEmail: true,
      checkinDate: true,
      checkoutDate: true,
      grandTotal: true,
    },
  });
  if (!booking) throw new Error("Booking for email delivery was not found.");

  const existing = await prisma.emailDelivery.findUnique({ where: { outboxEventId } });
  if (existing?.status === "SENT") return { messageId: existing.providerMessageId };
  const attempt = (existing?.attempts ?? 0) + 1;
  await prisma.emailDelivery.upsert({
    where: { outboxEventId },
    create: {
      outboxEventId,
      recipient: booking.guestEmail,
      template,
      status: "PROCESSING",
      attempts: attempt,
    },
    update: {
      status: "PROCESSING",
      attempts: attempt,
      lastError: null,
      nextAttemptAt: null,
    },
  });

  try {
    const email = renderBookingEmail(template, booking, process.env.APP_URL ?? "http://localhost:3000");
    const result = await createEmailAdapter().send({
      eventId: event.id,
      to: booking.guestEmail,
      ...email,
    });
    await prisma.emailDelivery.update({
      where: { outboxEventId },
      data: {
        status: "SENT",
        providerMessageId: result.messageId,
        sentAt: new Date(),
        lastError: null,
        nextAttemptAt: null,
      },
    });
    return result;
  } catch (error) {
    const maxAttempts = typeof job.opts.attempts === "number" ? job.opts.attempts : 5;
    const finalAttempt = job.attemptsMade + 1 >= maxAttempts;
    await prisma.emailDelivery.update({
      where: { outboxEventId },
      data: {
        status: "FAILED",
        lastError: safeError(error),
        nextAttemptAt: finalAttempt ? null : new Date(Date.now() + 5_000 * 2 ** job.attemptsMade),
      },
    });
    throw error;
  }
}
