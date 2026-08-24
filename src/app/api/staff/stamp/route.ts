import { NextResponse } from "next/server";

import { extractCardCode } from "@/lib/card-code";
import { DAILY_STAMP_LIMIT, STAMPS_FOR_REWARD } from "@/lib/config";
import { getStaffSession } from "@/lib/session";
import {
  applyStampBatch,
  formatStampSteps,
  guestByCardCode,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getStaffSession();
    if (!session) {
      return NextResponse.json({ error: "Bitte zuerst die Theke öffnen." }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as
      | { cardCode?: string; cups?: number }
      | null;
    const cardCode = extractCardCode(body?.cardCode ?? "");
    if (!cardCode) {
      return NextResponse.json({ error: "Karten-Code nicht erkannt." }, { status: 400 });
    }

    const guest = await guestByCardCode(cardCode);
    if (!guest) {
      return NextResponse.json({ error: "Kein Kundenkonto für diesen QR." }, { status: 404 });
    }

    const cups = Math.min(10, Math.max(1, Number(body?.cups ?? 1) || 1));
    const result = await applyStampBatch(
      guest.id,
      cups,
      session.locationId as import("@/lib/config").LocationId,
    );

    if (!result.ok) {
      if (result.error === "card_full") {
        return NextResponse.json(
          {
            error: `Karte voll (${STAMPS_FOR_REWARD}). Gast muss auf „Einlösen“ den QR zeigen.`,
            code: "card_full",
          },
          { status: 409 },
        );
      }
      if (result.error === "daily_limit") {
        return NextResponse.json(
          { error: `Heute höchstens ${DAILY_STAMP_LIMIT} Tassen.` },
          { status: 429 },
        );
      }
      return NextResponse.json({ error: "Stempeln nicht möglich." }, { status: 400 });
    }

    return NextResponse.json({
      type: "stamp",
      cupsAdded: result.cupsAdded,
      pendingAdded: result.pendingAdded,
      steps: result.steps,
      summary: formatStampSteps(result.steps),
      card: result.card,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}
