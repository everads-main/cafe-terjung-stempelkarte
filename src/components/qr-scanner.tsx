"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function QrScanner({
  onToken,
  disabled,
}: {
  onToken: (token: string) => void;
  disabled?: boolean;
}) {
  const reactId = useId().replace(/:/g, "");
  const elementId = `terjung-scanner-${reactId}`;
  const [manual, setManual] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const lastValue = useRef("");
  const onTokenRef = useRef(onToken);
  const disabledRef = useRef(disabled);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    let cancelled = false;
    let scanner: Html5Qrcode | null = null;
    let started = false;

    async function boot() {
      try {
        scanner = new Html5Qrcode(elementId, { verbose: false });
        await scanner.start(
          { facingMode: "environment" },
          { fps: 8, qrbox: { width: 240, height: 240 } },
          (decoded) => {
            const value = decoded.trim();
            if (!value || value === lastValue.current || disabledRef.current) return;
            lastValue.current = value;
            onTokenRef.current(value);
          },
          () => undefined,
        );
        if (cancelled) {
          await safeStop(scanner);
          return;
        }
        started = true;
        setReady(true);
      } catch {
        if (!cancelled) {
          setCameraError(
            "Kamera nicht verfügbar. Berechtigung erlauben – oder den Code unten einfügen.",
          );
        }
      }
    }

    void boot();

    return () => {
      cancelled = true;
      const current = scanner;
      if (!current) return;
      void (async () => {
        if (started) {
          await safeStop(current);
        } else {
          // Start kann noch laufen – kurz warten, dann stoppen falls nötig
          await new Promise((resolve) => setTimeout(resolve, 400));
          await safeStop(current);
        }
      })();
    };
  }, [elementId]);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[1.4rem] border border-border bg-espresso">
        <div id={elementId} className="min-h-72 w-full overflow-hidden" />
        {!ready && !cameraError ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-primary-foreground/80">
            Kamera wird vorbereitet…
          </div>
        ) : null}
      </div>

      {cameraError ? (
        <p className="text-sm leading-6 text-muted-foreground">{cameraError}</p>
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">
          Den Code aus der Gäste-App ins Bild holen.
        </p>
      )}

      <form
        className="grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const value = manual.trim();
          if (value) onToken(value);
        }}
      >
        <Input
          value={manual}
          onChange={(event) => setManual(event.target.value)}
          placeholder="TJ-ANNA oder Link einfügen"
          className="h-11 bg-paper"
        />
        <Button type="submit" variant="outline" className="h-11" disabled={disabled}>
          Code übernehmen
        </Button>
      </form>
    </div>
  );
}

async function safeStop(scanner: Html5Qrcode) {
  try {
    const state = scanner.getState?.();
    // 2 = SCANNING, 3 = PAUSED in html5-qrcode Html5QrcodeScannerState
    if (state === 2 || state === 3) {
      await scanner.stop();
    }
  } catch {
    // ignore – already stopped / never started
  }
  try {
    scanner.clear();
  } catch {
    // ignore
  }
}
