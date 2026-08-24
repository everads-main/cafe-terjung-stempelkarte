import { TERJUNG_LOGO_PNG_BASE64 } from "@/lib/terjung-logo-data";

export const dynamic = "force-static";

export function GET() {
  const body = Buffer.from(TERJUNG_LOGO_PNG_BASE64, "base64");

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(body.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
