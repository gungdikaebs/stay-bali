import type { Metadata } from "next";
import { AlertCircle, CheckCircle2, Clock3, MailWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Notification jobs",
  description: "Monitor StayBali email outbox and delivery failures.",
};

function maskEmail(value: string) {
  const [name, domain] = value.split("@");
  if (!name || !domain) return "Hidden recipient";
  return `${name.slice(0, 1)}***@${domain}`;
}

function formatTimestamp(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Makassar",
  }).format(value);
}

export default async function NotificationJobsPage() {
  await requireAdmin();
  const isSinkTransport = (process.env.EMAIL_TRANSPORT ?? "sink") === "sink";
  const since = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const [pendingOutbox, failedOutbox, failedDeliveries, sentLastDay, recentFailures] = await Promise.all([
    prisma.outboxEvent.count({ where: { status: "PENDING" } }),
    prisma.outboxEvent.count({ where: { status: "FAILED" } }),
    prisma.emailDelivery.count({ where: { status: "FAILED" } }),
    prisma.emailDelivery.count({ where: { status: "SENT", sentAt: { gte: since } } }),
    prisma.emailDelivery.findMany({
      where: { status: "FAILED" },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        recipient: true,
        template: true,
        attempts: true,
        maxAttempts: true,
        lastError: true,
        nextAttemptAt: true,
        updatedAt: true,
        outboxEvent: { select: { aggregateId: true } },
      },
    }),
  ]);

  const metrics = [
    { label: "Pending outbox", value: pendingOutbox, icon: Clock3, accent: "bg-warning-subtle text-warning" },
    { label: "Dispatch failures", value: failedOutbox, icon: AlertCircle, accent: "bg-destructive-subtle text-destructive" },
    { label: "Delivery failures", value: failedDeliveries, icon: MailWarning, accent: "bg-destructive-subtle text-destructive" },
    { label: "Processed in 24 hours", value: sentLastDay, icon: CheckCircle2, accent: "bg-success-subtle text-success" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">Operations</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">Notification jobs</h1>
      <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">Monitor transactional email dispatch and delivery. Jobs retry automatically with exponential backoff up to five attempts.</p>
      <div className={`mt-5 rounded-xl border px-4 py-3 text-sm ${isSinkTransport ? "border-info/20 bg-info-subtle text-info" : "border-success/20 bg-success-subtle text-success"}`}>
        <strong>{isSinkTransport ? "Sink transport:" : "SMTP transport:"}</strong> {isSinkTransport ? "messages are processed without external delivery." : "messages are delivered through the configured SMTP provider."}
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Notification metrics">
        {metrics.map(({ label, value, icon: Icon, accent }) => (
          <article className="rounded-2xl border border-border bg-white p-5 shadow-sm" key={label}>
            <span className={`flex size-10 items-center justify-center rounded-xl ${accent}`}><Icon className="size-5" aria-hidden="true" /></span>
            <p className="font-display mt-5 text-4xl font-extrabold tracking-[-0.04em]">{value}</p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">{label}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <h2 className="font-display text-xl font-extrabold">Recent delivery failures</h2>
          <p className="mt-1 text-sm text-muted-foreground">Recipient addresses are masked. Inspect worker logs using the job ID for deeper diagnostics.</p>
        </div>
        {recentFailures.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-6">
            <CheckCircle2 className="mx-auto size-9 text-success" aria-hidden="true" />
            <p className="mt-3 font-bold">No failed email deliveries</p>
            <p className="mt-1 text-sm text-muted-foreground">New failures will appear here without exposing message content.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentFailures.map((delivery) => (
              <article className="grid gap-3 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-6" key={delivery.id}>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="destructive">Failed</Badge>
                    <p className="font-bold">{delivery.template.replaceAll("_", " ")}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{maskEmail(delivery.recipient)} · Booking {delivery.outboxEvent.aggregateId}</p>
                  <p className="mt-2 break-words text-sm text-destructive">{delivery.lastError ?? "No error detail was recorded."}</p>
                </div>
                <div className="text-sm sm:text-right">
                  <p className="font-bold">Attempt {delivery.attempts} of {delivery.maxAttempts}</p>
                  <p className="mt-1 text-muted-foreground">Updated {formatTimestamp(delivery.updatedAt)}</p>
                  {delivery.nextAttemptAt ? <p className="mt-1 text-warning">Retry {formatTimestamp(delivery.nextAttemptAt)}</p> : <p className="mt-1 text-destructive">Retries exhausted</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
