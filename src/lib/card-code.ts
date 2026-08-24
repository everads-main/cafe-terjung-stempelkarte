const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeCardCode(raw: string) {
  const compact = raw.trim().toUpperCase().replace(/\s+/g, "");
  const body = compact.startsWith("TJ-") ? compact.slice(3) : compact;
  return `TJ-${body}`;
}

export function extractCardCode(raw: string) {
  const value = raw.trim();
  try {
    const url = new URL(value);
    const redeemMatch = url.pathname.match(/\/r\/([A-Za-z0-9-]+)/i);
    if (redeemMatch?.[1]) return normalizeCardCode(redeemMatch[1]);
    const fromPath = url.pathname.match(/\/k\/([A-Za-z0-9-]+)/i);
    if (fromPath?.[1]) return normalizeCardCode(fromPath[1]);
    const query = url.searchParams.get("c");
    if (query) return normalizeCardCode(query);
  } catch {
    const redeemMatch = value.match(/\/r\/([A-Za-z0-9-]+)/i);
    if (redeemMatch?.[1]) return normalizeCardCode(redeemMatch[1]);
    const match = value.match(/\/k\/([A-Za-z0-9-]+)/i);
    if (match?.[1]) return normalizeCardCode(match[1]);
  }

  const compact = value.toUpperCase().replace(/\s+/g, "");
  if (/^(TJ-)?[A-Z0-9]{3,8}$/.test(compact)) {
    return normalizeCardCode(compact);
  }
  return null;
}

/** Theken-Scan: Stempel-QR (/k/…) oder Einlöse-QR (/r/…). */
export function parseStaffScan(raw: string): { cardCode: string; redeem: boolean } | null {
  const value = raw.trim();
  try {
    const url = new URL(value);
    if (/\/r\//i.test(url.pathname)) {
      const code = extractCardCode(value);
      return code ? { cardCode: code, redeem: true } : null;
    }
  } catch {
    if (/\/r\//i.test(value)) {
      const code = extractCardCode(value);
      return code ? { cardCode: code, redeem: true } : null;
    }
  }
  const code = extractCardCode(raw);
  return code ? { cardCode: code, redeem: false } : null;
}

export function randomCardBody(length = 4) {
  let body = "";
  for (let i = 0; i < length; i += 1) {
    body += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return body;
}

export function preferredCardBody(firstName: string) {
  const letters = firstName
    .toUpperCase()
    .replace(/[^A-ZÄÖÜ]/g, "")
    .replace(/Ä/g, "AE")
    .replace(/Ö/g, "OE")
    .replace(/Ü/g, "UE");
  return (letters.slice(0, 4) || randomCardBody()).padEnd(4, "X").slice(0, 4);
}
