# Café Terjung · Stempelkarte

Virtuelle Stempelkarte für Café Terjung (Lüdinghausen): 10 Stempel → nächster Kaffee gratis.

## Links
- **Kunden:** `/login` (Registrieren: `/registrieren`)
- **Theke:** `/personal`

## QR-Codes
Jeder Gast hat einen **einmaligen, festen** Code (`TJ-…`) in der Datenbank. Der QR zeigt immer auf dieses Konto. Der **Einlöse-QR** (`/r/…`) erscheint nur bei voller Karte.

## Live (Everads Vercel + Neon)

### 1. Repo
GitHub: https://github.com/everads-main/cafe-terjung-stempelkarte

### 2. Vercel-Projekt claimen oder importieren
- **Claim (schnell):** Temporary-Deploy übernehmen (nur ~60 Min gültig), im Everads-Account eingeloggt:
  Claim-URL aus dem Agent-Chat / Deploy-Output.
- **Oder:** Vercel → Add New Project → Import `everads-main/cafe-terjung-stempelkarte` → Region `Frankfurt (fra1)`.

### 3. Neon-Datenbank
1. [console.neon.tech](https://console.neon.tech) → Projekt `cafe-terjung` (Region Frankfurt/EU)
2. Connection string kopieren → `DATABASE_URL`
3. Lokal oder in CI:
   ```bash
   export DATABASE_URL='postgresql://...'
   npm run db:push
   # optional Demo-Gäste:
   SEED_DEMO=1 ./scripts/setup-db.sh
   ```

### 4. Environment Variables (Vercel → Settings → Environment Variables)
| Name | Wert | Environments |
|------|------|----------------|
| `DATABASE_URL` | Neon connection string | Production, Preview |
| `STAFF_PIN` | `5954` (ändern für Live) | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | `https://<dein-projekt>.vercel.app` | Production |

Danach **Redeploy**.

### 5. Domain & Handys
- Optional Custom Domain (z. B. `karte.cafe-terjung.de`)
- Firmen-Handys: `/personal` öffnen, PIN, zum Homescreen

## Lokal entwickeln
```bash
npm install
npm run dev   # http://127.0.0.1:43173
```
Ohne `DATABASE_URL` nutzt die App den Demo-Speicher `data/store.json`.

Demo-Gäste (nach Seed / lokal): `anna_mueller`/`1234`, `luca_terjung`/`5678`, `mia_back`/`0000`. Theken-PIN: `5954`.

## Später: Aktuelles / Werbung
Unter der Karte ist ein Platzhalter „Aktuelles“ – dort können Angebote aus einer CMS/DB kommen.
