import { redirect } from "next/navigation";

import { GuestShell } from "@/components/guest-shell";
import { RedeemView } from "@/components/redeem-view";
import { getGuestCard } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function EinloesenPage() {
  const card = await getGuestCard();
  if (!card) redirect("/login?next=/karte/einloesen");

  return (
    <GuestShell current="einloesen">
      <RedeemView initial={card} />
    </GuestShell>
  );
}
