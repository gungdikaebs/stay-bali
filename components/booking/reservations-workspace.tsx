import Link from "next/link";
import { AlertTriangle, CalendarCheck2, DoorOpen, PlusCircle, ReceiptText } from "lucide-react";
import { ManualBookingForm } from "@/components/booking/manual-booking-form";
import { BookingOperationForm } from "@/components/booking/booking-operation-form";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { formatIdr, formatStayDate } from "@/lib/demo-stays";
import { getBookingOperationsWorkspace } from "@/lib/booking/queries";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { canIssueVoucher } from "@/lib/booking/rules";

export async function ReservationsWorkspace({
  eyebrow,
}: {
  eyebrow: string;
}) {
  const workspace = await getBookingOperationsWorkspace();
  const activeReservations = workspace.bookings.filter((booking) => booking.status === "CONFIRMED" || booking.status === "CHECKED_IN").length;
  const needsAttention = workspace.bookings.filter((booking) => ["PENDING_PAYMENT", "PAYMENT_FAILED", "CANCELLATION_REQUESTED"].includes(booking.status)).length;

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader description="Create verified manual reservations, prepare arrivals, and review booking activity. Availability and prices are recalculated on the server." eyebrow={eyebrow} title="Reservations" />

      <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Reservation summary">
        <MetricCard accent="neutral" helper="Latest records in your authorized scope" icon={CalendarCheck2} label="Recent reservations" value={workspace.bookings.length} />
        <MetricCard accent="green" helper="Confirmed or currently checked in" icon={DoorOpen} label="Active stays" value={activeReservations} />
        <MetricCard accent={needsAttention ? "amber" : "teal"} helper="Payment or cancellation follow-up" icon={AlertTriangle} label="Needs attention" value={needsAttention} />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:items-start">
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6 xl:sticky xl:top-28">
          <div className="mb-6 flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal-subtle text-primary">
              <PlusCircle className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold">New manual reservation</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Intended for walk-ins, phone bookings, or verified offline payments.
              </p>
            </div>
          </div>
          <ManualBookingForm
            idempotencyKey={generateIdempotencyKey()}
            rooms={workspace.rooms}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-display text-xl font-bold">Recent reservations</h2>
              <p className="mt-1 text-sm text-muted-foreground">Latest 50 bookings in your authorized scope.</p>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <CalendarCheck2 className="size-5" aria-hidden="true" />
            </span>
          </div>

          {workspace.bookings.length ? (
            <div className="divide-y divide-border">
              {workspace.bookings.map((booking) => (
                <article className="p-5 sm:p-6" key={booking.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold tracking-[0.08em] text-primary">{booking.bookingCode}</p>
                      <h3 className="mt-1 font-bold">{booking.guestName}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{booking.guestEmail}</p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="mt-4 grid gap-3 rounded-xl bg-secondary/70 p-4 text-sm sm:grid-cols-2">
                    <p><span className="block text-xs text-muted-foreground">Stay</span><strong>{booking.propertyName}</strong><br />{booking.roomName}</p>
                    <p><span className="block text-xs text-muted-foreground">Dates</span><strong>{formatStayDate(booking.checkinDate.toISOString().slice(0, 10))}</strong> → <strong>{formatStayDate(booking.checkoutDate.toISOString().slice(0, 10))}</strong></p>
                    <p><span className="block text-xs text-muted-foreground">Guests</span>{booking.adultCount} adults · {booking.childCount} children</p>
                    <p><span className="block text-xs text-muted-foreground">Total</span><strong>{formatIdr(booking.grandTotal)}</strong></p>
                  </div>
                  {booking.status === "CONFIRMED" ? (
                    <BookingOperationForm bookingId={booking.id} nextStatus="CHECKED_IN" />
                  ) : booking.status === "CHECKED_IN" ? (
                    <BookingOperationForm bookingId={booking.id} nextStatus="COMPLETED" />
                  ) : null}
                  {workspace.canViewAllVouchers && canIssueVoucher(booking.status) ? <Button asChild className="mt-4" size="sm" variant="outline"><Link href={`/bookings/${encodeURIComponent(booking.id)}/voucher`}><ReceiptText className="size-4 text-primary" aria-hidden="true" />View voucher</Link></Button> : null}
                </article>
              ))}
            </div>
          ) : (
            <EmptyState description="Online and verified manual bookings will appear here." icon={CalendarCheck2} title="No reservations yet" />
          )}
        </section>
      </div>
    </div>
  );
}
