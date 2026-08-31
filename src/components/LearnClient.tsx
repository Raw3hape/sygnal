"use client";

import { useTranslations } from "next-intl";
import { CheckGlyph, LockGlyph, SkillGlyph } from "@/components/glyphs";
import { lessonHas3d, lessonsFor } from "@/content/lessons";
import { isUnlocked, pathNodeStatus, pathStatusLabelKey, skillsFor, type PathNodeStatus } from "@/content/skills";
import { Link } from "@/i18n/navigation";
import { completedSkillsFor, skillProgressFor, todayIso } from "@/lib/progress";
import { useProgress } from "@/lib/useProgress";

function ribbonPath(count: number): string {
  const xs = [31, 51, 67, 41];
  let d = "";
  for (let index = 0; index < count; index += 1) {
    const x = xs[index % xs.length]!;
    const y = 8 + index * (100 / Math.max(count, 1));
    if (index === 0) {
      d = `M ${x} ${y}`;
      continue;
    }
    const prevX = xs[(index - 1) % xs.length]!;
    const prevY = 8 + (index - 1) * (100 / Math.max(count, 1));
    d += ` C ${prevX} ${(prevY + y) / 2}, ${x} ${(prevY + y) / 2}, ${x} ${y}`;
  }
  return d;
}

function nodeProgress(completed: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((completed / total) * 100));
}

export function LearnClient() {
  const t = useTranslations();
  const jurisdictionId = useProgress((state) => state.jurisdictionId);
  const skillsState = useProgress((state) => state.skills);
  const drivingDays = useProgress((state) => state.drivingDays);
  const completed = completedSkillsFor(skillsState, jurisdictionId);
  const skills = skillsFor(jurisdictionId);
  const practicedToday = drivingDays.lastIsoDate === todayIso();
  const currentSkillId = skills.find((skill) => {
    const lessons = lessonsFor(jurisdictionId, skill.id);
    const progress = skillProgressFor(skillsState, jurisdictionId, skill.id);
    const status = pathNodeStatus(
      isUnlocked(skill, completed),
      progress?.completedLessonIds.length ?? 0,
      lessons.length,
    );
    return status === "ready";
  })?.id;

  return (
    <div className="stack-lg">
      <header className="learn-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustrations/path-start.png"
          alt={t("mascot.pathStart")}
          className="path-start-art"
        />
        <p className="teach-kicker">{t(`jurisdictions.${jurisdictionId}`)}</p>
        <h1 className="display">{t("learn")}</h1>
      </header>
      <p className={`goal-chip ${practicedToday ? "goal-chip-met" : ""}`}>
        {practicedToday ? t("goalMet") : t("dailyGoal")}
      </p>
      <div className="learn-map">
        <svg className="learn-ribbon" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d={ribbonPath(skills.length)} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        </svg>
        <ol className="skill-path">
          {skills.map((skill, index) => {
            const lessons = lessonsFor(jurisdictionId, skill.id);
            const progress = skillProgressFor(skillsState, jurisdictionId, skill.id);
            const completedCount = progress?.completedLessonIds.length ?? 0;
            const crowns = progress?.crowns ?? 0;
            const status: PathNodeStatus = pathNodeStatus(isUnlocked(skill, completed), completedCount, lessons.length);
            const ready = status !== "locked";
            return (
              <li
                key={skill.id}
                className={`skill-step skill-step-${index % 4} ${ready ? "skill-ready" : "skill-locked"}`}
              >
                <div className="skill-node-cluster">
                  <div className="skill-ring" style={{ ["--p" as string]: nodeProgress(completedCount, lessons.length) }}>
                    <div
                      className={`skill-node skill-node-${status} ${skill.id === currentSkillId ? "skill-node-current" : ""}`}
                    >
                      {status === "locked" ? <LockGlyph /> : <SkillGlyph skillId={skill.id} />}
                      {status === "done" ? (
                        <span className="skill-check">
                          <CheckGlyph />
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <p className="skill-name">{t(`skills.${skill.id}`)}</p>
                <p className="muted">{t(pathStatusLabelKey(status))}</p>
                <p className="crown-row" aria-label={`${t("crowns")} ${crowns}`}>
                  {Array.from({ length: 5 }, (_, crownIndex) => (
                    <span
                      key={crownIndex}
                      className={crownIndex < crowns ? "crown-on" : "crown-off"}
                    />
                  ))}
                </p>
                {ready ? (
                  <div className="skill-lessons">
                    {lessons.map((lesson, lessonIndex) => (
                      <Link
                        key={lesson.id}
                        href={`/lesson/${lesson.id}`}
                        className={`btn-signal ${lessonIndex === 0 && skill.id === currentSkillId ? "btn-hero" : "btn-compact"}`}
                      >
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
    </div>
  );
}
