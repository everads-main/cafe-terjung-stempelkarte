/**
 * Fails the build when a committed image asset is not a real, decodable image.
 *
 * Binary files cannot be written through the GitHub contents API (it only accepts
 * text), so images live in the repo as base64 embedded inside an SVG wrapper. A
 * single stray character in that base64 still commits and deploys cleanly, but the
 * browser then renders nothing. This check turns that silent failure into a build
 * error.
 */
import { readFileSync } from "node:fs";

const MAGIC = [
  { name: "PNG", at: 0, bytes: [0x89, 0x50, 0x4e, 0x47] },
  { name: "JPEG", at: 0, bytes: [0xff, 0xd8, 0xff] },
  { name: "GIF", at: 0, bytes: [0x47, 0x49, 0x46, 0x38] },
  { name: "WEBP", at: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
];

const assets = [{ path: "public/terjung-logo.svg", minBytes: 1024 }];

let failed = false;

function fail(assetPath, message) {
  failed = true;
  console.error(`FAIL ${assetPath}: ${message}`);
}

for (const { path, minBytes } of assets) {
  let source;
  try {
    source = readFileSync(path, "utf8");
  } catch {
    fail(path, "file is missing");
    continue;
  }

  if (source.length < minBytes) {
    fail(path, `only ${source.length} bytes - looks like a placeholder, not artwork`);
    continue;
  }

  if (/<text[\s>]/.test(source)) {
    fail(path, "contains <text>, so it is a typed stand-in rather than the real logo");
    continue;
  }

  const embedded = source.match(/data:image\/(png|jpeg|gif|webp);base64,([A-Za-z0-9+/=]+)/);
  if (!embedded) {
    fail(path, "no embedded base64 image found");
    continue;
  }

  const [, declaredType, base64] = embedded;

  if (base64.length % 4 !== 0) {
    fail(
      path,
      `base64 length ${base64.length} is not a multiple of 4, so a character was lost or added in transit`,
    );
    continue;
  }

  const bytes = Buffer.from(base64, "base64");
  if (bytes.length === 0) {
    fail(path, "base64 decoded to zero bytes");
    continue;
  }

  const match = MAGIC.find(({ at, bytes: signature }) =>
    signature.every((byte, index) => bytes[at + index] === byte),
  );

  if (!match) {
    fail(path, "decoded data has no recognised image header, so the payload is corrupt");
    continue;
  }

  if (match.name.toLowerCase() !== declaredType.replace("jpeg", "jpeg")) {
    fail(path, `declared ${declaredType} but the bytes are ${match.name}`);
    continue;
  }

  console.log(`OK   ${path}: valid ${match.name}, ${bytes.length} bytes`);
}

if (failed) {
  console.error("\nAsset verification failed - refusing to ship a broken image.");
  process.exit(1);
}

console.log("All image assets verified.");
