import { NextResponse } from "next/server";

import { extractCardCode } from "@/lib/card-code";
import { getStaffSession } from "@/lib/session";
import { applyRedeem, guestByCardCode } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getStaffSession();
    if (!session) {
      return NextResponse.json({ error: "Bitte zuerst die Theke öffnen." }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as { cardCode?: string } | null;
    const cardCode = extractCardCode(body?.cardCode ?? "");
    if (!cardCode) {
      return NextResponse.json({ error: "Einlöse-QR nicht erkannt." }, { status: 400 });
    }

    const guest = await guestByCardCode(cardCode);
    if (!guest) {
      return NextResponse.json({ error: "Kein Kundenkonto." }, { status: 404 });
    }

    const result = await applyRedeem(
      guest.id,
      session.locationId as import("@/lib/config").LocationId,
    );

    if (!result.ok) {
      return NextResponse.json(
        { error: "Karte ist noch nicht voll – kann nicht eingelöst werden." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      type: "redeem",
      pendingApplied: result.pendingApplied,
      card: result.card,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}
