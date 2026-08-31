"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { isUnlocked, skillsFor } from "@/content/skills";
import { useRouter } from "@/i18n/navigation";
import { useQuality } from "@/lib/useQuality";
import { useProgress } from "@/lib/useProgress";
import { lessonsFor } from "@/content/lessons";

const HubWorld = dynamic(() => import("./scene3d/HubWorld").then((mod) => mod.HubWorld), { ssr: false });

export function HubClient() {
  const t = useTranslations();
  const router = useRouter();
  const jurisdictionId = useProgress((state) => state.jurisdictionId);
  const skillsState = useProgress((state) => state.skills);
  const quality = useQuality();
  const completed: Record<string, boolean> = {};
  for (const [id, value] of Object.entries(skillsState)) {
    completed[id] = value.completedLessonIds.length > 0;
  }
  const labels: Record<string, string> = {};
  for (const skill of skillsFor(jurisdictionId)) {
    labels[skill.id] = t(`skills.${skill.id}`);
  }
  return (
    <div className="stack">
      <header className="page-head">
        <p className="teach-kicker">{t(`jurisdictions.${jurisdictionId}`)}</p>
        <h1 className="display">{t("hub")}</h1>
      </header>
      <div className="scene-frame scene-frame-hub">
        <HubWorld
          jurisdiction={jurisdictionId}
          quality={quality}
          completed={completed}
          labels={labels}
          onOpenSkill={(skillId) => {
            const skill = skillsFor(jurisdictionId).find((node) => node.id === skillId);
            if (!skill || !isUnlocked(skill, completed)) {
              return;
            }
            const first = lessonsFor(jurisdictionId, skillId)[0];
            if (first) {
              router.push(`/lesson/${first.id}`);
            }
          }}
        />
      </div>
    </div>
  );
}
