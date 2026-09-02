import { Badge } from "@/components/ui/badge";

const labels: Record<string, string> = {
  ACTIVE: "Active",
  PENDING: "Pending",
  SUSPENDED: "Suspended",
  REJECTED: "Rejected",
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  PUBLISHED: "Published",
  PENDING_PAYMENT: "Payment pending",
  CONFIRMED: "Confirmed",
  PAYMENT_FAILED: "Payment failed",
  EXPIRED: "Expired",
  CANCELLATION_REQUESTED: "Cancellation requested",
  CANCELLED: "Cancelled",
  REFUND_PENDING: "Refund in progress",
  REFUNDED: "Refunded",
  CHECKED_IN: "Checked in",
  COMPLETED: "Completed",
  APPROVED: "Approved",
  FAILED: "Failed",
  SENT: "Sent",
  PROCESSING: "Processing",
};

function variantFor(status: string): "secondary" | "success" | "warning" | "destructive" | "info" | "outline" {
  if (["ACTIVE", "PUBLISHED", "CONFIRMED", "COMPLETED", "APPROVED", "SENT"].includes(status)) return "success";
  if (["PENDING", "PENDING_REVIEW", "PENDING_PAYMENT", "CANCELLATION_REQUESTED", "REFUND_PENDING", "PROCESSING"].includes(status)) return "warning";
  if (["PAYMENT_FAILED", "FAILED", "REJECTED", "SUSPENDED"].includes(status)) return "destructive";
  if (["CHECKED_IN", "REFUNDED"].includes(status)) return "info";
  if (["DRAFT", "EXPIRED", "CANCELLED"].includes(status)) return "secondary";
  return "outline";
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge className={className} variant={variantFor(status)}>
      <span className="size-1.5 rounded-full bg-current opacity-75" aria-hidden="true" />
      {labels[status] ?? status.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase())}
    </Badge>
  );
}
