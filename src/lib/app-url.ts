export function appUrlFromRequest(request: Request) {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export function extractToken(raw: string) {
  const value = raw.trim();
  try {
    const url = new URL(value);
    return url.searchParams.get("t") ?? value;
  } catch {
    const match = value.match(/[?&]t=([A-Za-z0-9]+)/);
    return match?.[1] ?? value;
  }
}
