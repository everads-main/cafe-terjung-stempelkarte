import { NextResponse } from "next/server";

import { clearStaffCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearStaffCookie();
  return NextResponse.json({ ok: true });
}
