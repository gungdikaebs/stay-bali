import {
  CalendarDays,
  MapPin,
  Search,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";

const fieldClassName =
  "h-12 min-w-0 w-full max-w-full border-0 bg-transparent px-0 text-[15px] font-semibold text-foreground shadow-none placeholder:text-muted-foreground focus-visible:border-transparent focus-visible:ring-0";

type SearchPanelProps = {
  initialValues?: {
    location?: string;
    checkin?: string;
    checkout?: string;
    guests?: string;
    children?: string;
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
        className="grid min-w-0 gap-1 lg:grid-cols-[1.15fr_1fr_1fr_0.75fr_0.75fr_auto]"
        aria-describedby="search-form-note"
      >
        <label className="group flex min-w-0 items-center gap-3 rounded-2xl px-4 py-2 transition hover:bg-secondary focus-within:bg-secondary">
          <MapPin className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
              Destination
            </span>
            <NativeSelect
              className={fieldClassName}
              defaultValue={initialValues?.location ?? "all"}
              name="location"
            >
              <option value="all">All Bali</option>
              <option value="ubud">Ubud, Bali</option>
              <option value="canggu">Canggu, Bali</option>
              <option value="seminyak">Seminyak, Bali</option>
              <option value="uluwatu">Uluwatu, Bali</option>
              <option value="sanur">Sanur, Bali</option>
            </NativeSelect>
          </span>
        </label>

        <label className="group flex min-w-0 items-center gap-3 rounded-2xl px-4 py-2 transition hover:bg-secondary focus-within:bg-secondary lg:border-l lg:border-border">
          <CalendarDays className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
              Check-in
            </span>
            <Input
              className={fieldClassName}
              defaultValue={initialValues?.checkin}
              name="checkin"
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
            <Input
              className={fieldClassName}
              defaultValue={initialValues?.checkout}
              name="checkout"
              type="date"
            />
          </span>
        </label>

        <label className="group flex min-w-0 items-center gap-3 rounded-2xl px-4 py-2 transition hover:bg-secondary focus-within:bg-secondary lg:border-l lg:border-border">
          <UsersRound className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
              Adults
            </span>
            <NativeSelect
              className={fieldClassName}
              defaultValue={initialValues?.guests ?? "2"}
              name="guests"
            >
              {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count}</option>)}
            </NativeSelect>
          </span>
        </label>

        <label className="group flex min-w-0 items-center gap-3 rounded-2xl px-4 py-2 transition hover:bg-secondary focus-within:bg-secondary lg:border-l lg:border-border">
          <UsersRound className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase">Children</span>
            <NativeSelect className={fieldClassName} defaultValue={initialValues?.children ?? "0"} name="children">
              {Array.from({ length: 11 }, (_, count) => <option key={count} value={count}>{count}</option>)}
            </NativeSelect>
          </span>
        </label>

        <Button
          className={`rounded-2xl px-6 text-base ${
            compact ? "min-h-12 lg:min-w-32" : "min-h-14 lg:min-h-0 lg:min-w-36"
          }`}
          type="submit"
        >
          <Search className="size-5" aria-hidden="true" />
          Search stays
        </Button>
      </form>
      <p className="sr-only" id="search-form-note">
        Select a Bali area, dates, and adult and child guest counts. Dates are optional for catalog browsing.
      </p>
    </div>
  );
}
