import { normalizeCardCode } from "@/lib/card-code";
import { cardStateForGuest, guestByCardCode } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PublicCardPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  let card = null;
  try {
    const guest = await guestByCardCode(normalizeCardCode(code));
    card = guest ? await cardStateForGuest(guest) : null;
  } catch {
    card = null;
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-10">
      <p className="text-xs tracking-[0.18em] text-caramel uppercase">Café Terjung</p>
      {card ? (
        <section className="paper-card rounded-[1.6rem] px-5 py-8 text-center">
          <h1 className="font-display text-3xl">{card.firstName}</h1>
          <p className="mt-1 tracking-[0.18em]">{card.cardCode}</p>
          <p className="mt-4 text-lg">{card.current} von 10 Tassen</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Kundenkonto in der Datenbank. Stempeln nur über die Theken-App.
          </p>
        </section>
      ) : (
        <section className="paper-card rounded-[1.6rem] px-5 py-8">
          <h1 className="font-display text-3xl">Karte unbekannt</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Dieser QR ist noch keinem Kundenkonto zugeordnet.
          </p>
        </section>
      )}
    </main>
  );
}
