import { redirect } from "next/navigation";
import Link from "next/link";

import { getGuestCard } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const card = await getGuestCard();
  if (card) redirect("/karte");

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 px-4 py-12">
      <div className="terjung-panel rounded-[1.6rem] px-6 py-10 text-center">
        <p className="text-sm font-medium tracking-[0.16em] uppercase">Café Terjung</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight">Stempelkarte</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-6">
          Zehn Tassen sammeln – der nächste Kaffee geht auf uns.
        </p>
      </div>

      <div className="grid gap-3">
        <Link
          href="/login"
          className="flex h-14 items-center justify-center rounded-[1.2rem] bg-primary text-base font-semibold text-ink shadow-sm"
        >
          Kunden-Login
        </Link>
        <Link
          href="/personal"
          className="flex h-14 items-center justify-center rounded-[1.2rem] border-2 border-ink bg-white text-base font-semibold text-ink"
        >
          Theken-Login
        </Link>
      </div>
    </main>
  );
}
