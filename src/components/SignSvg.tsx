"use client";

import type { TrafficSign } from "@/content/signs";

export function SignSvg({ sign, className }: { sign: TrafficSign; className?: string }) {
  return (
    <div className={["sign-plate", className].filter(Boolean).join(" ")} aria-label={sign.name.en} role="img">
      {sign.src ? (
        // Official Commons / MUTCD SVG served from /public/signs.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={sign.src} alt="" draggable={false} />
      ) : (
        <div className="sign-plate-fallback" dangerouslySetInnerHTML={{ __html: sign.svg }} />
      )}
    </div>
  );
}
