"use client";

import { useState } from "react";

import { RedeemQr } from "@/components/redeem-qr";
import { useLiveCard } from "@/hooks/use-live-card";
import { STAMPS_FOR_REWARD } from "@/lib/config";
import type { CardState } from "@/lib/types";

export function RedeemView({ initial }: { initial: CardState }) {
  const { card, justUpdated } = useLiveCard(initial);
  const [showQr, setShowQr] = useState(false);
  const fill = Math.min(100, (card.current / STAMPS_FOR_REWARD) * 100);

  return (
    <div className="terjung-panel rounded-[1.4rem] px-5 py-8 text-center">
      <p className="text-xs font-semibold tracking-[0.16em] uppercase">Einlösen</p>
      <h1 className="mt-2 text-2xl font-semibold">Dein Kaffeebecher</h1>

      <button
        type="button"
        disabled={!card.freeCoffeeReady}
        onClick={() => card.freeCoffeeReady && setShowQr(true)}
        className={`mx-auto mt-6 block ${card.freeCoffeeReady ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className="relative mx-auto h-44 w-32">
          <svg viewBox="0 0 120 160" className="size-full text-ink/25" aria-hidden>
            <path
              d="M28 40h52c8 0 14 6 14 14v70c0 18-14 32-32 32s-32-14-32-32V54c0-8 6-14 14-14Z"
              fill="currentColor"
            />
            <path
              d="M80 52h12c10 0 16 6 16 14 0 8-6 14-14 14h-12"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
            />
          </svg>
          <div
            className="absolute bottom-6 left-6 right-6 rounded-b-3xl bg-ink/80 transition-all duration-700 ease-out"
            style={{ height: `${fill * 0.55}%`, maxHeight: "55%" }}
          />
          {card.freeCoffeeReady ? (
            <p className="absolute inset-x-0 bottom-2 text-center text-xs font-semibold">
              Antippen
            </p>
          ) : null}
        </div>
      </button>

      <p className="mt-4 text-lg font-semibold">
        {card.current} / {STAMPS_FOR_REWARD}
      </p>

      {!card.freeCoffeeReady ? (
        <p className="mt-2 text-sm leading-6">
          Der Becher füllt sich mit jedem Stempel. Bei zehn ist er voll.
        </p>
      ) : !showQr ? (
        <p className="mt-2 text-sm leading-6">
          Becher voll – antippen, dann QR an der Theke zeigen.
        </p>
      ) : null}

      {card.pendingStamps > 0 ? (
        <p className="mt-4 rounded-xl bg-white/30 px-3 py-2 text-sm leading-6">
          Danach werden <strong>{card.pendingStamps} weitere Tasse(n)</strong> automatisch
          gutgeschrieben.
        </p>
      ) : null}

      {showQr && card.freeCoffeeReady ? (
        <div className="mt-6 rounded-2xl bg-white p-3">
          <RedeemQr cardCode={card.cardCode} />
          <p className="mt-3 text-sm font-medium text-ink">Einlöse-QR für die Theke</p>
        </div>
      ) : null}

      {justUpdated ? (
        <p className="stamp-flash mt-4 text-sm font-semibold">Aktualisiert!</p>
      ) : null}
    </div>
  );
}
