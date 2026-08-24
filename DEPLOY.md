# Live-Setup · Everads Vercel

## Sofort (Claim, ~40 Min gültig)

Im **Everads-Vercel-Account** eingeloggt diesen Link öffnen und Deployment übernehmen:

**https://vercel.com/claim-deployment?code=1116f9df-c33f-45f7-897d-dfa9cdc4db66**

Preview bis Claim: https://temporary-quick-bamboo-ha63nal.vercel.app  
(ohne Neon nur Demo/ohne Persistenz – DB ist Pflicht für Live.)

## Dauerhaft: GitHub → Vercel

Repo: https://github.com/everads-main/cafe-terjung-stempelkarte

1. Vercel → **Add New… → Project** → Import `everads-main/cafe-terjung-stempelkarte`
2. Framework: Next.js, Region: **Frankfurt (fra1)**
3. Env setzen (siehe unten) → Deploy

## Neon

1. https://console.neon.tech → neues Projekt `cafe-terjung` (EU/Frankfurt)
2. Connection string als `DATABASE_URL` kopieren
3. In Vercel: Settings → Environment Variables:

| Variable | Beispiel |
|----------|----------|
| `DATABASE_URL` | `postgresql://…@ep-….neon.tech/neondb?sslmode=require` |
| `STAFF_PIN` | `5954` (für Produktion ändern) |
| `NEXT_PUBLIC_APP_URL` | `https://dein-projekt.vercel.app` |

4. Redeploy – Build führt `scripts/setup-db.sh` aus (Schema-Push).

Optional Demo-Gäste lokal:
```bash
export DATABASE_URL='…'
SEED_DEMO=1 ./scripts/setup-db.sh
```

## Agent braucht zum Fertigstellen

Falls du willst, dass der Agent Env + Redeploy selbst setzt, einmalig:

1. Vercel → Account → Tokens → Create (`VERCEL_TOKEN`)
2. Neon → API Keys → Create (`NEON_API_KEY`) **oder** nur `DATABASE_URL` schicken
3. Token/URL hier in den Chat (oder als Secret) legen

Ohne Token kann der Agent dein Everads-Login im Browser **nicht** mitnutzen.
