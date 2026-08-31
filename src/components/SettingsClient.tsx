"use client";

import { useTranslations } from "next-intl";
import { JURISDICTIONS } from "@/content/jurisdictions";
import { listSigns } from "@/content/signs";
import type { QualityPreference } from "@/lib/quality";
import { useProgress } from "@/lib/useProgress";
import { SignSvg } from "./SignSvg";

function qualityLabel(
  option: QualityPreference,
  t: ReturnType<typeof useTranslations>,
): string {
  switch (option) {
    case "auto":
      return t("qualityAuto");
    case "low":
      return t("qualityLow");
    case "mid":
      return t("qualityMid");
    case "high":
      return t("qualityHigh");
    default: {
      const exhaustive: never = option;
      return exhaustive;
    }
  }
}

const QUALITY_OPTIONS: QualityPreference[] = ["auto", "low", "mid", "high"];

export function SettingsClient() {
  const t = useTranslations();
  const jurisdictionId = useProgress((state) => state.jurisdictionId);
  const setJurisdiction = useProgress((state) => state.setJurisdiction);
  const attentionMode = useProgress((state) => state.attentionMode);
  const setAttentionMode = useProgress((state) => state.setAttentionMode);
  const qualityOverride = useProgress((state) => state.qualityOverride) ?? "auto";
  const setQualityOverride = useProgress((state) => state.setQualityOverride);
  const collected = useProgress((state) => state.collectedSignIds);
  const signs = listSigns(jurisdictionId).filter((sign) => collected.includes(sign.id));

  return (
    <div className="stack-lg">
      <header className="page-head">
        <p className="teach-kicker">{t("teach.languageVsRules")}</p>
        <h1 className="display">{t("settings")}</h1>
      </header>
      <p className="eyebrow">{t("jurisdiction")}</p>
      <div className="jurisdiction-grid">
        {JURISDICTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`jurisdiction-card ${item.id === jurisdictionId ? "jurisdiction-on" : ""}`}
            onClick={() => setJurisdiction(item.id)}
          >
            <span className="mono">{item.id}</span>
            <span>{t(`jurisdictions.${item.id}`)}</span>
          </button>
        ))}
      </div>
      <p className="eyebrow">
        {t("focus")} / {t("play")}
      </p>
      <div className="choice-grid choice-grid-2">
        <button
          type="button"
          className={`choice ${attentionMode === "focus" ? "choice-on" : ""}`}
          onClick={() => setAttentionMode("focus")}
        >
          {t("focus")}
        </button>
        <button
          type="button"
          className={`choice ${attentionMode === "play" ? "choice-on" : ""}`}
          onClick={() => setAttentionMode("play")}
        >
          {t("play")}
        </button>
      </div>
      <p className="eyebrow">{t("quality")}</p>
      <div className="choice-grid choice-grid-4">
        {QUALITY_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`choice ${qualityOverride === option ? "choice-on" : ""}`}
            onClick={() => setQualityOverride(option)}
          >
            {qualityLabel(option, t)}
          </button>
        ))}
      </div>
      <h2 className="section-title">{t("collection")}</h2>
      {signs.length === 0 ? (
        <div className="empty-collection">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrations/empty-collection.png" alt={t("mascot.emptyCollection")} />
          <p className="muted">{t("teach.collectionEmpty")}</p>
        </div>
      ) : null}
      <div className="collection-grid">
        {signs.map((sign) => (
          <SignSvg key={sign.id} sign={sign} className="sign-thumb" />
        ))}
      </div>
    </div>
  );
}
