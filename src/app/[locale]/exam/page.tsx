"use client";

import { ExamPlayer } from "@/components/ExamPlayer";
import { useTranslations } from "next-intl";
import { useProgress } from "@/lib/useProgress";

export default function ExamPage() {
  const t = useTranslations();
  const jurisdictionId = useProgress((state) => state.jurisdictionId);
  return (
    <div className="stack">
      <header className="page-head">
        <p className="teach-kicker">{t(`jurisdictions.${jurisdictionId}`)}</p>
        <h1 className="display">{t("exam")}</h1>
      </header>
      <p className="lede">{t("examIntro")}</p>
      <ExamPlayer jurisdiction={jurisdictionId} />
    </div>
  );
}
