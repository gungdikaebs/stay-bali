import { addUtcDays, baliToday } from "@/lib/inventory/rules";

const locations = ["all", "ubud", "canggu", "seminyak", "uluwatu", "sanur"] as const;
const propertyTypes = ["all", "villa", "hotel", "homestay"] as const;
const sortOptions = ["recommended", "price-low", "price-high"] as const;

type RawSearchParams = Record<string, string | string[] | undefined>;

export type SearchValues = {
  location: (typeof locations)[number];
  checkin: string;
  checkout: string;
  guests: number;
  children: number;
  type: (typeof propertyTypes)[number];
  sort: (typeof sortOptions)[number];
  minPrice: number | null;
  maxPrice: number | null;
  page: number;
  pageSize: 12 | 24;
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

export function parseSearchQuery(raw: RawSearchParams) {
  const rawLocation = first(raw.location)?.toLowerCase();
  const rawType = first(raw.type)?.toLowerCase();
  const rawSort = first(raw.sort)?.toLowerCase();
  const checkin = first(raw.checkin) ?? "";
  const checkout = first(raw.checkout) ?? "";
  const parsedGuests = Number.parseInt(first(raw.guests) ?? "2", 10);
  const parsedChildren = Number.parseInt(first(raw.children) ?? "0", 10);
  const parsedMinPrice = Number.parseInt(first(raw.minPrice) ?? "", 10);
  const parsedMaxPrice = Number.parseInt(first(raw.maxPrice) ?? "", 10);
  const parsedPage = Number.parseInt(first(raw.page) ?? "1", 10);
  const parsedPageSize = Number.parseInt(first(raw.pageSize) ?? "12", 10);
  const errors: string[] = [];

  const values: SearchValues = {
    location: isOneOf(rawLocation, locations) ? rawLocation : "all",
    checkin,
    checkout,
    guests: Number.isInteger(parsedGuests) && parsedGuests >= 1 && parsedGuests <= 10
      ? parsedGuests
      : 2,
    children: Number.isInteger(parsedChildren) && parsedChildren >= 0 && parsedChildren <= 10
      ? parsedChildren
      : 0,
    type: isOneOf(rawType, propertyTypes) ? rawType : "all",
    sort: isOneOf(rawSort, sortOptions) ? rawSort : "recommended",
    minPrice: Number.isInteger(parsedMinPrice) && parsedMinPrice >= 0 ? parsedMinPrice : null,
    maxPrice: Number.isInteger(parsedMaxPrice) && parsedMaxPrice > 0 ? parsedMaxPrice : null,
    page: Number.isInteger(parsedPage) && parsedPage >= 1 ? parsedPage : 1,
    pageSize: parsedPageSize === 24 ? 24 : 12,
  };

  if (!Number.isInteger(parsedGuests) || parsedGuests < 1 || parsedGuests > 10) {
    errors.push("Adults must be between 1 and 10.");
  }
  if (!Number.isInteger(parsedChildren) || parsedChildren < 0 || parsedChildren > 10) {
    errors.push("Children must be between 0 and 10.");
  }
  if (values.minPrice !== null && values.maxPrice !== null && values.minPrice > values.maxPrice) {
    errors.push("Minimum price cannot be higher than maximum price.");
  }

  let nights: number | null = null;

  if (checkin || checkout) {
    if (!isDate(checkin) || !isDate(checkout)) {
      errors.push("Choose a valid check-in and check-out date.");
    } else {
      nights = nightsBetween(checkin, checkout);
      const today = baliToday();
      const latestCheckin = addUtcDays(today, 365);
      if (checkin < today) errors.push("Check-in cannot be in the past.");
      if (latestCheckin && checkin > latestCheckin) errors.push("Check-in can be up to 365 days ahead.");
      if (nights < 1) errors.push("Check-out must be after check-in.");
      if (nights > 30) errors.push("A stay can be up to 30 nights.");
    }
  }

  return { values, nights, errors };
}
