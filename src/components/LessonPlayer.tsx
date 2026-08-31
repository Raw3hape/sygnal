"use client";

import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { createEmptyCard } from "ts-fsrs";
import { gradeItem } from "@/content/grade";
import { lessonHas3d, nextLessonAfter, type Lesson, type LessonItem } from "@/content/lessons";
import { pedagogyForItem } from "@/content/pedagogy";
import { getScene } from "@/content/scenes";
import { getSignById, nameFor } from "@/content/signs";
import type { AppLocale, JurisdictionId } from "@/engine/types";
import { assertNever } from "@/engine/geometry";
import { whoGoesFirst } from "@/engine/whoGoesFirst";
import { Link } from "@/i18n/navigation";
import { localeText } from "@/lib/localeText";
import { deserializeCard, serializeCard } from "@/lib/progress";
import { ratingFromCorrect, reviewCard } from "@/lib/scheduler";
import { useQuality } from "@/lib/useQuality";
import { addXp } from "@/lib/xp";
import { useProgress } from "@/lib/useProgress";
import { SignSvg } from "./SignSvg";
import { HintToggle, TeachPanel } from "./TeachPanel";
import { Mascot } from "./Mascot";

const IntersectionSceneView = dynamic(
  () => import("./scene3d/IntersectionSceneView").then((mod) => mod.IntersectionSceneView),
  { ssr: false },
);

interface LessonPlayerProps {
  lesson: Lesson;
  locale: AppLocale;
}

function reasonMessage(key: string, t: ReturnType<typeof useTranslations>): string {
  const nested = key.startsWith("reason.") ? key.slice("reason.".length) : key;
  return t(`reason.${nested}`);
}

