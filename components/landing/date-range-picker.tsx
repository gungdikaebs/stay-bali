"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_MS = 86_400_000;
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});
const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const accessibleDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

type ActiveField = "checkin" | "checkout";

type DateRangePickerProps = {
  initialCheckin?: string;
  initialCheckout?: string;
};

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return date.toISOString().slice(0, 10) === value ? date : null;
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function baliToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDays(value: string, days: number) {
  const date = parseDate(value);
  if (!date) return value;
  return toDateOnly(new Date(date.getTime() + days * DAY_MS));
}

function startOfMonth(value: string) {
  const date = parseDate(value) ?? new Date();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(month: Date, amount: number) {
  return new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + amount, 1));
}

function monthDays(month: Date) {
  const daysInMonth = new Date(
    Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const mondayOffset = (month.getUTCDay() + 6) % 7;

  return {
    days: Array.from({ length: daysInMonth }, (_, index) =>
      new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), index + 1)),
    ),
    mondayOffset,
  };
}

function nightsBetween(checkin: string, checkout: string) {
  const start = parseDate(checkin);
  const end = parseDate(checkout);
  if (!start || !end) return 0;
  return Math.round((end.getTime() - start.getTime()) / DAY_MS);
}

function displayDate(value: string) {
  const date = parseDate(value);
  return date ? dateFormatter.format(date) : "Add date";
}

