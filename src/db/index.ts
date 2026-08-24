import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "@/db/schema";

neonConfig.fetchConnectionCache = true;

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL fehlt. In Vercel die Neon-Connection-String setzen.",
    );
  }
  if (!pool) {
    pool = new Pool({ connectionString: url });
    db = drizzle(pool, { schema });
  }
  return db!;
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}
