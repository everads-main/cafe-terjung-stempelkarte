import { NextResponse } from "next/server";

import { isLocationId } from "@/lib/config";
import { setStaffCookie } from "@/lib/session";
import { createStaffSession, verifyStaffPin } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { pin?: string; locationId?: string }
      | null;
    const pin = body?.pin?.trim() ?? "";
    const locationId = body?.locationId ?? "";

    if (!verifyStaffPin(pin)) {
      return NextResponse.json({ error: "Der Admin-Code stimmt nicht." }, { status: 401 });
    }
    if (!isLocationId(locationId)) {
      return NextResponse.json({ error: "Bitte einen Standort wählen." }, { status: 400 });
    }

    const session = await createStaffSession(locationId);
    await setStaffCookie(session.id);
    return NextResponse.json({ locationId: session.locationId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}
