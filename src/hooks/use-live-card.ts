"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { LIVE_POLL_MS } from "@/lib/config";
import type { CardState } from "@/lib/types";

export function useLiveCard(initial: CardState, enabled = true) {
  const [card, setCard] = useState(initial);
  const [justUpdated, setJustUpdated] = useState(false);
  const prevCurrent = useRef(initial.current);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/guest/me");
    if (!response.ok) return;
    const data = (await response.json()) as { card?: CardState };
    if (!data.card) return;

    if (data.card.current !== prevCurrent.current) {
      prevCurrent.current = data.card.current;
      setJustUpdated(true);
      window.setTimeout(() => setJustUpdated(false), 1800);
    }
    setCard(data.card);
  }, []);

  useEffect(() => {
    setCard(initial);
    prevCurrent.current = initial.current;
  }, [initial]);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => void refresh(), LIVE_POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled, refresh]);

  return { card, justUpdated, refresh };
}
