"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CustomerQr } from "@/components/customer-qr";
import { StampCard } from "@/components/stamp-card";
import { Button } from "@/components/ui/button";
import { useLiveCard } from "@/hooks/use-live-card";
import type { CardState } from "@/lib/types";

export function GuestCardView({ initial }: { initial: CardState }) {
  const router = useRouter();
  const { card, justUpdated } = useLiveCard(initial);
  const [leaving, setLeaving] = useState(false);

  return (
    <div className="space-y-5">
      {justUpdated ? (
        <p className="stamp-flash text-center text-sm font-semibold text-terjung-dark">
          Neue Tasse!
        </p>
      ) : null}

      <div className="terjung-panel rounded-[1.4rem] px-5 py-6 text-center">
        <p className="text-xs font-semibold tracking-[0.16em] uppercase">Dein QR</p>
        <p className="mt-2 text-2xl font-semibold">{card.firstName}</p>
        <div className="mt-4 rounded-2xl bg-white p-3">
          <CustomerQr cardCode={card.cardCode} size={220} />
        </div>
        <p className="mt-3 text-sm font-medium">{card.cardCode}</p>
      </div>

      <StampCard card={card} pulse={justUpdated} />

      {card.pendingStamps > 0 ? (
        <p className="rounded-xl bg-white px-4 py-3 text-center text-sm leading-6 shadow-sm">
          <strong>{card.pendingStamps} Tasse(n)</strong> warten. Unter{" "}
          <strong>Einlösen</strong> den vollen Becher zeigen – danach werden sie
          gutgeschrieben.
        </p>
      ) : null}

      <section className="rounded-[1.4rem] border border-dashed border-terjung/40 bg-white/70 px-4 py-4">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Aktuelles
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Hier können später Angebote oder Neuigkeiten von Café Terjung erscheinen.
        </p>
      </section>

      <Button
        variant="ghost"
        className="w-full"
        disabled={leaving}
        onClick={async () => {
          setLeaving(true);
          await fetch("/api/guest/logout", { method: "POST" });
          router.push("/kunden");
          router.refresh();
        }}
      >
        Abmelden
      </Button>
    </div>
  );
}
