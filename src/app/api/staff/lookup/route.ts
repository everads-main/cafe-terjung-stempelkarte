import { NextResponse } from "next/server";

import { extractCardCode } from "@/lib/card-code";
import { getStaffSession } from "@/lib/session";
import { cardStateForGuest, guestByCardCode } from "@/lib/store";

export const dynamic = "force-dynamic";

/** Nach QR-Scan: Kundenkonto inkl. aktueller Tassenstand. */
export async function GET(request: Request) {
  try {
    const session = await getStaffSession();
    if (!session) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const url = new URL(request.url);
    const code = extractCardCode(url.searchParams.get("code") ?? "");
    if (!code) {
      return NextResponse.json({ error: "Kein Code." }, { status: 400 });
    }

    const guest = await guestByCardCode(code);
    if (!guest) {
      return NextResponse.json({ card: null, account: null }, { status: 404 });
    }

    const card = await cardStateForGuest(guest);
    return NextResponse.json({
      account: {
        guestId: guest.id,
        firstName: guest.firstName,
        cardCode: guest.cardCode,
        createdAt: guest.createdAt.toISOString(),
      },
      card,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}
