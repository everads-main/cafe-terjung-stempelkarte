import { cookies } from "next/headers";

import {
  cardStateForGuest,
  guestById,
  staffSessionById,
} from "@/lib/store";
import type { CardState } from "@/lib/types";

export const GUEST_COOKIE = "terjung_guest";
export const STAFF_COOKIE = "terjung_staff";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export async function setGuestCookie(guestId: string) {
  const jar = await cookies();
  jar.set(GUEST_COOKIE, guestId, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 400,
  });
}

export async function clearGuestCookie() {
  const jar = await cookies();
  jar.delete(GUEST_COOKIE);
}

export async function setStaffCookie(sessionId: string) {
  const jar = await cookies();
  jar.set(STAFF_COOKIE, sessionId, {
    ...cookieOptions,
    maxAge: 60 * 60 * 12,
  });
}

export async function clearStaffCookie() {
  const jar = await cookies();
  jar.delete(STAFF_COOKIE);
}

export async function getGuestId() {
  const jar = await cookies();
  return jar.get(GUEST_COOKIE)?.value ?? null;
}

export async function getStaffSessionId() {
  const jar = await cookies();
  return jar.get(STAFF_COOKIE)?.value ?? null;
}

export async function getGuestCard(): Promise<CardState | null> {
  const guestId = await getGuestId();
  if (!guestId) return null;
  const guest = await guestById(guestId);
  return guest ? await cardStateForGuest(guest) : null;
}

export async function getStaffSession() {
  const sessionId = await getStaffSessionId();
  if (!sessionId) return null;
  return staffSessionById(sessionId);
}
