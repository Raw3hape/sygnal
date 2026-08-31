"use client";

import { useTranslations } from "next-intl";
import { getLesson } from "@/content/lessons";
import type { AppLocale } from "@/engine/types";
import { useProgress } from "@/lib/useProgress";
import { LessonPlayer } from "./LessonPlayer";

export function LessonClient({ lessonId, locale }: { lessonId: string; locale: AppLocale }) {
  const t = useTranslations();
  const jurisdictionId = useProgress((state) => state.jurisdictionId);
  const lesson = getLesson(jurisdictionId, lessonId);
  if (!lesson) {
    return <p>{t("missingLesson")}</p>;
  }
  return <LessonPlayer lesson={lesson} locale={locale} />;
}
