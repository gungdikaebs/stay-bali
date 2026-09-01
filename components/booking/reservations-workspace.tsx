import { CalendarCheck2, PlusCircle } from "lucide-react";
import { ManualBookingForm } from "@/components/booking/manual-booking-form";
import { formatIdr, formatStayDate } from "@/lib/demo-stays";
import { getBookingOperationsWorkspace } from "@/lib/booking/queries";
import { generateIdempotencyKey } from "@/lib/idempotency";

const statusStyle: Record<string, string> = {
  PENDING_PAYMENT: "bg-warning-subtle text-warning",
  CONFIRMED: "bg-success-subtle text-success",
  CHECKED_IN: "bg-brand-teal-subtle text-primary",
  COMPLETED: "bg-secondary text-foreground",
  PAYMENT_FAILED: "bg-red-50 text-red-700",
  EXPIRED: "bg-secondary text-muted-foreground",
  CANCELLATION_REQUESTED: "bg-warning-subtle text-warning",
  CANCELLED: "bg-red-50 text-red-700",
  REFUND_PENDING: "bg-warning-subtle text-warning",
  REFUNDED: "bg-secondary text-muted-foreground",
};

function statusLabel(value: string) {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

export async function ReservationsWorkspace({
  eyebrow,
}: {
  eyebrow: string;
}) {
  const workspace = await getBookingOperationsWorkspace();

  return (
    <div className="mx-auto max-w-7xl">
      <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">{eyebrow}</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold tracking-[-0.05em]">Reservations</h1>
      <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
        Create verified manual reservations and review recent booking activity. Availability and prices are always recalculated on the server.
      </p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:items-start">
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
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
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[booking.status] ?? "bg-secondary text-foreground"}`}>
                      {statusLabel(booking.status)}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 rounded-xl bg-secondary/70 p-4 text-sm sm:grid-cols-2">
                    <p><span className="block text-xs text-muted-foreground">Stay</span><strong>{booking.propertyName}</strong><br />{booking.roomName}</p>
                    <p><span className="block text-xs text-muted-foreground">Dates</span><strong>{formatStayDate(booking.checkinDate.toISOString().slice(0, 10))}</strong> → <strong>{formatStayDate(booking.checkoutDate.toISOString().slice(0, 10))}</strong></p>
                    <p><span className="block text-xs text-muted-foreground">Guests</span>{booking.adultCount} adults · {booking.childCount} children</p>
                    <p><span className="block text-xs text-muted-foreground">Total</span><strong>{formatIdr(booking.grandTotal)}</strong></p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="px-6 py-14 text-center text-sm text-muted-foreground">
              No reservations have been created in this workspace yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
