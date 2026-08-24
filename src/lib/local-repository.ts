/**
 * Lokaler Demo-Speicher (JSON), wenn keine DATABASE_URL gesetzt ist.
 * Damit kannst du mit zwei Handys im WLAN testen, ohne Neon.
 */
import { randomBytes, createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { berlinDay } from "@/lib/berlin";
import { normalizeCardCode, preferredCardBody, randomCardBody } from "@/lib/card-code";
import {
  DAILY_STAMP_LIMIT,
  DEFAULT_STAFF_PIN,
  isLocationId,
  locationById,
  LOCATIONS,
  MAX_STAMPS_PER_ACTION,
  STAFF_SESSION_TTL_MS,
  STAMPS_FOR_REWARD,
  type LocationId,
} from "@/lib/config";
import type {
  ActivityItem,
  CardHistoryItem,
  CardState,
} from "@/lib/types";

const STORE_PATH = path.join(process.cwd(), "data", "store.json");

export type GuestRow = {
  id: string;
  firstName: string;
  cardCode: string;
  pinHash: string;
  pendingStamps: number;
  createdAt: Date;
};

export type StampStep =
  | { type: "stamp"; cups: number }
  | { type: "pending"; cups: number }
  | { type: "redeem" };

export type StampError =
  | "not_found"
  | "daily_limit"
  | "not_enough"
  | "card_full";

type GuestRec = {
  id: string;
  firstName: string;
  cardCode: string;
  pinHash: string;
  pendingStamps: number;
  createdAt: string;
};

type StampRec = {
  id: string;
  guestId: string;
  cups: number;
  locationId: string;
  createdAt: string;
};

type RedeemRec = {
  id: string;
  guestId: string;
  locationId: string;
  createdAt: string;
};

type SessionRec = {
  id: string;
  locationId: string;
  createdAt: string;
  expiresAt: string;
};

type Store = {
  guests: GuestRec[];
  stamps: StampRec[];
  redemptions: RedeemRec[];
  staffSessions: SessionRec[];
};

let queue: Promise<unknown> = Promise.resolve();

function id(prefix: string) {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

export function hashPin(pin: string) {
  return createHash("sha256").update(`terjung-pin:${pin}`).digest("hex");
}

export function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function normalizeUsername(name: string) {
  return name.trim().replace(/\s+/g, "_");
}

export function verifyStaffPin(pin: string) {
  return pin === DEFAULT_STAFF_PIN;
}

export function isKnownLocation(value: string): value is LocationId {
  return isLocationId(value);
}

export { LOCATIONS };

function seed(): Store {
  const now = Date.now();
  const anna: GuestRec = {
    id: "guest_anna",
    firstName: "anna_mueller",
    cardCode: "TJ-ANNA",
    pinHash: hashPin("1234"),
    pendingStamps: 0,
    createdAt: new Date(now - 50 * 60 * 60 * 1000).toISOString(),
  };
  const luca: GuestRec = {
    id: "guest_luca",
    firstName: "luca_terjung",
    cardCode: "TJ-LUCA",
    pinHash: hashPin("5678"),
    pendingStamps: 0,
    createdAt: new Date(now - 50 * 60 * 60 * 1000).toISOString(),
  };
  const mia: GuestRec = {
    id: "guest_mia",
    firstName: "mia_back",
    cardCode: "TJ-MIA",
    pinHash: hashPin("0000"),
    pendingStamps: 0,
    createdAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
  };

  const stamps: StampRec[] = [];
  for (let i = 0; i < 7; i += 1) {
    stamps.push({
      id: id("stamp"),
      guestId: anna.id,
      cups: 1,
      locationId: "stammhaus",
      createdAt: new Date(now - (30 - i) * 60 * 60 * 1000).toISOString(),
    });
  }
  stamps.push({
    id: id("stamp"),
    guestId: luca.id,
    cups: 10,
    locationId: "stammhaus",
    createdAt: new Date(now - 20 * 60 * 60 * 1000).toISOString(),
  });

  return { guests: [anna, luca, mia], stamps, redemptions: [], staffSessions: [] };
}

async function readStore(): Promise<Store> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Store;
    return {
      guests: (parsed.guests ?? []).map((g) => ({
        ...g,
        pendingStamps: g.pendingStamps ?? 0,
      })),
      stamps: parsed.stamps ?? [],
      redemptions: parsed.redemptions ?? [],
      staffSessions: parsed.staffSessions ?? [],
    };
  } catch {
    const seeded = seed();
    await mkdir(path.dirname(STORE_PATH), { recursive: true });
    await writeFile(STORE_PATH, JSON.stringify(seeded, null, 2));
    return seeded;
  }
}

