#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL fehlt – Schema-Push übersprungen."
  exit 0
fi

echo "Pushing Drizzle schema to Neon…"
npx drizzle-kit push --force

if [[ "${SEED_DEMO:-}" == "1" ]]; then
  echo "Seeding demo guests…"
  npx tsx scripts/seed.ts
fi

echo "Database ready."
