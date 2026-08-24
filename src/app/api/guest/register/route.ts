import { NextResponse } from "next/server";

import { setGuestCookie } from "@/lib/session";
import {
  cardStateForGuest,
  createGuest,
  findGuestByUsername,
  normalizeUsername,
  usernameTaken,
} from "@/lib/store";

export const dynamic = "force-dynamic";

function validUsername(name: string) {
  return /^[A-Za-zÄÖÜäöüß0-9][A-Za-zÄÖÜäöüß0-9._-]{2,29}$/.test(name);
}

function validPin(pin: string) {
  return /^\d{4}$/.test(pin);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | { username?: string; firstName?: string; pin?: string }
      | null;
    const username = normalizeUsername(body?.username ?? body?.firstName ?? "");
    const pin = body?.pin?.trim() ?? "";

    if (!validUsername(username)) {
      return NextResponse.json(
        {
          error:
            "Benutzername: 3–30 Zeichen, Buchstaben/Zahlen. z. B. anna_mueller",
        },
        { status: 400 },
      );
    }
    if (!validPin(pin)) {
      return NextResponse.json(
        { error: "Der Code muss genau vier Ziffern haben." },
        { status: 400 },
      );
    }

    if (await usernameTaken(username)) {
      return NextResponse.json(
        { error: "Diesen Benutzernamen gibt es schon. Bitte einen anderen wählen." },
        { status: 409 },
      );
    }

    const guest = await createGuest(username, pin);
    const card = await cardStateForGuest(guest);
    await setGuestCookie(guest.id);
    return NextResponse.json({ card });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}
