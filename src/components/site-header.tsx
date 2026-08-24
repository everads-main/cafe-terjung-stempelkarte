import Link from "next/link";

import { TerjungLogo } from "@/components/terjung-logo";

export function SiteHeader({
  compact = false,
  homeHref = "/kunden",
}: {
  compact?: boolean;
  homeHref?: string;
}) {
  return (
    <header className="flex items-center justify-between gap-3">
      <Link href={homeHref} className="min-w-0 block">
        <TerjungLogo className="max-w-[200px]" />
        {!compact ? (
          <p className="mt-2 text-sm font-medium text-muted-foreground">Stempelkarte</p>
        ) : null}
      </Link>
    </header>
  );
}
