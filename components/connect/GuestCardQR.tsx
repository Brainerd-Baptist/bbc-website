"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * Guest card QR: shown on the Plan a Visit confirmation.
 *
 * Encodes a vCard (built on the server, see lib/guest-card.ts) so the Welcome Team or kids
 * check-in team can scan it with a phone camera and see the visit details on screen.
 */
export default function GuestCardQR({ vcard }: { vcard: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(vcard, {
      width: 360,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0a2540", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vcard]);

  if (!dataUrl) return null;

  return (
    <div className="mt-6 pt-6 border-t border-border flex flex-col items-center">
      <p className="text-xs font-semibold text-fg-muted uppercase tracking-widest mb-4">
        Show This at the Welcome Desk
      </p>
      {/* eslint-disable @next/next/no-img-element, bbc/no-raw-color --
          data: URL, not an optimizable asset; and the QR itself is rendered
          with a fixed white background (see buildVCard call above), so this
          wrapper must stay white too in both themes or the quiet-zone margin
          around the code breaks contrast and the code stops scanning */}
      <img
        src={dataUrl}
        alt="Scannable contact card QR code"
        width={160}
        height={160}
        className="rounded-xl border border-border bg-white p-2"
      />
      {/* eslint-enable @next/next/no-img-element, bbc/no-raw-color */}
      <p className="text-fg-subtle text-xs mt-4 max-w-xs text-center leading-relaxed">
        Our team can scan this to see your visit details and walk your kids
        through check-in. It&apos;s also in your confirmation email.
      </p>
    </div>
  );
}
