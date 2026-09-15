import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function StayBaliLogo({
  inverted = false,
  className,
}: {
  inverted?: boolean;
  className?: string;
}) {
  return (
    <Link
      aria-label="StayBali home"
      className={cn("inline-flex shrink-0 items-center", className)}
      href="/"
    >
      <Image
        alt=""
        aria-hidden="true"
        className={cn(
          "h-9 w-auto object-contain sm:h-10",
          inverted && "brightness-0 invert",
        )}
        height={431}
        loading="eager"
        sizes="(max-width: 640px) 146px, 162px"
        src="/branding/staybali-logo.png"
        width={1743}
      />
    </Link>
  );
}
