import { NextResponse } from "next/server";

import { clearGuestCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearGuestCookie();
  return NextResponse.json({ ok: true });
}
