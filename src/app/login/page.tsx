import { redirect } from "next/navigation";
import Link from "next/link";

import { LoginForm } from "@/components/guest-auth-form";
import { getGuestCard } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const card = await getGuestCard();
  if (card) redirect("/karte");

  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/karte";

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10">
      <Link href="/" className="text-sm font-medium text-muted-foreground">
        ← Zurück
      </Link>
      <div className="terjung-panel rounded-[1.4rem] px-5 py-6">
        <p className="text-sm font-medium">Café Terjung</p>
        <h1 className="mt-1 text-2xl font-semibold">Kunden-Login</h1>
      </div>
      <LoginForm nextPath={nextPath} />
      <p className="pb-6 text-center text-xs leading-5 text-muted-foreground">
        Bring die Karte auf dein Handy: im Browser-Menü „Zum Home-Bildschirm“ /
        „App installieren“. Dann bleibt dein Konto immer griffbereit.
      </p>
    </main>
  );
}
