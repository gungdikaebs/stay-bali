import type { DemoStay } from "@/lib/demo-stays";

export function createBookingSummary(stay: DemoStay, nights: number) {
  const subtotal = stay.pricePerNight * nights;
  const serviceFee = Math.round(subtotal * 0.05);

  return {
    subtotal,
    serviceFee,
    total: subtotal + serviceFee,
  };
}
