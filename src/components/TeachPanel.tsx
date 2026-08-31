"use client";

import { useTranslations } from "next-intl";
import { Mascot } from "@/components/Mascot";
import type { ItemPedagogy } from "@/content/pedagogy";
import type { AppLocale } from "@/engine/types";
import { localeText } from "@/lib/localeText";

export function TeachPanel({
  pedagogy,
  locale,
  correct,
  answerIndex,
}: {
  pedagogy: ItemPedagogy;
  locale: AppLocale;
  correct: boolean;
  answerIndex?: number;
}) {
  const t = useTranslations();
  const wrong =
    answerIndex !== undefined
      ? pedagogy.whyWrong[answerIndex]
      : pedagogy.whyWrong[0];
  return (
    <section
      className={`teach-sheet ${correct ? "teach-sheet-ok" : "teach-sheet-no"}`}
      aria-live="polite"
    >
      <div className="teach-mascot-row">
        <Mascot
          pose={correct ? "celebrate" : "oops"}
          size="sm"
          alt={correct ? t("mascot.celebrate") : t("mascot.oops")}
        />
        <div className="stack">
          <p className="teach-kicker">{correct ? t("correct") : t("tryAgain")}</p>
          <h2 className="teach-title">{correct ? t("teach.whyRight") : t("teach.whyWrong")}</h2>
          <p className="teach-body">
            {localeText(correct ? pedagogy.whyCorrect : (wrong ?? pedagogy.whyWrong[0] ?? pedagogy.whyCorrect), locale)}
          </p>
        </div>
      </div>
      <h3 className="teach-sub">{t("teach.meaning")}</h3>
      <p className="teach-body">{localeText(pedagogy.meaning, locale)}</p>
      <h3 className="teach-sub">{t("teach.how")}</h3>
      <p className="teach-body">{localeText(pedagogy.how, locale)}</p>
    </section>
  );
}

export function HintToggle({
  pedagogy,
  locale,
  open,
  onToggle,
}: {
  pedagogy: ItemPedagogy;
  locale: AppLocale;
  open: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations();
  return (
    <div className="hint-block">
      <button type="button" className="hint-toggle" onClick={onToggle}>
        {open ? t("teach.hideHint") : t("teach.showHint")}
      </button>
      {open ? (
        <div className="hint-sheet">
          <Mascot pose="think" size="sm" alt={t("mascot.think")} />
          <p className="stack">
            <span className="teach-kicker">{t("teach.hint")}</span>
            <span className="teach-body">{localeText(pedagogy.hint, locale)}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
