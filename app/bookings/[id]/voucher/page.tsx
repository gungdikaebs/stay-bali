import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CircleCheck, MapPin, ReceiptText, UsersRound } from "lucide-react";
import { PrintVoucherButton } from "@/components/booking/print-voucher-button";
import { StayBaliLogo } from "@/components/landing/public-header";
import { getVoucherBooking } from "@/lib/booking/queries";
import { canIssueVoucher } from "@/lib/booking/rules";
import { formatIdr, formatStayDate } from "@/lib/demo-stays";

export const metadata: Metadata = {
  title: "Booking voucher",
  description: "Printable StayBali booking voucher.",
};

export default async function VoucherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await getVoucherBooking(id);
  if (!booking || !canIssueVoucher(booking.status)) notFound();

  const checkin = booking.checkinDate.toISOString().slice(0, 10);
  const checkout = booking.checkoutDate.toISOString().slice(0, 10);
  const payment = booking.paymentAttempts[0];
  const backHref = booking.viewerRole === "ADMIN" ? "/admin/bookings" : "/account";

  return (
    <main className="min-h-screen bg-brand-sand py-8 sm:py-12 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-5 flex max-w-[860px] items-center justify-between gap-4 px-4 sm:px-0">
        <Link className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-primary hover:bg-white" href={backHref}><ArrowLeft className="size-4" />Back to bookings</Link>
        <PrintVoucherButton />
      </div>

      <article className="voucher-shell mx-auto max-w-[860px] overflow-hidden border border-border bg-white shadow-search print:border-0 print:shadow-none">
        <header className="flex flex-col justify-between gap-6 border-b border-border p-6 sm:flex-row sm:items-start sm:p-10">
          <div>
            <StayBaliLogo />
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-primary">Official booking voucher</p>
          </div>
          <div className="sm:text-right">
            <span className="inline-flex items-center gap-2 rounded-full bg-success-subtle px-3 py-1.5 text-xs font-bold text-success"><CircleCheck className="size-4" />{booking.status.toLowerCase().replaceAll("_", " ")}</span>
            <p className="mt-3 font-mono text-lg font-bold tracking-[0.06em]">{booking.bookingCode}</p>
            <p className="mt-1 text-xs text-muted-foreground">Booked {booking.createdAt.toLocaleDateString("en-ID", { dateStyle: "medium" })}</p>
          </div>
        </header>

        <section className="grid gap-8 p-6 sm:grid-cols-2 sm:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">Stay</p>
            <h1 className="font-display mt-2 text-3xl font-extrabold tracking-[-0.04em]">{booking.propertyName}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4 text-primary" />{booking.roomName}</p>
          </div>
          <div className="rounded-2xl bg-secondary p-5">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Primary guest</p>
            <p className="mt-2 text-lg font-bold">{booking.guestName}</p>
            <p className="mt-1 text-sm text-muted-foreground">{booking.guestEmail}<br />{booking.guestPhone}</p>
          </div>
        </section>

        <section className="grid border-y border-border sm:grid-cols-3">
          <div className="p-6 sm:border-r sm:p-8"><CalendarDays className="size-5 text-primary" /><p className="mt-3 text-xs text-muted-foreground">Check-in</p><strong className="mt-1 block">{formatStayDate(checkin)}</strong></div>
          <div className="border-y border-border p-6 sm:border-x-0 sm:border-y-0 sm:border-r sm:p-8"><CalendarDays className="size-5 text-primary" /><p className="mt-3 text-xs text-muted-foreground">Check-out</p><strong className="mt-1 block">{formatStayDate(checkout)}</strong></div>
          <div className="p-6 sm:p-8"><UsersRound className="size-5 text-primary" /><p className="mt-3 text-xs text-muted-foreground">Guests</p><strong className="mt-1 block">{booking.adultCount} adults · {booking.childCount} children</strong></div>
        </section>

        <section className="grid gap-8 p-6 sm:grid-cols-[minmax(0,1fr)_300px] sm:p-10">
          <div>
            <h2 className="flex items-center gap-2 font-display text-xl font-bold"><ReceiptText className="size-5 text-primary" />Nightly breakdown</h2>
            <div className="mt-5 divide-y divide-border border-y border-border text-sm">
              {booking.nights.map((night) => (
                <div className="flex justify-between gap-4 py-3" key={night.stayDate.toISOString()}><span className="text-muted-foreground">{formatStayDate(night.stayDate.toISOString().slice(0, 10))}</span><strong>{formatIdr(night.unitPrice)}</strong></div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-secondary p-5 text-sm">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">Stay</span><span>{formatIdr(booking.subtotal)}</span></div>
            <div className="mt-3 flex justify-between gap-4"><span className="text-muted-foreground">Service fee</span><span>{formatIdr(booking.serviceFee)}</span></div>
            <div className="mt-4 flex justify-between gap-4 border-t border-border pt-4 text-lg font-extrabold"><span>Total</span><span>{formatIdr(booking.grandTotal)}</span></div>
            {payment ? <p className="mt-4 break-all text-xs text-muted-foreground">Demo payment: {payment.providerReference}<br />Approved {payment.resolvedAt.toLocaleString("en-ID")}</p> : <p className="mt-4 text-xs text-muted-foreground">Confirmed as a manual reservation.</p>}
          </div>
        </section>

        <footer className="border-t border-border bg-secondary/60 p-6 text-sm leading-6 sm:p-10">
          <p><strong>Cancellation policy:</strong> {booking.cancellationPolicy}</p>
          {booking.specialRequest ? <p className="mt-3"><strong>Special request:</strong> {booking.specialRequest}</p> : null}
          <p className="mt-5 text-xs text-muted-foreground">Present this voucher and a matching guest ID at check-in. This document is generated from the immutable booking snapshot.</p>
        </footer>
      </article>
    </main>
  );
}
