const locations = ["all", "ubud", "canggu", "seminyak", "uluwatu", "sanur"] as const;
const propertyTypes = ["all", "villa", "hotel", "homestay"] as const;
const sortOptions = ["recommended", "price-low", "price-high"] as const;

type RawSearchParams = Record<string, string | string[] | undefined>;

export type SearchValues = {
  location: (typeof locations)[number];
  checkin: string;
  checkout: string;
  guests: number;
  type: (typeof propertyTypes)[number];
  sort: (typeof sortOptions)[number];
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isOneOf<T extends readonly string[]>(
  value: string | undefined,
  options: T,
): value is T[number] {
  return value !== undefined && options.includes(value as T[number]);
}

function isDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function nightsBetween(checkin: string, checkout: string) {
  const start = Date.parse(`${checkin}T00:00:00Z`);
  const end = Date.parse(`${checkout}T00:00:00Z`);
  return Math.round((end - start) / 86_400_000);
}

function baliToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function parseSearchQuery(raw: RawSearchParams) {
  const rawLocation = first(raw.location)?.toLowerCase();
  const rawType = first(raw.type)?.toLowerCase();
  const rawSort = first(raw.sort)?.toLowerCase();
  const checkin = first(raw.checkin) ?? "";
  const checkout = first(raw.checkout) ?? "";
  const parsedGuests = Number.parseInt(first(raw.guests) ?? "2", 10);
  const errors: string[] = [];

  const values: SearchValues = {
    location: isOneOf(rawLocation, locations) ? rawLocation : "all",
    checkin,
    checkout,
    guests: Number.isInteger(parsedGuests) && parsedGuests >= 1 && parsedGuests <= 10
      ? parsedGuests
      : 2,
    type: isOneOf(rawType, propertyTypes) ? rawType : "all",
    sort: isOneOf(rawSort, sortOptions) ? rawSort : "recommended",
  };

  let nights: number | null = null;

  if (checkin || checkout) {
    if (!isDate(checkin) || !isDate(checkout)) {
      errors.push("Choose a valid check-in and check-out date.");
    } else {
      nights = nightsBetween(checkin, checkout);
      if (checkin < baliToday()) errors.push("Check-in cannot be in the past.");
      if (nights < 1) errors.push("Check-out must be after check-in.");
      if (nights > 30) errors.push("A stay can be up to 30 nights.");
    }
  }

  return { values, nights, errors };
}
