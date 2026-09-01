"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CalendarCheck2, LayoutDashboard } from "lucide-react";

const navigation = [
  { href: "/partner", label: "Overview", icon: LayoutDashboard },
  { href: "/partner/properties", label: "Properties", icon: Building2 },
  { href: "/partner/bookings", label: "Reservations", icon: CalendarCheck2 },
];

export function PartnerNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Partner navigation" className="mt-6 space-y-1">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = href === "/partner" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${active ? "bg-foreground text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
