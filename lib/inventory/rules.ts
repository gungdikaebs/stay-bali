const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

export type InventoryNight = {
  stayDate: Date | string;
  priceOverride: number | null;
  totalUnitsOverride: number | null;
  heldUnits: number;
  bookedUnits: number;
  stopSell: boolean;
};

export type StayPrice = {
  nightlyRates: { stayDate: string; price: number }[];
  subtotal: number;
  serviceFee: number;
  grandTotal: number;
  averageNightlyPrice: number;
};

function parseDateOnly(value: string) {
  if (!DATE_ONLY.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return date.toISOString().slice(0, 10) === value ? date : null;
}

export function formatStayDate(value: Date | string) {
  return typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
}

export function baliToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addUtcDays(dateOnly: string, days: number) {
  const date = parseDateOnly(dateOnly);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return formatStayDate(date);
}

export function listStayDates(checkin: string, checkout: string) {
  const start = parseDateOnly(checkin);
  const end = parseDateOnly(checkout);
  if (!start || !end || end <= start) return null;

  const nightCount = Math.round((end.getTime() - start.getTime()) / DAY_MS);
  if (nightCount < 1 || nightCount > 30) return null;

  return Array.from({ length: nightCount }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + index);
    return formatStayDate(date);
  });
}

export function listInclusiveDates(startDate: string, endDate: string) {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!start || !end || end < start) return null;

  const dayCount = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;
  if (dayCount > 90) return null;

  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + index);
    return date;
  });
}

export function calculateStayPrice(input: {
  checkin: string;
  checkout: string;
  basePrice: number;
  totalUnits: number;
  inventory: InventoryNight[];
}): StayPrice | null {
  const stayDates = listStayDates(input.checkin, input.checkout);
  if (!stayDates) return null;

  const inventoryByDate = new Map(
    input.inventory.map((night) => [formatStayDate(night.stayDate), night]),
  );
  const nightlyRates: StayPrice["nightlyRates"] = [];

  for (const stayDate of stayDates) {
    const override = inventoryByDate.get(stayDate);
    const sellableUnits = override?.totalUnitsOverride ?? input.totalUnits;
    const availableUnits = sellableUnits - (override?.heldUnits ?? 0) - (override?.bookedUnits ?? 0);
    if (override?.stopSell || availableUnits < 1) return null;

    nightlyRates.push({
      stayDate,
      price: override?.priceOverride ?? input.basePrice,
    });
  }

  const subtotal = nightlyRates.reduce((total, night) => total + night.price, 0);
  const serviceFee = Math.round(subtotal * 0.05);
  return {
    nightlyRates,
    subtotal,
    serviceFee,
    grandTotal: subtotal + serviceFee,
    averageNightlyPrice: Math.round(subtotal / nightlyRates.length),
  };
}