function ItemView({
  item,
  locale,
  jurisdiction,
  answer,
  setAnswer,
  reveal,
}: {
  item: LessonItem;
  locale: AppLocale;
  jurisdiction: JurisdictionId;
  answer: unknown;
  setAnswer: (value: unknown) => void;
  reveal: boolean;
}) {
  const t = useTranslations();
  const quality = useQuality();

  if (item.type === "sign-meaning" || item.type === "true-false") {
    const shown = getSignById(item.signId ?? "");
    return (
      <div className="stack">
        {shown ? <SignSvg sign={shown} className="sign-hero" /> : null}
        {shown ? (
          <p className="plate-code">
            {t("teach.plateCode")} {shown.code}
          </p>
        ) : null}
        {item.type === "sign-meaning" ? (
          <div className="choice-grid">
            {item.choices.map((choiceId, index) => {
              const choice = getSignById(choiceId);
              const selected = answer === index;
              const isCorrect = reveal && index === item.correct;
              const isMiss = reveal && selected && index !== item.correct;
              return (
                <button
                  key={choiceId}
                  type="button"
                  className={`choice ${selected ? "choice-on" : ""} ${isCorrect ? "choice-ok" : ""} ${isMiss ? "choice-no" : ""}`}
                  onClick={() => setAnswer(index)}
                >
                  {choice ? nameFor(choice, locale) : choiceId}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="stack">
            <p className="prompt">{localizedPrompt(item, locale)}</p>
            <div className="choice-grid choice-grid-2">
              <button
                type="button"
                className={`choice ${answer === true ? "choice-on" : ""}`}
                onClick={() => setAnswer(true)}
              >
                {t("yes")}
              </button>
              <button
                type="button"
                className={`choice ${answer === false ? "choice-on" : ""}`}
                onClick={() => setAnswer(false)}
              >
                {t("no")}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (item.type === "mcq" || item.type === "clip-choice") {
    const scene = item.sceneId ? getScene(item.sceneId) : null;
    return (
      <div className="stack">
        {scene ? (
          <div className="scene-frame">
            <IntersectionSceneView scene={scene} quality={quality} playingClip={item.type === "clip-choice"} />
          </div>
        ) : null}
        <p className="prompt">{localeText(item.prompt, locale)}</p>
        <div className="choice-grid">
          {item.choices.map((choice, index) => (
            <button
              key={localeText(choice, locale)}
              type="button"
              className={`choice ${answer === index ? "choice-on" : ""}`}
              onClick={() => setAnswer(index)}
            >
              {localeText(choice, locale)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (item.type === "who-goes-first" || item.type === "hazard-tap") {
    const scene = getScene(item.sceneId);
    const selected = Array.isArray(answer) ? (answer as string[]) : [];
    const ranking = whoGoesFirst(scene, jurisdiction);
    const firstId = ranking.order[0];
    const firstReason = firstId ? ranking.reasonKeys[firstId] : undefined;
    return (
      <div className="stack">
        <p className="prompt">{item.type === "who-goes-first" ? t("whoGoesFirst") : t("tapHazard")}</p>
        <p className="lede">{t(scene.promptKey)}</p>
        <div className="scene-frame scene-frame-tall">
          <IntersectionSceneView
            scene={scene}
            quality={quality}
            selectable
            selectedIds={item.type === "who-goes-first" ? selected : []}
            highlightId={item.type === "hazard-tap" ? (typeof answer === "string" ? answer : undefined) : firstId}
            correctOrder={reveal && item.type === "who-goes-first" ? ranking.order : undefined}
            onSelectActor={(id) => {
              if (item.type === "hazard-tap") {
                setAnswer(id);
                return;
              }
              if (selected.includes(id)) {
                setAnswer(selected.filter((itemId) => itemId !== id));
                return;
              }
              setAnswer([...selected, id]);
            }}
          />
        </div>
        {item.type === "who-goes-first" ? (
          <p className="order-line">{selected.join(" → ") || "—"}</p>
        ) : null}
        {reveal ? (
          <ol className="reason-list">
            {ranking.order.map((id) => {
              const nested = (ranking.reasonKeys[id] ?? "reason.yieldToRight").replace(/^reason\./, "");
              return (
                <li key={id}>
                  <span className="mono">{id}</span>
                  {" — "}
                  {t(`reasonDetail.${nested}`)}
                </li>
              );
            })}
          </ol>
        ) : null}
        {reveal && firstReason ? (
          <p className="engine-note">
            {t("expected")}: {reasonMessage(firstReason, t)}
          </p>
        ) : null}
        {reveal ? <p className="muted">{t("teach.engineNote")}</p> : null}
      </div>
    );
  }

  return assertNever(item);
}

function localizedPrompt(item: Extract<LessonItem, { type: "true-false" }>, locale: AppLocale): string {
  return localeText(item.prompt, locale);
}

export function LessonPlayer({ lesson, locale }: LessonPlayerProps) {
  const t = useTranslations();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<unknown>(null);
  const [feedback, setFeedback] = useState<null | boolean>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const addStoredXp = useProgress((state) => state.addXp);
  const completeLesson = useProgress((state) => state.completeLesson);
  const saveCard = useProgress((state) => state.saveCard);
  const cards = useProgress((state) => state.cards);
  const item = lesson.items[index];
  const total = lesson.items.length;
  const visualProgress = total === 0 ? 0 : Math.min(100, 20 + (index / total) * 80);
  const followUp = nextLessonAfter(lesson.jurisdiction, lesson.id);
  const pedagogy = item ? pedagogyForItem(item, lesson.jurisdiction) : null;

  const signIds = useMemo(
    () =>
      lesson.items
        .map((entry) => (entry.type === "sign-meaning" ? entry.signId : entry.type === "true-false" ? entry.signId : undefined))
        .filter((id): id is string => Boolean(id)),
    [lesson.items],
  );

  if (!item || !pedagogy) {
    const gained = addXp(0, { correct: correctCount, total });
    return (
      <div className="finish-card">
        <Mascot pose="celebrate" size="lg" alt={t("mascot.celebrate")} />
        <p className="teach-kicker">{t("lessonDone")}</p>
        <h1 className="display">{t("lessonDone")}</h1>
        <p className="lede">
          +{gained} {t("xp")}
        </p>
        {followUp ? (
          <Link href={`/lesson/${followUp.id}`} className="btn-signal btn-hero">
            {t("another")} {lessonHas3d(followUp) ? `· ${t("threeD")}` : ""}
          </Link>
        ) : (
          <Link href="/learn" className="btn-signal btn-hero">
            {t("learn")}
          </Link>
        )}
      </div>
    );
  }

  const answerIndex =
    typeof answer === "number" ? answer : typeof answer === "boolean" ? (answer ? 0 : 1) : undefined;

  return (
    <div className="stack-lg">
      {feedback === null ? (
        <div className="lesson-companion">
          <Mascot pose={hintOpen ? "think" : "idle"} size="sm" alt={hintOpen ? t("mascot.think") : t("mascot.idle")} />
        </div>
      ) : null}
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${visualProgress}%` }} />
      </div>
      <ItemView
        item={item}
        locale={locale}
        jurisdiction={lesson.jurisdiction}
        answer={answer}
        setAnswer={(value) => {
          setAnswer(value);
          setFeedback(null);
        }}
        reveal={feedback !== null}
      />
      <HintToggle
        pedagogy={pedagogy}
        locale={locale}
        open={hintOpen}
        onToggle={() => setHintOpen((value) => !value)}
      />
      {feedback !== null ? (
        <TeachPanel
          pedagogy={pedagogy}
          locale={locale}
          correct={feedback}
          answerIndex={answerIndex}
        />
      ) : null}
      <div className="lesson-cta">
        <button
          type="button"
          className="btn-signal btn-hero"
          onClick={() => {
            const result = gradeItem(item, answer, lesson.jurisdiction);
            if (feedback === null) {
              setFeedback(result.correct);
              if (result.correct) {
                setCorrectCount((count) => count + 1);
              }
              const existing = cards[item.id] ? deserializeCard(cards[item.id]!) : createEmptyCard();
              const nextCard = reviewCard(existing, ratingFromCorrect(result.correct));
              saveCard(item.id, serializeCard(nextCard));
              return;
            }
            const last = index + 1 >= total;
            if (last) {
              const gained = addXp(0, { correct: correctCount, total });
              addStoredXp(gained);
              completeLesson(lesson.skillId, lesson.id, signIds);
              setIndex(index + 1);
              return;
            }
            setIndex(index + 1);
            setAnswer(null);
            setFeedback(null);
            setHintOpen(false);
          }}
      >
        {feedback === null ? t("check") : index + 1 >= total ? t("finish") : t("next")}
      </button>
      </div>
    </div>
  );
}

export function useLessonLocale(): AppLocale {
  const locale = useLocale();
  if (locale === "pl" || locale === "ru" || locale === "en") {
    return locale;
  }
  return "en";
}
