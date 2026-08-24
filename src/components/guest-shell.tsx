import type { ReactNode } from "react";
import Link from "next/link";

export function GuestShell({
  children,
  current = "karte",
}: {
  children: ReactNode;
  current?: "karte" | "einloesen";
}) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-5 px-4 pt-6 pb-24">{children}</main>
      <nav className="fixed right-0 bottom-0 left-0 z-20 border-t border-border bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-lg grid-cols-2 px-2 py-2">
          <Tab href="/karte" active={current === "karte"} label="Karte" />
          <Tab href="/karte/einloesen" active={current === "einloesen"} label="Einlösen" />
        </div>
      </nav>
    </div>
  );
}

function Tab({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-xl px-2 py-3 text-center text-sm font-semibold ${
        active ? "bg-terjung text-ink" : "text-muted-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
