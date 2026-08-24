import { NextResponse } from "next/server";

import { getGuestCard } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const card = await getGuestCard();
    if (!card) {
      return NextResponse.json({ card: null }, { status: 401 });
    }
    return NextResponse.json({ card });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}
