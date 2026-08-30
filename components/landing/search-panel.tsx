import {
  CalendarDays,
  MapPin,
  Search,
  UsersRound,
} from "lucide-react";

const fieldClassName =
  "h-12 min-w-0 w-full max-w-full bg-transparent text-[15px] font-semibold text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-0";

type SearchPanelProps = {
  initialValues?: {
    location?: string;
    checkin?: string;
    checkout?: string;
    guests?: string;
  };
  compact?: boolean;
};

export function SearchPanel({
  initialValues,
  compact = false,
}: SearchPanelProps) {
  return (
    <div className="w-full min-w-0 rounded-[20px] border border-white/60 bg-white p-2 shadow-search">
      <form
        action="/search"
        method="get"
        className="grid min-w-0 gap-1 lg:grid-cols-[1.15fr_1fr_1fr_0.9fr_auto]"
        aria-describedby="search-form-note"
      >
        <label className="group flex min-w-0 items-center gap-3 rounded-2xl px-4 py-2 transition hover:bg-secondary focus-within:bg-secondary">
          <MapPin className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
              Destination
            </span>
            <select
              className={fieldClassName}
              defaultValue={initialValues?.location ?? "ubud"}
              name="location"
            >
              <option value="ubud">Ubud, Bali</option>
              <option value="canggu">Canggu, Bali</option>
              <option value="seminyak">Seminyak, Bali</option>
              <option value="uluwatu">Uluwatu, Bali</option>
              <option value="sanur">Sanur, Bali</option>
            </select>
          </span>
        </label>

        <label className="group flex min-w-0 items-center gap-3 rounded-2xl px-4 py-2 transition hover:bg-secondary focus-within:bg-secondary lg:border-l lg:border-border">
          <CalendarDays className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
              Check-in
            </span>
            <input
              className={fieldClassName}
              defaultValue={initialValues?.checkin}
              name="checkin"
              required
              type="date"
            />
          </span>
        </label>

        <label className="group flex min-w-0 items-center gap-3 rounded-2xl px-4 py-2 transition hover:bg-secondary focus-within:bg-secondary lg:border-l lg:border-border">
          <CalendarDays className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
              Check-out
            </span>
            <input
              className={fieldClassName}
              defaultValue={initialValues?.checkout}
              name="checkout"
              required
              type="date"
            />
          </span>
        </label>

        <label className="group flex min-w-0 items-center gap-3 rounded-2xl px-4 py-2 transition hover:bg-secondary focus-within:bg-secondary lg:border-l lg:border-border">
          <UsersRound className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
              Guests
            </span>
            <select
              className={fieldClassName}
              defaultValue={initialValues?.guests ?? "2"}
              name="guests"
            >
              <option value="1">1 guest</option>
              <option value="2">2 guests</option>
              <option value="3">3 guests</option>
              <option value="4">4 guests</option>
              <option value="5">5 guests</option>
              <option value="6">6 guests</option>
            </select>
          </span>
        </label>

        <button
          className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-base font-bold text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            compact ? "min-h-12 lg:min-w-32" : "min-h-14 lg:min-h-0 lg:min-w-36"
          }`}
          type="submit"
        >
          <Search className="size-5" aria-hidden="true" />
          Search
        </button>
      </form>
      <p className="sr-only" id="search-form-note">
        Select a Bali area, travel dates, and guest count to search available stays.
      </p>
    </div>
  );
}
