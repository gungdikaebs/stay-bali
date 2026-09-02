import { BadgeCheck, Ban, RotateCcw } from "lucide-react";
import { CancellationResolutionForm } from "@/components/booking/cancellation-resolution-form";
import { getAdminCancellationRequests } from "@/lib/cancellation/queries";
import { formatIdr, formatStayDate } from "@/lib/demo-stays";
import { generateIdempotencyKey } from "@/lib/idempotency";

export async function CancellationWorkspace() {
  const requests = await getAdminCancellationRequests();

  return (
    <section className="mx-auto mt-10 max-w-7xl rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">Cancellation desk</p><h2 className="font-display mt-2 text-2xl font-bold">Requests and manual refunds</h2><p className="mt-2 text-sm text-muted-foreground">Approval releases inventory. Eligible refunds require a manually recorded reference.</p></div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-teal-subtle text-primary"><RotateCcw className="size-5" /></span>
      </div>

      {requests.length ? <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {requests.map((request) => (
          <article className="rounded-2xl border border-border p-5" key={request.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="font-mono text-xs font-bold text-primary">{request.booking.bookingCode}</p><h3 className="mt-1 font-bold">{request.booking.propertyName}</h3><p className="mt-1 text-sm text-muted-foreground">{request.booking.roomName} · Check-in {formatStayDate(request.booking.checkinDate.toISOString().slice(0, 10))}</p></div>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${request.status === "PENDING" ? "bg-warning-subtle text-warning" : request.status === "APPROVED" ? "bg-success-subtle text-success" : "bg-red-50 text-red-700"}`}>{request.status === "REJECTED" ? <Ban className="size-3.5" /> : <BadgeCheck className="size-3.5" />}{request.status.toLowerCase()}</span>
            </div>
            <div className="mt-4 rounded-xl bg-secondary p-4 text-sm leading-6">
              <p><strong>{request.requester.name}</strong> · {request.requester.email}</p>
              <p className="mt-2 text-muted-foreground">{request.reason}</p>
              <p className="mt-3 font-semibold">{request.eligibleForFullRefund ? `Eligible for ${formatIdr(request.requestedRefundAmount)} full refund` : "Outside the three-day full-refund window"}</p>
            </div>
            {request.status === "PENDING" ? <CancellationResolutionForm eligibleForFullRefund={request.eligibleForFullRefund} idempotencyKey={generateIdempotencyKey()} requestId={request.id} /> : <div className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground"><p>{request.resolutionNote}</p>{request.refund ? <p className="mt-2 font-medium text-foreground">Refund {formatIdr(request.refund.amount)} · {request.refund.reference}</p> : null}</div>}
          </article>
        ))}
      </div> : <p className="mt-6 rounded-xl bg-secondary p-6 text-center text-sm text-muted-foreground">No cancellation requests yet.</p>}
    </section>
  );
}
