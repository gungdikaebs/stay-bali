import { BadgeCheck, Ban, RotateCcw } from "lucide-react";
import { CancellationResolutionForm } from "@/components/booking/cancellation-resolution-form";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { getCancellationReviewRequests } from "@/lib/cancellation/queries";
import { formatIdr, formatStayDate } from "@/lib/demo-stays";
import { generateIdempotencyKey } from "@/lib/idempotency";

export async function CancellationWorkspace({ audience }: { audience: "ADMIN" | "PARTNER" }) {
  const requests = await getCancellationReviewRequests(audience);
  const partnerView = audience === "PARTNER";
  return (
    <section className="mx-auto mt-8 max-w-[1500px] rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">Cancellation exceptions</p>
          <h2 className="font-display mt-2 text-2xl font-bold">{partnerView ? "Guest waiver requests" : "Cancellation escalations"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{partnerView ? "Approve or reject requests outside the global three-day refund policy." : "Review Partner-initiated online cancellations and guest exceptions pending for more than 24 hours."}</p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-teal-subtle text-primary"><RotateCcw className="size-5" /></span>
      </div>
      {requests.length ? <div className="mt-6 grid gap-5 lg:grid-cols-2">{requests.map((request) => (
        <article className="rounded-2xl border border-border p-5" key={request.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="font-mono text-xs font-bold text-primary">{request.booking.bookingCode}</p><h3 className="mt-1 font-bold">{request.booking.propertyName}</h3><p className="mt-1 text-sm text-muted-foreground">{request.booking.roomName} · Check-in {formatStayDate(request.booking.checkinDate.toISOString().slice(0, 10))}</p></div>
            <span className="inline-flex items-center gap-1">{request.status === "REJECTED" ? <Ban className="size-3.5 text-destructive" /> : <BadgeCheck className="size-3.5 text-primary" />}<StatusBadge status={request.status} /></span>
          </div>
          <div className="mt-4 rounded-xl bg-secondary p-4 text-sm leading-6">
            <p><strong>{request.requester.name}</strong> · {request.requester.email}</p>
            <p className="mt-2 text-muted-foreground">{request.reason}</p>
            <p className="mt-3 font-semibold">Approval issues an automatic demo refund of {formatIdr(request.requestedRefundAmount)}.</p>
          </div>
          {request.status === "PENDING" ? <CancellationResolutionForm approveLabel={partnerView ? "Approve waiver & refund" : "Approve cancellation & refund"} idempotencyKey={generateIdempotencyKey()} requestId={request.id} /> : <div className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground"><p>{request.resolutionNote}</p>{request.refund ? <p className="mt-2 font-medium text-foreground">Refund {formatIdr(request.refund.amount)} · {request.refund.reference}</p> : null}</div>}
        </article>
      ))}</div> : <div className="mt-6 rounded-2xl bg-secondary/50"><EmptyState description={partnerView ? "Guest policy-exception requests for your properties will appear here." : "Partner requests and overdue guest exceptions will appear here."} icon={RotateCcw} title="No cancellation exceptions" /></div>}
    </section>
  );
}
