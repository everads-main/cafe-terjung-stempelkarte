/**
 * Fails the build when the committed logo payload is not a real, decodable PNG.
 *
 * Binary files cannot be written through the GitHub contents API (it only accepts
 * text), so the logo lives in the repo as base64 inside a TypeScript module. A single
 * stray character in that base64 still commits and deploys cleanly, but the browser
 * then renders a broken-image icon. This check turns that silent failure into a build
 * error.
 */
import { readFileSync } from "node:fs";

const SOURCE = "src/lib/terjung-logo-data.ts";
const MIN_BYTES = 1024;
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function die(message) {
  console.error(`FAIL ${SOURCE}: ${message}`);
  console.error("\nAsset verification failed - refusing to ship a broken logo.");
  process.exit(1);
}

let source;
try {
  source = readFileSync(SOURCE, "utf8");
} catch {
  die("file is missing");
}

const match = source.match(/TERJUNG_LOGO_PNG_BASE64\s*=\s*\n?\s*"([A-Za-z0-9+/=]*)"/);
if (!match) {
  die("no TERJUNG_LOGO_PNG_BASE64 string found");
}

const base64 = match[1];

if (base64.length < MIN_BYTES) {
  die(`base64 is only ${base64.length} characters - that is a placeholder, not artwork`);
}

if (base64.length % 4 !== 0) {
  die(
    `base64 length ${base64.length} is not a multiple of 4, so a character was lost or added in transit`,
  );
}

const bytes = Buffer.from(base64, "base64");

if (bytes.length === 0) {
  die("base64 decoded to zero bytes");
}

if (!PNG_MAGIC.every((byte, index) => bytes[index] === byte)) {
  die(
    `decoded data does not start with the PNG signature (got ${[...bytes.slice(0, 8)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(" ")}), so the payload is corrupt`,
  );
}

// An intact PNG ends with a 12 byte IEND chunk: length, "IEND", then the CRC.
if (bytes.subarray(bytes.length - 8, bytes.length - 4).toString("latin1") !== "IEND") {
  die("decoded PNG has no IEND chunk, so the payload is truncated");
}

console.log(`OK   ${SOURCE}: valid PNG, ${bytes.length} bytes`);
console.log("All image assets verified.");
