import { randomBytes, createHash } from "node:crypto";
import { count, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/db";
import {
  guests,
  redemptionEvents,
  staffSessions,
  stampEvents,
} from "@/db/schema";
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
  GuestSummary,
} from "@/lib/types";

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

export function isKnownLocation(id: string): id is LocationId {
  return isLocationId(id);
}

export { LOCATIONS };

async function allocateCardCode(firstName: string): Promise<string> {
  const db = getDb();
  const rows = await db.select({ cardCode: guests.cardCode }).from(guests);
  const used = new Set(rows.map((row) => row.cardCode));
  const preferred = normalizeCardCode(preferredCardBody(firstName));
  if (!used.has(preferred)) return preferred;
  for (let i = 0; i < 40; i += 1) {
    const candidate = normalizeCardCode(randomCardBody());
    if (!used.has(candidate)) return candidate;
  }
  return normalizeCardCode(randomBytes(3).toString("hex").slice(0, 4).toUpperCase());
}

export async function currentStamps(guestId: string) {
  const db = getDb();
  const [stampRow] = await db
    .select({ total: sql<number>`coalesce(sum(${stampEvents.cups}), 0)` })
    .from(stampEvents)
    .where(eq(stampEvents.guestId, guestId));
  const [redeemRow] = await db
    .select({ total: count() })
    .from(redemptionEvents)
    .where(eq(redemptionEvents.guestId, guestId));
  const earned = Number(stampRow?.total ?? 0);
  const spent = Number(redeemRow?.total ?? 0) * STAMPS_FOR_REWARD;
  return Math.max(0, earned - spent);
}

export async function stampsToday(guestId: string) {
  const db = getDb();
  const today = berlinDay();
  const rows = await db
    .select({ cups: stampEvents.cups, createdAt: stampEvents.createdAt })
    .from(stampEvents)
    .where(eq(stampEvents.guestId, guestId));
  return rows
    .filter((row) => berlinDay(row.createdAt) === today)
    .reduce((sum, row) => sum + row.cups, 0);
}

async function redeemGuest(guestId: string, locationId: LocationId) {
  const db = getDb();
  await db.insert(redemptionEvents).values({ guestId, locationId });
}

