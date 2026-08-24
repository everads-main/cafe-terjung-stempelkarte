import { redirect } from "next/navigation";

import { GuestShell } from "@/components/guest-shell";
import { GuestCardView } from "@/components/guest-card-view";
import { getGuestCard } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function KartePage() {
  const card = await getGuestCard();
  if (!card) redirect("/login?next=/karte");

  return (
    <GuestShell current="karte">
      <GuestCardView initial={card} />
    </GuestShell>
  );
}
