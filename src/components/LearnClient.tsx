"use client";

import { useTranslations } from "next-intl";
import { lessonHas3d, lessonsFor } from "@/content/lessons";
import { isUnlocked, skillsFor } from "@/content/skills";
import { Link } from "@/i18n/navigation";
import { todayIso } from "@/lib/progress";
import { useProgress } from "@/lib/useProgress";

export function LearnClient() {
  const t = useTranslations();
  const jurisdictionId = useProgress((state) => state.jurisdictionId);
  const skillsState = useProgress((state) => state.skills);
  const drivingDays = useProgress((state) => state.drivingDays);
  const completed: Record<string, boolean> = {};
  for (const [skillId, value] of Object.entries(skillsState)) {
    completed[skillId] = value.completedLessonIds.length > 0;
  }
  const skills = skillsFor(jurisdictionId);
  const practicedToday = drivingDays.lastIsoDate === todayIso();

  return (
    <div className="stack-lg">
      <header className="page-head">
        <p className="teach-kicker">{t(`jurisdictions.${jurisdictionId}`)}</p>
        <h1 className="display">{t("learn")}</h1>
      </header>
      <p className={`goal-chip ${practicedToday ? "goal-chip-met" : ""}`}>
        {practicedToday ? t("goalMet") : t("dailyGoal")}
      </p>
      <ol className="skill-path">
        {skills.map((skill) => {
          const ready = isUnlocked(skill, completed) || skill.prerequisiteIds.length === 0;
          const lessons = lessonsFor(jurisdictionId, skill.id);
          const progress = skillsState[skill.id];
          const crowns = progress?.crowns ?? 0;
          return (
            <li key={skill.id} className={`skill-card ${ready ? "skill-ready" : "skill-locked"}`}>
              <p className="skill-name">{t(`skills.${skill.id}`)}</p>
              <p className="muted">{ready ? t("unlocked") : t("locked")}</p>
              <p className="crown-row">
                {t("crowns")} {"■".repeat(crowns)}
                {"□".repeat(Math.max(0, 5 - crowns))}
              </p>
              {ready ? (
                <div className="chip-row">
                  {lessons.map((lesson, lessonIndex) => (
                    <Link key={lesson.id} href={`/lesson/${lesson.id}`} className="btn-signal btn-compact">
                      {t("startLesson")} {lessonIndex + 1}
                      {lessonHas3d(lesson) ? ` · ${t("threeD")}` : ""}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="muted">{t("teach.lockedPath")}</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
