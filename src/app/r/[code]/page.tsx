import { normalizeCardCode } from "@/lib/card-code";
import { cardStateForGuest, guestByCardCode } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function RedeemScanPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  let label = normalizeCardCode(code);

  try {
    const guest = await guestByCardCode(label);
    if (guest) {
      const card = await cardStateForGuest(guest);
      label = `${guest.firstName} · Einlösen (${card.current}/10)`;
    }
  } catch {
    // DB nicht erreichbar
  }

  return (
    <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs tracking-[0.2em] text-caramel uppercase">Café Terjung</p>
      <h1 className="font-display mt-2 text-2xl">Freier Kaffee</h1>
      <p className="mt-2 text-muted-foreground">{label}</p>
      <p className="mt-6 text-sm text-muted-foreground">
        Dieser QR ist nur zum Einlösen. Theke: scannen → Karte wird geleert.
      </p>
    </main>
  );
}
