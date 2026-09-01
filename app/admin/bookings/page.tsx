import type { Metadata } from "next";
import { ReservationsWorkspace } from "@/components/booking/reservations-workspace";

export const metadata: Metadata = {
  title: "Booking operations",
};

export default function AdminBookingsPage() {
  return <ReservationsWorkspace eyebrow="Marketplace operations" />;
}
