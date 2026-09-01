"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CalendarCheck2, LayoutDashboard, Users } from "lucide-react";

const navigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/partners", label: "Partners", icon: Users },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/bookings", label: "Reservations", icon: CalendarCheck2 },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 space-y-1" aria-label="Admin navigation">
      {navigation.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${active ? "bg-foreground text-white" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            href={href}
            key={href}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
