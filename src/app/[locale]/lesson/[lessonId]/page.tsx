import { LessonClient } from "@/components/LessonClient";
import type { AppLocale } from "@/engine/types";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; lessonId: string }>;
}) {
  const { locale, lessonId } = await params;
  const resolved: AppLocale = locale === "pl" || locale === "ru" ? locale : "en";
  return <LessonClient lessonId={lessonId} locale={resolved} />;
}
