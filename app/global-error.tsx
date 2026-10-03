"use client";

// Replaces the root layout when it fails, so no site CSS or fonts are loaded.
// Everything is self-contained and follows the OS colour scheme.
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <style>{`
          body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;
            font-family:system-ui,sans-serif;background:#f4f5f8;color:#0d1b3d}
          .card{max-width:440px;text-align:center;padding:40px;border-radius:16px;
            background:#fff;border:1px solid #d9dde8;box-shadow:0 8px 30px rgba(13,27,61,.08)}
          h1{margin:0 0 12px;font-size:1.75rem}
          p{margin:0 0 24px;line-height:1.6;color:#4a5578}
          button{font:inherit;font-weight:700;cursor:pointer;border:0;border-radius:999px;
            padding:12px 28px;background:#0b6f86;color:#fff}
          @media (prefers-color-scheme:dark){
            body{background:#0e1424;color:#eef1fa}
            .card{background:#161d33;border-color:#2a3350;box-shadow:none}
            p{color:#a9b3d1}
            button{background:#27b5d3;color:#06222b}
          }
        `}</style>
        <div className="card">
          <h1>Something went wrong</h1>
          <p>It&rsquo;s on our end, not yours. Please try again.</p>
          <button type="button" onClick={() => retry()}>Try again</button>
        </div>
      </body>
    </html>
  );
}
