import "dotenv/config";

import { eq } from "drizzle-orm";

import { getDb } from "../src/db/index";
import { guests, stampEvents } from "../src/db/schema";
import { hashPin } from "../src/lib/repository";

async function main() {
  const db = getDb();

  const demoGuests = [
    { firstName: "anna_mueller", cardCode: "TJ-ANNA", pin: "1234", stamps: 7 },
    { firstName: "luca_terjung", cardCode: "TJ-LUCA", pin: "5678", stamps: 10 },
    { firstName: "mia_back", cardCode: "TJ-MIA", pin: "0000", stamps: 0 },
  ];

  for (const demo of demoGuests) {
    const [found] = await db
      .select()
      .from(guests)
      .where(eq(guests.cardCode, demo.cardCode));

    if (found) {
      console.log(`Skip ${demo.cardCode} (exists)`);
      continue;
    }

    const [guest] = await db
      .insert(guests)
      .values({
        firstName: demo.firstName,
        cardCode: demo.cardCode,
        pinHash: hashPin(demo.pin),
      })
      .returning();

    if (demo.stamps > 0) {
      await db.insert(stampEvents).values({
        guestId: guest.id,
        cups: demo.stamps,
        locationId: "stammhaus",
      });
    }
    console.log(`Created ${demo.cardCode} (${demo.stamps} stamps)`);
  }

  console.log("Seed done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
