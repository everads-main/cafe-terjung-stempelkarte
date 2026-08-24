import { redirect } from "next/navigation";

import { GuestShell } from "@/components/guest-shell";
import { PrintCard } from "@/components/print-card";
import { getGuestCard } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AusdruckPage() {
  const card = await getGuestCard();
  if (!card) redirect("/login?next=/karte/ausdruck");

  return (
    <GuestShell current="karte">
      <PrintCard card={card} />
    </GuestShell>
  );
}
