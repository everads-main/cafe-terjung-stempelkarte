import Link from "next/link";

export function SiteHeader({
  eyebrow = "Café Terjung · Lüdinghausen",
  compact = false,
}: {
  eyebrow?: string;
  compact?: boolean;
}) {
  return (
    <header className="flex items-center justify-between gap-3">
      <Link href="/" className="min-w-0">
        <p className="text-xs font-medium tracking-[0.18em] text-caramel uppercase">
          {eyebrow}
        </p>
        {!compact ? (
          <h1 className="font-display mt-1 text-2xl leading-none text-espresso">
            Stempelkarte
          </h1>
        ) : null}
      </Link>
      <div className="size-11 shrink-0 rounded-full bg-roast text-primary-foreground shadow-sm">
        <svg viewBox="0 0 48 48" className="size-full p-2" aria-hidden>
          <path
            d="M14 18h16c3.8 0 6 2.4 6 5.4 0 2.6-1.7 4.8-4.2 5.4v.4c0 5.2-4 8.8-9.8 8.8S12 34.4 12 29.2v-.2C10.2 28 9 26 9 23.6 9 20.4 11.2 18 14 18Z"
            fill="currentColor"
            opacity="0.92"
          />
          <path
            d="M18 14c.6-2 1.8-3.4 3.6-3.8M24 13.4c.4-1.8 1.6-3 3.4-3.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      </div>
    </header>
  );
}
