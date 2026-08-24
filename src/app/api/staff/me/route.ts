import { NextResponse } from "next/server";

import { locationById } from "@/lib/config";
import { getStaffSession } from "@/lib/session";
import { activityForLocation, guestCount } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getStaffSession();
    if (!session) {
      return NextResponse.json({ staff: null }, { status: 401 });
    }

    const activity = await activityForLocation(
      session.locationId as import("@/lib/config").LocationId,
    );
    const location = locationById(session.locationId);
    const totalGuests = await guestCount();

    return NextResponse.json({
      staff: {
        locationId: session.locationId,
        locationName: location.name,
        address: location.address,
        totalGuests,
      },
      activity,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Serverfehler." }, { status: 500 });
  }
}
