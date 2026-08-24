"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CardState } from "@/lib/types";

export function LoginForm({ nextPath = "/karte" }: { nextPath?: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/guest/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pin }),
      });
      const data = (await response.json()) as { card?: CardState; error?: string };
      if (!response.ok || !data.card) {
        throw new Error(data.error ?? "Login fehlgeschlagen.");
      }
      toast.success(`Willkommen zurück, ${data.card.firstName}.`);
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login fehlgeschlagen.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="paper-card rounded-[1.4rem] p-5">
      <h1 className="text-2xl font-semibold text-ink">Anmelden</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Benutzername und dein 4-stelliger Code.
      </p>
      <div className="mt-5 grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="username">Benutzername</Label>
          <Input
            id="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="anna_mueller"
            className="h-12 border-border bg-white text-ink"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="pin">Code</Label>
          <Input
            id="pin"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            className="h-12 bg-cream tracking-[0.4em]"
          />
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <Button
        className="mt-5 h-12 w-full bg-ink text-base font-semibold text-white hover:bg-ink/90"
        disabled={pending}
        onClick={() => void submit()}
      >
        {pending ? "Wird geöffnet…" : "Zur Karte"}
      </Button>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Noch kein Konto?{" "}
        <Link
          href={`/registrieren${nextPath !== "/karte" ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
          className="font-medium text-ink underline underline-offset-4"
        >
          Dann hier registrieren
        </Link>
      </p>
    </div>
  );
}

export function RegisterForm({ nextPath = "/karte" }: { nextPath?: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/guest/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pin }),
      });
      const data = (await response.json()) as { card?: CardState; error?: string };
      if (!response.ok || !data.card) {
        throw new Error(data.error ?? "Registrierung fehlgeschlagen.");
      }
      toast.success(`Konto angelegt – willkommen, ${data.card.firstName}.`);
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrierung fehlgeschlagen.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="paper-card rounded-[1.4rem] p-5">
      <h1 className="text-2xl font-semibold text-ink">Registrieren</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Wähle einen eindeutigen Benutzernamen – nicht nur „Anna“.
      </p>
      <div className="mt-5 grid gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="reg-username">Benutzername</Label>
          <Input
            id="reg-username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="anna_mueller"
            className="h-12 border-border bg-white text-ink"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="reg-pin">4-stelliger Code</Label>
          <Input
            id="reg-pin"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            className="h-12 bg-cream tracking-[0.4em]"
          />
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <Button
        className="mt-5 h-12 w-full bg-ink text-base font-semibold text-white hover:bg-ink/90"
        disabled={pending}
        onClick={() => void submit()}
      >
        {pending ? "Wird angelegt…" : "Konto anlegen"}
      </Button>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Schon ein Konto?{" "}
        <Link href="/login" className="font-medium text-ink underline underline-offset-4">
          Hier anmelden
        </Link>
      </p>
    </div>
  );
}
