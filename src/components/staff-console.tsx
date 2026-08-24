"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { parseStaffScan } from "@/lib/card-code";
import { LOCATIONS, STAMPS_FOR_REWARD, type LocationId } from "@/lib/config";
import type { CardState } from "@/lib/types";

const QrScanner = dynamic(
  () => import("@/components/qr-scanner").then((module) => module.QrScanner),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-[1.4rem] border border-border bg-white px-4 py-16 text-center text-muted-foreground">
        Kamera wird geladen…
      </div>
    ),
  },
);

export function StaffLogin() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [locationId, setLocationId] = useState<LocationId>(LOCATIONS[0].id);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function login() {
    setPending(true);
    setError(null);
    const response = await fetch("/api/staff/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin, locationId }),
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error ?? "Login fehlgeschlagen.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="paper-card rounded-[1.4rem] p-6">
      <div className="terjung-panel -mx-6 -mt-6 mb-6 rounded-t-[1.4rem] px-6 py-6">
        <h1 className="text-3xl font-semibold">Theken-Login</h1>
        <p className="mt-1 text-sm">Firmen-Handy · QR scannen · 1–10 tippen</p>
      </div>
      <label className="block text-sm font-semibold">Standort</label>
      <div className="mt-2 grid gap-2">
        {LOCATIONS.map((location) => (
          <button
            key={location.id}
            type="button"
            onClick={() => setLocationId(location.id)}
            className={`rounded-xl border px-3 py-3 text-left text-sm font-medium ${
              locationId === location.id
                ? "border-terjung bg-cream"
                : "border-border bg-white"
            }`}
          >
            {location.name}
          </button>
        ))}
      </div>
      <label className="mt-4 block text-sm font-semibold">Admin-Code</label>
      <input
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
        className="mt-2 h-12 w-full rounded-xl border border-input bg-cream px-3 tracking-[0.4em]"
      />
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      <Button
        className="mt-4 h-12 w-full text-base font-semibold"
        disabled={pending}
        onClick={() => void login()}
      >
        Öffnen
      </Button>
    </div>
  );
}

export function StaffDesk({ locationName }: { locationName: string }) {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [selected, setSelected] = useState<CardState | null>(null);
  const [pending, setPending] = useState(false);

  const handleScan = useCallback(async (raw: string) => {
    const parsed = parseStaffScan(raw);
    if (!parsed) {
      toast.error("QR nicht erkannt.");
      return;
    }

    setScanning(false);

    if (parsed.redeem) {
      setPending(true);
      const response = await fetch("/api/staff/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardCode: parsed.cardCode }),
      });
      const data = (await response.json()) as {
        card?: CardState;
        pendingApplied?: number;
        error?: string;
      };
      setPending(false);
      if (!response.ok || !data.card) {
        toast.error(data.error ?? "Einlösen nicht möglich.");
        return;
      }
      toast.success(
        data.pendingApplied
          ? `${data.card.firstName}: eingelöst · +${data.pendingApplied}`
          : `${data.card.firstName}: eingelöst`,
      );
      return;
    }

    const response = await fetch(
      `/api/staff/lookup?code=${encodeURIComponent(parsed.cardCode)}`,
    );
    const data = (await response.json()) as { card?: CardState | null };
    if (!response.ok || !data.card) {
      toast.error("Kunde nicht gefunden.");
      return;
    }
    setSelected(data.card);
    toast.message(`${data.card.firstName} · ${data.card.current}/${STAMPS_FOR_REWARD}`);
  }, []);

  async function stamp(cups: number) {
    if (!selected) return;
    setPending(true);
    const response = await fetch("/api/staff/stamp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardCode: selected.cardCode, cups }),
    });
    const data = (await response.json()) as {
      card?: CardState;
      summary?: string;
      pendingAdded?: number;
      error?: string;
    };
    setPending(false);
    if (!response.ok || !data.card) {
      toast.error(data.error ?? "Nicht geklappt.");
      return;
    }
    let msg = `${data.card.firstName}: ${data.summary ?? `+${cups}`}`;
    if (data.pendingAdded && data.pendingAdded > 0) {
      msg += ` · ${data.pendingAdded} warten`;
    }
    toast.success(msg);
    setSelected(null);
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="terjung-panel rounded-[1.4rem] px-5 py-4 text-center">
        <p className="text-sm font-semibold">{locationName}</p>
      </div>

      {!selected ? (
        <>
          {!scanning ? (
            <Button
              className="h-28 w-full rounded-[1.4rem] text-2xl font-semibold"
              onClick={() => setScanning(true)}
            >
              Scannen
            </Button>
          ) : (
            <div className="paper-card rounded-[1.4rem] p-4">
              <QrScanner onToken={(value) => void handleScan(value)} disabled={pending} />
              <Button variant="ghost" className="mt-3 w-full" onClick={() => setScanning(false)}>
                Abbrechen
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="paper-card space-y-4 rounded-[1.4rem] p-5">
          <div className="text-center">
            <p className="text-3xl font-semibold">{selected.firstName}</p>
            <p className="mt-1 text-lg text-muted-foreground">
              {selected.current} / {STAMPS_FOR_REWARD}
            </p>
          </div>
          <p className="text-center text-sm font-semibold">Wie viele Kaffees?</p>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                disabled={pending}
                onClick={() => void stamp(n)}
                className="h-14 rounded-2xl border border-border bg-cream text-xl font-semibold transition hover:bg-terjung active:scale-95 disabled:opacity-50"
              >
                {n}
              </button>
            ))}
          </div>
          <Button variant="outline" className="h-11 w-full" onClick={() => setSelected(null)}>
            Abbrechen
          </Button>
        </div>
      )}

      <Button
        variant="ghost"
        className="text-muted-foreground"
        onClick={async () => {
          await fetch("/api/staff/logout", { method: "POST" });
          router.refresh();
        }}
      >
        Abmelden
      </Button>
    </div>
  );
}
