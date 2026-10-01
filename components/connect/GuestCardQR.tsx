"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface GuestCardQRProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// Escapes characters that are structurally significant in vCard field values
// per RFC 6350 — commas, semicolons, and backslashes.
function escapeVCardValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function buildVCard({ firstName, lastName, email, phone }: GuestCardQRProps): string {
  const fn = escapeVCardValue(`${firstName} ${lastName}`.trim());
  const n = `${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;`;
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${n}`,
    `FN:${fn}`,
    phone ? `TEL;TYPE=CELL:${escapeVCardValue(phone)}` : null,
    email ? `EMAIL:${escapeVCardValue(email)}` : null,
    "NOTE:Connected via brainerdbaptist.org",
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\n");
}

/**
 * Guest card QR — shown on the Connect form success screen.
 *
 * Encodes the submitter's info as a vCard so a greeter can scan it with
 * their phone's camera and get an "Add Contact" prompt on the spot — no
 * login, no lookup, no new backend. Submission itself already reached PCO
 * via the Connect form's own API call; this is purely the in-person handoff.
 */
export default function GuestCardQR(props: GuestCardQRProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(buildVCard(props), {
      width: 240,
      margin: 1,
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
  }, [props.firstName, props.lastName, props.email, props.phone]);

  if (!dataUrl) return null;

  return (
    <div className="mt-6 pt-6 border-t border-border flex flex-col items-center">
      <p className="text-xs font-semibold text-fg-muted uppercase tracking-widest mb-4">
        Show This to a Greeter
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
        A greeter can scan this to save your contact info instantly — no
        forms, no typing.
      </p>
    </div>
  );
}
