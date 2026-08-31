"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useQuality } from "@/lib/useQuality";
import { useProgress } from "@/lib/useProgress";

const DrivePark = dynamic(() => import("./scene3d/DrivePark").then((mod) => mod.DrivePark), { ssr: false });

export function DriveClient() {
  const t = useTranslations();
  const jurisdictionId = useProgress((state) => state.jurisdictionId);
  const quality = useQuality();
  const [hold, setHold] = useState(false);
  return (
    <div className="stack">
      <header className="page-head">
        <p className="teach-kicker">{t(`jurisdictions.${jurisdictionId}`)}</p>
        <h1 className="display">{t("drive")}</h1>
      </header>
      <p className="lede">{t("driveHint")}</p>
      <div className="scene-frame scene-frame-tall">
        <DrivePark jurisdiction={jurisdictionId} quality={quality} followHold={hold} />
      </div>
      <button
        type="button"
        className="btn-signal md:hidden"
        onPointerDown={() => setHold(true)}
        onPointerUp={() => setHold(false)}
        onPointerCancel={() => setHold(false)}
      >
        {t("driveMobile")}
      </button>
    </div>
  );
}