function CalendarMonth({
  activeField,
  checkin,
  checkout,
  latestCheckin,
  month,
  onSelect,
  showMobileNext = false,
  showNext = false,
  showPrevious = false,
  today,
  onNext,
  onPrevious,
}: {
  activeField: ActiveField;
  checkin: string;
  checkout: string;
  latestCheckin: string;
  month: Date;
  onSelect: (date: string) => void;
  showMobileNext?: boolean;
  showNext?: boolean;
  showPrevious?: boolean;
  today: string;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const { days, mondayOffset } = monthDays(month);

  return (
    <section aria-label={monthFormatter.format(month)}>
      <div className="mb-6 grid grid-cols-[44px_1fr_44px] items-center">
        {showPrevious ? (
          <button
            aria-label="Previous month"
            className="flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:border-primary/40 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onPrevious}
            type="button"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
        ) : <span />}
        <h3 className="font-display text-center text-lg font-bold text-foreground">
          {monthFormatter.format(month)}
        </h3>
        {showNext || showMobileNext ? (
          <button
            aria-label="Next month"
            className={cn(
              "flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:border-primary/40 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              showMobileNext && !showNext && "md:hidden",
            )}
            onClick={onNext}
            type="button"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        ) : <span />}
      </div>

      <div className="grid grid-cols-7 text-center" aria-hidden="true">
        {WEEKDAYS.map((weekday, index) => (
          <span className="pb-3 text-xs font-semibold text-muted-foreground" key={`${weekday}-${index}`}>
            {weekday}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: mondayOffset }, (_, index) => (
          <span key={`empty-${index}`} />
        ))}
        {days.map((date) => {
          const value = toDateOnly(date);
          const isStart = value === checkin;
          const isEnd = value === checkout;
          const isInRange = Boolean(checkin && checkout && value > checkin && value < checkout);
          const checkoutLimit = checkin ? addDays(checkin, 30) : latestCheckin;
          const disabled = activeField === "checkin"
            ? value < today || value > latestCheckin
            : value < today || (checkin ? value <= checkin || value > checkoutLimit : value > latestCheckin);
          const selectionLabel = activeField === "checkin" ? "check-in" : "check-out";

          return (
            <button
              aria-label={`Choose ${accessibleDateFormatter.format(date)} as ${selectionLabel}`}
              aria-pressed={isStart || isEnd}
              className={cn(
                "relative flex aspect-square min-h-10 items-center justify-center text-sm font-semibold text-foreground outline-none transition hover:bg-secondary focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring",
                isInRange && "bg-brand-teal-subtle hover:bg-brand-teal-subtle",
                isStart && "rounded-l-xl bg-primary text-white hover:bg-primary-hover",
                isEnd && "rounded-r-xl bg-primary text-white hover:bg-primary-hover",
                isStart && isEnd && "rounded-xl",
                disabled && "cursor-not-allowed text-muted-foreground/35 hover:bg-transparent",
              )}
              data-calendar-date={value}
              disabled={disabled}
              key={value}
              onClick={() => onSelect(value)}
              type="button"
            >
              {date.getUTCDate()}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function DateRangePicker({
  initialCheckin = "",
  initialCheckout = "",
}: DateRangePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [today] = useState(baliToday);
  const [checkin, setCheckin] = useState(initialCheckin);
  const [checkout, setCheckout] = useState(initialCheckout);
  const [activeField, setActiveField] = useState<ActiveField>("checkin");
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ left: 16, top: 16 });
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(initialCheckin || today),
  );
  const latestCheckin = addDays(today, 365);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const root = rootRef.current?.getBoundingClientRect();
      const panel = panelRef.current?.getBoundingClientRect();
      if (!root || !panel) return;

      const margin = 16;
      const gap = 12;
      const below = root.bottom + gap;
      const above = root.top - panel.height - gap;
      const top = below + panel.height <= window.innerHeight - margin
        ? below
        : Math.max(margin, above);
      const centeredLeft = root.left + root.width / 2 - panel.width / 2;
      const left = Math.min(
        window.innerWidth - panel.width - margin,
        Math.max(margin, centeredLeft),
      );

      setPanelPosition({ left, top });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, visibleMonth]);

  const openPicker = (field: ActiveField) => {
    const selected = field === "checkin" ? checkin : checkout;
    setActiveField(field);
    setVisibleMonth(startOfMonth(selected || checkin || today));
    setOpen(true);
  };

  const selectDate = (value: string) => {
    if (activeField === "checkin" || !checkin || value <= checkin) {
      setCheckin(value);
      if (!checkout || checkout <= value || nightsBetween(value, checkout) > 30) {
        setCheckout("");
      }
      setActiveField("checkout");
      return;
    }

    setCheckout(value);
    setOpen(false);
  };

  return (
    <div className="relative grid min-w-0 gap-1 sm:grid-cols-2 lg:col-span-2" ref={rootRef}>
      <input name="checkin" type="hidden" value={checkin} />
      <input name="checkout" type="hidden" value={checkout} />

      {(["checkin", "checkout"] as const).map((field, index) => {
        const value = field === "checkin" ? checkin : checkout;
        const label = field === "checkin" ? "Check-in" : "Check-out";

        return (
          <div
            className={cn(
              "group flex min-w-0 items-center gap-3 rounded-2xl px-4 py-2 transition hover:bg-secondary",
              index === 1 && "lg:border-l lg:border-border",
              open && activeField === field && "bg-secondary",
            )}
            key={field}
          >
            <CalendarDays className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <button
              aria-expanded={open && activeField === field}
              aria-haspopup="dialog"
              className="min-w-0 flex-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => openPicker(field)}
              type="button"
            >
              <span className="block text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
                {label}
              </span>
              <span className={cn("block truncate py-3 text-[15px] font-semibold", !value && "text-muted-foreground")}>
                {displayDate(value)}
              </span>
            </button>
            {value ? (
              <button
                aria-label={`Clear ${label.toLowerCase()}`}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => {
                  if (field === "checkin") {
                    setCheckin("");
                    setCheckout("");
                  } else {
                    setCheckout("");
                  }
                  setActiveField(field);
                }}
                type="button"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        );
      })}

      {open ? createPortal(
        <div
          aria-label="Choose stay dates"
          className="fixed z-[100] w-[min(680px,calc(100vw-2rem))] rounded-3xl border border-border bg-white p-5 shadow-search sm:p-7"
          ref={panelRef}
          role="dialog"
          style={panelPosition}
        >
          <div className="grid gap-10 md:grid-cols-2">
            <CalendarMonth
              activeField={activeField}
              checkin={checkin}
              checkout={checkout}
              latestCheckin={latestCheckin}
              month={visibleMonth}
              onNext={() => setVisibleMonth((month) => addMonths(month, 1))}
              onPrevious={() => setVisibleMonth((month) => addMonths(month, -1))}
              onSelect={selectDate}
              showMobileNext
              showPrevious
              today={today}
            />
            <div className="hidden md:block">
              <CalendarMonth
                activeField={activeField}
                checkin={checkin}
                checkout={checkout}
                latestCheckin={latestCheckin}
                month={addMonths(visibleMonth, 1)}
                onNext={() => setVisibleMonth((month) => addMonths(month, 1))}
                onPrevious={() => setVisibleMonth((month) => addMonths(month, -1))}
                onSelect={selectDate}
                showNext
                today={today}
              />
            </div>
          </div>
          <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
            Select up to 30 nights. Availability is confirmed when you search.
          </p>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}