export async function cardStateForGuest(guest: GuestRow): Promise<CardState> {
  const current = await currentStamps(guest.id);
  const today = await stampsToday(guest.id);
  const db = getDb();

  const stamps = await db
    .select()
    .from(stampEvents)
    .where(eq(stampEvents.guestId, guest.id))
    .orderBy(desc(stampEvents.createdAt))
    .limit(20);

  const redeems = await db
    .select()
    .from(redemptionEvents)
    .where(eq(redemptionEvents.guestId, guest.id))
    .orderBy(desc(redemptionEvents.createdAt))
    .limit(20);

  const history: CardHistoryItem[] = [
    ...stamps.map((row) => ({
      id: row.id,
      type: "stamp" as const,
      createdAt: row.createdAt.toISOString(),
      locationName: locationById(row.locationId).name,
      cups: row.cups,
    })),
    ...redeems.map((row) => ({
      id: row.id,
      type: "redeem" as const,
      createdAt: row.createdAt.toISOString(),
      locationName: locationById(row.locationId).name,
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

export async function guestById(guestId: string): Promise<GuestRow | null> {
  const db = getDb();
  const [row] = await db.select().from(guests).where(eq(guests.id, guestId));
  return row ?? null;
}

export async function guestByCardCode(cardCode: string): Promise<GuestRow | null> {
  const db = getDb();
  const normalized = normalizeCardCode(cardCode);
  const [row] = await db.select().from(guests).where(eq(guests.cardCode, normalized));
  return row ?? null;
}

export async function findGuest(firstName: string, pin: string) {
  return findGuestByUsername(firstName, pin);
}

export async function findGuestByUsername(username: string, pin: string) {
  const db = getDb();
  const pinHash = hashPin(pin);
  const name = normalizeUsername(username).toLocaleLowerCase("de-DE");
  const rows = await db.select().from(guests);
  return (
    rows.find(
      (guest) =>
        guest.firstName.toLocaleLowerCase("de-DE") === name &&
        guest.pinHash === pinHash,
    ) ?? null
  );
}

export async function usernameTaken(username: string) {
  const db = getDb();
  const name = normalizeUsername(username).toLocaleLowerCase("de-DE");
  const rows = await db.select().from(guests);
  return rows.some((guest) => guest.firstName.toLocaleLowerCase("de-DE") === name);
}

export async function createGuest(firstName: string, pin: string) {
  const db = getDb();
  const username = normalizeUsername(firstName);
  const cardCode = await allocateCardCode(username);
  const [row] = await db
    .insert(guests)
    .values({
      firstName: username,
      cardCode,
      pinHash: hashPin(pin),
    })
    .returning();
  return row;
}

export type StampError =
  | "not_found"
  | "daily_limit"
  | "not_enough"
  | "card_full";

async function applyPendingStamps(guestId: string, locationId: LocationId) {
  const db = getDb();
  const guest = await guestById(guestId);
  if (!guest || guest.pendingStamps <= 0) return 0;

  let pending = guest.pendingStamps;
  let applied = 0;

  while (pending > 0) {
    const current = await currentStamps(guestId);
    if (current >= STAMPS_FOR_REWARD) break;
    const room = STAMPS_FOR_REWARD - current;
    const add = Math.min(pending, room);
    await db.insert(stampEvents).values({ guestId, cups: add, locationId });
    applied += add;
    pending -= add;
  }

  await db
    .update(guests)
    .set({ pendingStamps: pending })
    .where(eq(guests.id, guestId));

  return applied;
}

export async function applyStampBatch(
  guestId: string,
  requestedCups: number,
  locationId: LocationId,
): Promise<
  | {
      ok: true;
      type: "stamp";
      cupsAdded: number;
      pendingAdded: number;
      steps: StampStep[];
      card: CardState;
    }
  | { ok: false; error: StampError }
> {
  const db = getDb();
  const guest = await guestById(guestId);
  if (!guest) return { ok: false, error: "not_found" };

  const current = await currentStamps(guestId);
  if (current >= STAMPS_FOR_REWARD) {
    return { ok: false, error: "card_full" };
  }

  const requested = Math.min(MAX_STAMPS_PER_ACTION, Math.max(1, requestedCups));
  const room = STAMPS_FOR_REWARD - current;
  const cupsAdded = Math.min(requested, room);
  const pendingAdded = requested - cupsAdded;
  const steps: StampStep[] = [];

  if (cupsAdded > 0) {
    const today = await stampsToday(guestId);
    if (today + cupsAdded > DAILY_STAMP_LIMIT) {
      return { ok: false, error: "daily_limit" };
    }
    await db.insert(stampEvents).values({ guestId, cups: cupsAdded, locationId });
    steps.push({ type: "stamp", cups: cupsAdded });
  }

  if (pendingAdded > 0) {
    await db
      .update(guests)
      .set({ pendingStamps: guest.pendingStamps + pendingAdded })
      .where(eq(guests.id, guestId));
    steps.push({ type: "pending", cups: pendingAdded });
  }

  const updatedGuest = await guestById(guestId);
  if (!updatedGuest) return { ok: false, error: "not_found" };

  return {
    ok: true,
    type: "stamp",
    cupsAdded,
    pendingAdded,
    steps,
    card: await cardStateForGuest(updatedGuest),
  };
}

export async function applyRedeem(guestId: string, locationId: LocationId) {
  const guest = await guestById(guestId);
  if (!guest) return { ok: false as const, error: "not_enough" as const };
  const current = await currentStamps(guestId);
  if (current < STAMPS_FOR_REWARD) {
    return { ok: false as const, error: "not_enough" as const };
  }
  await redeemGuest(guestId, locationId);
  const pendingApplied = await applyPendingStamps(guestId, locationId);
  const updatedGuest = await guestById(guestId);
  if (!updatedGuest) return { ok: false as const, error: "not_enough" as const };
  return {
    ok: true as const,
    type: "redeem" as const,
    pendingApplied,
    card: await cardStateForGuest(updatedGuest),
  };
}

export async function guestCount() {
  const db = getDb();
  const [row] = await db.select({ total: count() }).from(guests);
  return Number(row?.total ?? 0);
}

export async function activityForLocation(locationId: LocationId) {
  const db = getDb();
  const stamps = await db
    .select({
      id: stampEvents.id,
      guestId: stampEvents.guestId,
      cups: stampEvents.cups,
      createdAt: stampEvents.createdAt,
    })
    .from(stampEvents)
    .where(eq(stampEvents.locationId, locationId))
    .orderBy(desc(stampEvents.createdAt))
    .limit(30);

  const redeems = await db
    .select({
      id: redemptionEvents.id,
      guestId: redemptionEvents.guestId,
      createdAt: redemptionEvents.createdAt,
    })
    .from(redemptionEvents)
    .where(eq(redemptionEvents.locationId, locationId))
    .orderBy(desc(redemptionEvents.createdAt))
    .limit(30);

  const items: ActivityItem[] = [];

  for (const row of stamps) {
    const guest = await guestById(row.guestId);
    if (!guest) continue;
    items.push({
      id: row.id,
      type: "stamp",
      createdAt: row.createdAt.toISOString(),
      firstName: guest.firstName,
      cardCode: guest.cardCode,
      cups: row.cups,
      current: await currentStamps(row.guestId),
    });
  }

  for (const row of redeems) {
    const guest = await guestById(row.guestId);
    if (!guest) continue;
    items.push({
      id: row.id,
      type: "redeem",
      createdAt: row.createdAt.toISOString(),
      firstName: guest.firstName,
      cardCode: guest.cardCode,
      current: await currentStamps(row.guestId),
    });
  }

  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20);
}

export async function createStaffSession(locationId: LocationId) {
  const db = getDb();
  const id = `staff_${randomBytes(8).toString("hex")}`;
  const now = Date.now();
  const expiresAt = new Date(now + STAFF_SESSION_TTL_MS);
  await db.insert(staffSessions).values({
    id,
    locationId,
    expiresAt,
  });
  return { id, locationId, createdAt: new Date(now), expiresAt };
}

export async function staffSessionById(sessionId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(staffSessions)
    .where(eq(staffSessions.id, sessionId));
  if (!row) return null;
  if (row.expiresAt.getTime() <= Date.now()) return null;
  return row;
}

function formatStampSteps(steps: StampStep[]) {
  return steps
    .map((step) => {
      if (step.type === "redeem") return "eingelöst";
      if (step.type === "pending") return `${step.cups} warten`;
      return `+${step.cups}`;
    })
    .join(" → ");
}

export { formatStampSteps };
