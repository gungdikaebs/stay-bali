import Link from "next/link";

export default function StayNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-primary">Stay unavailable</p>
        <h1 className="font-display mt-3 text-4xl font-extrabold tracking-[-0.04em]">We couldn&apos;t find this property.</h1>
        <p className="mt-4 leading-7 text-muted-foreground">It may no longer be available, or the link may have changed.</p>
        <Link className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 font-bold text-white hover:bg-primary-hover" href="/search">Explore other stays</Link>
      </div>
    </main>
  );
}
