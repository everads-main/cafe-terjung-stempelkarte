import { NextResponse } from "next/server";

import { getStaffSession } from "@/lib/session";
import { activityForLocation } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getStaffSession();
    if (!session) {
      return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
    }

    const activity = await activityForLocation(
      session.locationId as import("@/lib/config").LocationId,
    );
    return NextResponse.json({ activity });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}