async function writeStore(store: Store) {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

function withStore<T>(fn: (store: Store) => T | Promise<T>) {
  const run = queue.then(async () => {
    const store = await readStore();
    store.staffSessions = store.staffSessions.filter(
      (s) => new Date(s.expiresAt).getTime() > Date.now(),
    );
    const result = await fn(store);
    await writeStore(store);
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function toGuest(g: GuestRec): GuestRow {
  return {
    id: g.id,
    firstName: g.firstName,
    cardCode: g.cardCode,
    pinHash: g.pinHash,
    pendingStamps: g.pendingStamps,
    createdAt: new Date(g.createdAt),
  };
}

function currentStampsSync(store: Store, guestId: string) {
  const earned = store.stamps
    .filter((s) => s.guestId === guestId)
    .reduce((sum, s) => sum + s.cups, 0);
  const spent =
    store.redemptions.filter((r) => r.guestId === guestId).length * STAMPS_FOR_REWARD;
  return Math.max(0, earned - spent);
}

function stampsTodaySync(store: Store, guestId: string) {
  const today = berlinDay();
  return store.stamps
    .filter((s) => s.guestId === guestId && berlinDay(new Date(s.createdAt)) === today)
    .reduce((sum, s) => sum + s.cups, 0);
}

function cardStateSync(store: Store, guest: GuestRec): CardState {
  const current = currentStampsSync(store, guest.id);
  const today = stampsTodaySync(store, guest.id);
  const history: CardHistoryItem[] = [
    ...store.stamps
      .filter((s) => s.guestId === guest.id)
      .map((s) => ({
        id: s.id,
        type: "stamp" as const,
        createdAt: s.createdAt,
        locationName: locationById(s.locationId).name,
        cups: s.cups,
      })),
    ...store.redemptions
      .filter((r) => r.guestId === guest.id)
      .map((r) => ({
        id: r.id,
        type: "redeem" as const,
        createdAt: r.createdAt,
        locationName: locationById(r.locationId).name,
      })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 12);

  return {
    guestId: guest.id,
    firstName: guest.firstName,
    cardCode: guest.cardCode,
    current,
    stampsToday: today,
    dailyLimit: DAILY_STAMP_LIMIT,
    freeCoffeeReady: current >= STAMPS_FOR_REWARD,
    stampsUntilFree: Math.max(0, STAMPS_FOR_REWARD - current),
    stampsRoom: Math.max(0, STAMPS_FOR_REWARD - current),
    pendingStamps: guest.pendingStamps,
    history,
  };
}

function allocateCode(store: Store, firstName: string) {
  const used = new Set(store.guests.map((g) => g.cardCode));
  const preferred = normalizeCardCode(preferredCardBody(firstName));
  if (!used.has(preferred)) return preferred;
  for (let i = 0; i < 40; i += 1) {
    const candidate = normalizeCardCode(randomCardBody());
    if (!used.has(candidate)) return candidate;
  }
  return normalizeCardCode(randomBytes(3).toString("hex").slice(0, 4).toUpperCase());
}

export async function currentStamps(guestId: string) {
  return withStore((store) => currentStampsSync(store, guestId));
}

export async function cardStateForGuest(guest: GuestRow): Promise<CardState> {
  return withStore((store) => {
    const row = store.guests.find((g) => g.id === guest.id);
    if (!row) throw new Error("Gast nicht gefunden");
    return cardStateSync(store, row);
  });
}

export async function guestById(guestId: string) {
  return withStore((store) => {
    const row = store.guests.find((g) => g.id === guestId);
    return row ? toGuest(row) : null;
  });
}

export async function guestByCardCode(cardCode: string) {
  const normalized = normalizeCardCode(cardCode);
  return withStore((store) => {
    const row = store.guests.find((g) => g.cardCode === normalized);
    return row ? toGuest(row) : null;
  });
}

export async function findGuest(firstName: string, pin: string) {
  return findGuestByUsername(firstName, pin);
}

export async function findGuestByUsername(username: string, pin: string) {
  const pinHash = hashPin(pin);
  const name = normalizeUsername(username).toLocaleLowerCase("de-DE");
  return withStore((store) => {
    const row = store.guests.find(
      (g) =>
        g.firstName.toLocaleLowerCase("de-DE") === name && g.pinHash === pinHash,
    );
    return row ? toGuest(row) : null;
  });
}

export async function usernameTaken(username: string) {
  const name = normalizeUsername(username).toLocaleLowerCase("de-DE");
  return withStore((store) =>
    store.guests.some((g) => g.firstName.toLocaleLowerCase("de-DE") === name),
  );
}

export async function createGuest(firstName: string, pin: string) {
  return withStore((store) => {
    const username = normalizeUsername(firstName);
    const guest: GuestRec = {
      id: id("guest"),
      firstName: username,
      cardCode: allocateCode(store, username),
      pinHash: hashPin(pin),
      pendingStamps: 0,
      createdAt: new Date().toISOString(),
    };
    store.guests.push(guest);
    return toGuest(guest);
  });
}

export async function applyStampBatch(
  guestId: string,
  requestedCups: number,
  locationId: LocationId,
) {
  return withStore((store) => {
    const guest = store.guests.find((g) => g.id === guestId);
    if (!guest) return { ok: false as const, error: "not_found" as const };

    const current = currentStampsSync(store, guestId);
    if (current >= STAMPS_FOR_REWARD) {
      return { ok: false as const, error: "card_full" as const };
    }

    const requested = Math.min(MAX_STAMPS_PER_ACTION, Math.max(1, requestedCups));
    const room = STAMPS_FOR_REWARD - current;
    const cupsAdded = Math.min(requested, room);
    const pendingAdded = requested - cupsAdded;
    const steps: StampStep[] = [];

    if (cupsAdded > 0) {
      if (stampsTodaySync(store, guestId) + cupsAdded > DAILY_STAMP_LIMIT) {
        return { ok: false as const, error: "daily_limit" as const };
      }
      store.stamps.push({
        id: id("stamp"),
        guestId,
        cups: cupsAdded,
        locationId,
        createdAt: new Date().toISOString(),
      });
      steps.push({ type: "stamp", cups: cupsAdded });
    }

    if (pendingAdded > 0) {
      guest.pendingStamps += pendingAdded;
      steps.push({ type: "pending", cups: pendingAdded });
    }

    return {
      ok: true as const,
      type: "stamp" as const,
      cupsAdded,
      pendingAdded,
      steps,
      card: cardStateSync(store, guest),
    };
  });
}

export async function applyRedeem(guestId: string, locationId: LocationId) {
  return withStore((store) => {
    const guest = store.guests.find((g) => g.id === guestId);
    if (!guest) return { ok: false as const, error: "not_enough" as const };
    if (currentStampsSync(store, guestId) < STAMPS_FOR_REWARD) {
      return { ok: false as const, error: "not_enough" as const };
    }

    store.redemptions.push({
      id: id("redeem"),
      guestId,
      locationId,
      createdAt: new Date().toISOString(),
    });

    let pendingApplied = 0;
    let pending = guest.pendingStamps;
    while (pending > 0) {
      const current = currentStampsSync(store, guestId);
      if (current >= STAMPS_FOR_REWARD) break;
      const room = STAMPS_FOR_REWARD - current;
      const add = Math.min(pending, room);
      store.stamps.push({
        id: id("stamp"),
        guestId,
        cups: add,
        locationId,
        createdAt: new Date().toISOString(),
      });
      pendingApplied += add;
      pending -= add;
    }
    guest.pendingStamps = pending;

    return {
      ok: true as const,
      type: "redeem" as const,
      pendingApplied,
      card: cardStateSync(store, guest),
    };
  });
}

export async function guestCount() {
  return withStore((store) => store.guests.length);
}

export async function activityForLocation(locationId: LocationId) {
  return withStore((store) => {
    const items: ActivityItem[] = [];
    for (const s of store.stamps.filter((x) => x.locationId === locationId)) {
      const guest = store.guests.find((g) => g.id === s.guestId);
      if (!guest) continue;
      items.push({
        id: s.id,
        type: "stamp",
        createdAt: s.createdAt,
        firstName: guest.firstName,
        cardCode: guest.cardCode,
        cups: s.cups,
        current: currentStampsSync(store, guest.id),
      });
    }
    for (const r of store.redemptions.filter((x) => x.locationId === locationId)) {
      const guest = store.guests.find((g) => g.id === r.guestId);
      if (!guest) continue;
      items.push({
        id: r.id,
        type: "redeem",
        createdAt: r.createdAt,
        firstName: guest.firstName,
        cardCode: guest.cardCode,
        current: currentStampsSync(store, guest.id),
      });
    }
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20);
  });
}

export async function createStaffSession(locationId: LocationId) {
  return withStore((store) => {
    const now = Date.now();
    const session = {
      id: id("staff"),
      locationId,
      createdAt: new Date(now).toISOString(),
      expiresAt: new Date(now + STAFF_SESSION_TTL_MS).toISOString(),
    };
    store.staffSessions.push(session);
    return {
      id: session.id,
      locationId: session.locationId as LocationId,
      createdAt: new Date(session.createdAt),
      expiresAt: new Date(session.expiresAt),
    };
  });
}

export async function staffSessionById(sessionId: string) {
  return withStore((store) => {
    const row = store.staffSessions.find((s) => s.id === sessionId);
    if (!row) return null;
    if (new Date(row.expiresAt).getTime() <= Date.now()) return null;
    return {
      id: row.id,
      locationId: row.locationId,
      createdAt: new Date(row.createdAt),
      expiresAt: new Date(row.expiresAt),
    };
  });
}

export function formatStampSteps(steps: StampStep[]) {
  return steps
    .map((step) => {
      if (step.type === "redeem") return "eingelöst";
      if (step.type === "pending") return `${step.cups} warten`;
      return `+${step.cups}`;
    })
    .join(" → ");
}
