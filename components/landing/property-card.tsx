import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BedDouble,
  MapPin,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type PropertyCardProps = {
  name: string;
  area: string;
  type: string;
  guests: number;
  price: string;
  image: string;
  highlight: string;
  href: string;
  priority?: boolean;
};

export function PropertyCard({
  name,
  area,
  type,
  guests,
  price,
  image,
  highlight,
  href,
  priority = false,
}: PropertyCardProps) {
  return (
    <Link className="group block" href={href} aria-label={`View ${name}`}>
    <Card asChild className="overflow-hidden rounded-2xl shadow-none transition duration-300 group-hover:-translate-y-1 group-hover:shadow-card">
    <article>
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <Image
          fill
          priority={priority}
          alt={`${name} accommodation in ${area}`}
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          src={image}
        />
        <Badge className="absolute top-3 left-3 bg-white/95 text-foreground shadow-sm backdrop-blur-sm" variant="outline">
          <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
          Verified property
        </Badge>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden="true" />
              {area}
            </p>
            <h3 className="font-display text-xl font-bold tracking-[-0.025em] text-foreground">
              {name}
            </h3>
          </div>
          <Badge className="text-primary" variant="success">
            {type}
          </Badge>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <UsersRound className="size-4" aria-hidden="true" />
            {guests} guests
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BedDouble className="size-4" aria-hidden="true" />
            Room options available
          </span>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-xl bg-success-subtle px-3 py-2.5 text-sm font-semibold text-success">
          <Sparkles className="size-4 shrink-0" aria-hidden="true" />
          {highlight}
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-lg font-extrabold tracking-[-0.02em] text-foreground">
              {price}
            </p>
            <p className="text-xs text-muted-foreground">per night</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-primary transition group-hover:gap-2">
            View stay
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
    </Card>
    </Link>
  );
}
