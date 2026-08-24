"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

import { CustomerQr } from "@/components/customer-qr";
import { STAMPS_FOR_REWARD } from "@/lib/config";
import type { CardState } from "@/lib/types";

export function PrintCard({ card }: { card: CardState }) {
  const [printQr, setPrintQr] = useState<string | null>(null);

  useEffect(() => {
    const url = `${window.location.origin}/k/${card.cardCode}`;
    void QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: { dark: "#2a1c14", light: "#fffaf3" },
    }).then(setPrintQr);
  }, [card.cardCode]);

  return (
    <div className="space-y-4">
      <div className="paper-card rounded-[1.6rem] p-5 sm:hidden">
        <h1 className="font-display text-2xl">Physische Karte</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Am besten am Computer drucken. Der QR ist derselbe wie in der App.
        </p>
        <button
          type="button"
          className="mt-4 h-12 w-full rounded-lg bg-primary text-primary-foreground"
          onClick={() => window.print()}
        >
          Drucken
        </button>
      </div>

      <div
        id="print-area"
        className="mx-auto max-w-sm rounded-[1.2rem] border-2 border-espresso bg-paper p-6 text-center text-espresso print:border-2 print:shadow-none"
      >
        <p className="text-xs tracking-[0.2em] uppercase">Café Terjung</p>
        <p className="font-display mt-2 text-2xl">Kaffeekarte</p>
        <p className="mt-1 text-lg font-medium">{card.firstName}</p>
        <p className="mt-1 tracking-[0.2em]">{card.cardCode}</p>
        <div className="mt-4 flex justify-center">
          {printQr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={printQr} alt="" width={200} height={200} className="rounded-lg" />
          ) : (
            <CustomerQr cardCode={card.cardCode} size={200} />
          )}
        </div>
        <p className="mt-4 text-sm leading-6">
          {STAMPS_FOR_REWARD} Tassen sammeln – der nächste geht auf uns.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Code an der Theke scannen. App: terjung-karte.de
        </p>
      </div>

      <button
        type="button"
        className="hidden h-12 w-full rounded-lg bg-primary text-primary-foreground sm:block print:hidden"
        onClick={() => window.print()}
      >
        Jetzt drucken
      </button>
    </div>
  );
}
