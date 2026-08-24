import { NextResponse } from "next/server";

import { setGuestCookie } from "@/lib/session";
import { cardStateForGuest, findGuestByUsername, normalizeUsername } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { username?: string; firstName?: string; pin?: string }
      | null;
    const username = normalizeUsername(body?.username ?? body?.firstName ?? "");
    const pin = body?.pin?.trim() ?? "";

    const guest = await findGuestByUsername(username, pin);
    if (!guest) {
      return NextResponse.json(
        { error: "Benutzername oder Code stimmt nicht." },
        { status: 401 },
      );
    }

    const card = await cardStateForGuest(guest);
    await setGuestCookie(guest.id);
    return NextResponse.json({ card });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}
