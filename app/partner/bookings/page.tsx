import type { Metadata } from "next";
import { ReservationsWorkspace } from "@/components/booking/reservations-workspace";
import { CancellationWorkspace } from "@/components/booking/cancellation-workspace";

export const metadata: Metadata = {
  title: "Partner reservations",
};

export default function PartnerBookingsPage() {
  return <><ReservationsWorkspace eyebrow="Partner operations" /><CancellationWorkspace audience="PARTNER" /></>;
}
