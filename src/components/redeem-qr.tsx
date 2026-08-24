"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function RedeemQr({ cardCode, size = 240 }: { cardCode: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const url = `${window.location.origin}/r/${cardCode}`;
    void QRCode.toDataURL(url, {
      width: size * 2,
      margin: 1,
      color: { dark: "#2a1c14", light: "#fffaf3" },
      errorCorrectionLevel: "M",
    }).then(setSrc);
  }, [cardCode, size]);

  if (!src) {
    return (
      <div
        className="mx-auto animate-pulse rounded-2xl bg-muted"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Einlöse-QR"
      width={size}
      height={size}
      className="mx-auto rounded-2xl bg-paper"
    />
  );
}
