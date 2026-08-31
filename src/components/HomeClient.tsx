"use client";

import { useTranslations } from "next-intl";
import { JURISDICTIONS } from "@/content/jurisdictions";
import { Link } from "@/i18n/navigation";
import { useProgress } from "@/lib/useProgress";

export function HomeClient() {
  const t = useTranslations();
  const complete = useProgress((state) => state.onboardingComplete);
  const completeOnboarding = useProgress((state) => state.completeOnboarding);
  const jurisdictionId = useProgress((state) => state.jurisdictionId);

  if (!complete) {
    return (
      <div className="home-board">
        <p className="teach-kicker">{t("appName")}</p>
        <h1 className="display">{t("onboardingTitle")}</h1>
        <p className="lede">{t("onboardingBody")}</p>
        <p className="eyebrow">{t("language")}</p>
        <div className="chip-row">
          <Link href="/" locale="en" className="chip">
            EN
          </Link>
          <Link href="/" locale="pl" className="chip">
            PL
          </Link>
          <Link href="/" locale="ru" className="chip">
            RU
          </Link>
        </div>
        <p className="eyebrow">{t("jurisdiction")}</p>
        <p className="muted">{t("teach.languageVsRules")}</p>
        <div className="jurisdiction-grid">
          {JURISDICTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="jurisdiction-card"
              onClick={() => completeOnboarding(item.id)}
            >
              <span className="mono">{item.id}</span>
              <span>{t(`jurisdictions.${item.id}`)}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="home-board">
      <p className="teach-kicker">{t(`jurisdictions.${jurisdictionId}`)}</p>
      <h1 className="display">{t("appName")}</h1>
      <p className="lede">{t("tagline")}</p>
      <div className="home-actions">
        <Link href="/learn" className="btn-signal">
          {t("learn")}
        </Link>
        <Link href="/hub" className="btn-ink">
          {t("hub")}
        </Link>
      </div>
    </div>
  );
}
