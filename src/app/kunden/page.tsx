import { redirect } from "next/navigation";
import Link from "next/link";

import { AuthShell } from "@/components/auth-shell";
import { getGuestCard } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function KundenPage() {
  const card = await getGuestCard();
  if (card) redirect("/karte");

  return (
    <AuthShell>
      <div className="grid w-full gap-3">
        <Link
          href="/login"
          className="flex h-14 items-center justify-center rounded-[1.2rem] bg-white text-base font-semibold text-ink shadow-sm"
        >
          Login
        </Link>
        <Link
          href="/registrieren"
          className="flex h-14 items-center justify-center rounded-[1.2rem] border-2 border-white bg-transparent text-base font-semibold text-white"
        >
          Registrieren
        </Link>
      </div>
      <p className="text-center text-xs leading-5 text-white/85">
        Deine Stempelkarte auf dem Handy – unter „Zum Home-Bildschirm“ speichern.
      </p>
    </AuthShell>
  );
}
