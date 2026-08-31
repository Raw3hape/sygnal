"use client";

import type { ItemPedagogy } from "@/content/pedagogy";
import type { AppLocale } from "@/engine/types";
import { localeText } from "@/lib/localeText";
import { useTranslations } from "next-intl";

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
      <p className="teach-kicker">{correct ? t("correct") : t("tryAgain")}</p>
      <h2 className="teach-title">{correct ? t("teach.whyRight") : t("teach.whyWrong")}</h2>
      <p className="teach-body">
        {localeText(correct ? pedagogy.whyCorrect : (wrong ?? pedagogy.whyWrong[0] ?? pedagogy.whyCorrect), locale)}
      </p>
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
        <p className="hint-sheet">
          <span className="teach-kicker">{t("teach.hint")}</span>
          {localeText(pedagogy.hint, locale)}
        </p>
      ) : null}
    </div>
  );
}
