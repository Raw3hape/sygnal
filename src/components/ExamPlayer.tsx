"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { buildExam, examPassMark, scoreExam } from "@/content/exam";
import { pedagogyForExam } from "@/content/pedagogy";
import { getScene } from "@/content/scenes";
import { getSignById } from "@/content/signs";
import type { AppLocale, JurisdictionId } from "@/engine/types";
import { localeText } from "@/lib/localeText";
import { useQuality } from "@/lib/useQuality";
import { SignSvg } from "./SignSvg";
import { HintToggle, TeachPanel } from "./TeachPanel";
import { Mascot } from "./Mascot";

const IntersectionSceneView = dynamic(
  () => import("./scene3d/IntersectionSceneView").then((mod) => mod.IntersectionSceneView),
  { ssr: false },
);

export function ExamPlayer({ jurisdiction }: { jurisdiction: JurisdictionId }) {
  const t = useTranslations();
  const localeRaw = useLocale();
  const locale: AppLocale = localeRaw === "pl" || localeRaw === "ru" ? localeRaw : "en";
  const questions = useMemo(() => buildExam(jurisdiction), [jurisdiction]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<boolean | number | null>>(
    () => questions.map(() => null),
  );
  const [hintOpen, setHintOpen] = useState(false);
  const quality = useQuality();
  const question = questions[index];
  const marks = examPassMark();
  const pedagogy = question ? pedagogyForExam(question, jurisdiction) : null;

  if (!question || index >= questions.length) {
    const scored = scoreExam(
      questions.map((item, qIndex) => ({
        points: item.points,
        correct: answers[qIndex] === item.correct,
      })),
    );
    const passed = scored >= marks.pass;
    return (
      <div className="finish-card">
        <Mascot pose={passed ? "celebrate" : "oops"} size="lg" alt={passed ? t("mascot.celebrate") : t("mascot.oops")} />
        <p className="teach-kicker">{passed ? t("pass") : t("fail")}</p>
        <h1 className="display">{passed ? t("pass") : t("fail")}</h1>
        <p className="lede">
          {scored} / {marks.max}
        </p>
        <h2 className="section-title">{t("teach.examReview")}</h2>
        <ol className="review-list">
          {questions.map((item, qIndex) => {
            const ok = answers[qIndex] === item.correct;
            const explain = pedagogyForExam(item, jurisdiction);
            return (
              <li key={item.id} className={ok ? "review-ok" : "review-no"}>
                <p className="review-stem">{localeText(item.prompt, locale)}</p>
                <p className="teach-body">{localeText(ok ? explain.whyCorrect : explain.meaning, locale)}</p>
                <p className="muted">{localeText(explain.how, locale)}</p>
              </li>
            );
          })}
        </ol>
        <button
          type="button"
          className="btn-signal btn-hero"
          onClick={() => {
            setAnswers(questions.map(() => null));
            setIndex(0);
            setHintOpen(false);
          }}
        >
          {t("restartExam")}
        </button>
      </div>
    );
  }

  const sign = question.signId ? getSignById(question.signId) : undefined;
  const scene = question.sceneId ? getScene(question.sceneId) : undefined;

  function commit(value: boolean | number) {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
    setIndex(index + 1);
    setHintOpen(false);
  }

  return (
    <div className="stack">
      <Mascot pose="think" size="sm" alt={t("mascot.think")} />
      <p className="exam-meter">
        {index + 1} / {questions.length} · {question.points} pkt
      </p>
      {sign ? <SignSvg sign={sign} className="sign-hero" /> : null}
      {scene ? (
        <div className="scene-frame">
          <IntersectionSceneView scene={scene} quality={quality} />
        </div>
      ) : null}
      <p className="prompt">{localeText(question.prompt, locale)}</p>
      {pedagogy ? (
        <HintToggle pedagogy={pedagogy} locale={locale} open={hintOpen} onToggle={() => setHintOpen((value) => !value)} />
      ) : null}
      <div className="exam-cta">
      {question.kind === "yes-no" ? (
        <div className="choice-grid choice-grid-2">
          <button type="button" className="choice" onClick={() => commit(true)}>
            {t("yes")}
          </button>
          <button type="button" className="choice" onClick={() => commit(false)}>
            {t("no")}
          </button>
        </div>
      ) : (
        <div className="choice-grid">
          {question.choices?.map((choice, choiceIndex) => (
            <button
              key={localeText(choice, locale)}
              type="button"
              className="choice"
              onClick={() => commit(choiceIndex)}
            >
              {localeText(choice, locale)}
            </button>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
