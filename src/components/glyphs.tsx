import type { ReactNode } from "react";
import type { SkillId } from "@/content/skills";
import { assertNever } from "@/engine/geometry";

export type NavKey = "learn" | "hub" | "exam" | "drive" | "settings";

function IconFrame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="tab-icon" aria-hidden="true">
      {children}
    </svg>
  );
}

export function NavIcon({ name }: { name: NavKey }) {
  switch (name) {
    case "learn":
      return (
        <IconFrame>
          <circle cx="7" cy="8" r="2.4" />
          <circle cx="16" cy="12" r="2.4" />
          <circle cx="8" cy="17" r="2.4" />
          <path d="M8.8 9.6c2.2 1 4.6 1.4 6.2 1.8M14.2 14.2c-2 .9-4.2 2-5.4 2.5" />
        </IconFrame>
      );
    case "hub":
      return (
        <IconFrame>
          <path d="M4 18V9.5L12 4l8 5.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18Z" />
          <path d="M10 19.5v-6h4v6" />
        </IconFrame>
      );
    case "exam":
      return (
        <IconFrame>
          <path d="M7 4.5h10a2 2 0 0 1 2 2V19l-3-1.4-3 1.4-3-1.4-3 1.4V6.5a2 2 0 0 1 2-2Z" />
          <path d="M9 9h6M9 12.5h6" />
        </IconFrame>
      );
    case "drive":
      return (
        <IconFrame>
          <path d="M5 15.5 6.4 10A3 3 0 0 1 9.3 8h5.4A3 3 0 0 1 17.6 10L19 15.5v2A1.5 1.5 0 0 1 17.5 19h-11A1.5 1.5 0 0 1 5 17.5v-2Z" />
          <circle cx="8.2" cy="16.5" r="1.15" />
          <circle cx="15.8" cy="16.5" r="1.15" />
          <path d="M8 11h8" />
        </IconFrame>
      );
    case "settings":
      return (
        <IconFrame>
          <circle cx="12" cy="12" r="3.1" />
          <path d="M12 4.4v2.1M12 17.5v2.1M4.4 12h2.1M17.5 12h2.1M6.4 6.4l1.5 1.5M16.1 16.1l1.5 1.5M17.6 6.4l-1.5 1.5M7.9 16.1l-1.5 1.5" />
        </IconFrame>
      );
    default:
      return assertNever(name);
  }
}

export function SkillGlyph({ skillId }: { skillId: SkillId }) {
  switch (skillId) {
    case "warning-signs":
      return (
        <svg viewBox="0 0 24 24" className="skill-glyph" aria-hidden="true">
          <path d="M12 4.2 20.4 19H3.6L12 4.2Z" />
          <path d="M12 10.2v4.2M12 16.6v.7" />
        </svg>
      );
    case "prohibitory-signs":
      return (
        <svg viewBox="0 0 24 24" className="skill-glyph" aria-hidden="true">
          <circle cx="12" cy="12" r="7.4" />
          <path d="M7.2 7.2 16.8 16.8" />
        </svg>
      );
    case "priority-signs":
      return (
        <svg viewBox="0 0 24 24" className="skill-glyph" aria-hidden="true">
          <path d="M12 3.6 20.4 12 12 20.4 3.6 12 12 3.6Z" />
        </svg>
      );
    case "uncontrolled":
      return (
        <svg viewBox="0 0 24 24" className="skill-glyph" aria-hidden="true">
          <path d="M12 3.5v17M3.5 12h17" />
          <circle cx="12" cy="12" r="2.1" />
        </svg>
      );
    case "lights":
      return (
        <svg viewBox="0 0 24 24" className="skill-glyph" aria-hidden="true">
          <rect x="8" y="3.4" width="8" height="17.2" rx="4" />
          <circle cx="12" cy="8" r="1.35" />
          <circle cx="12" cy="12" r="1.35" />
          <circle cx="12" cy="16" r="1.35" />
        </svg>
      );
    case "roundabout":
      return (
        <svg viewBox="0 0 24 24" className="skill-glyph" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 4.2v2.6M19.8 12h-2.6M12 19.8v-2.6M4.2 12h2.6" />
        </svg>
      );
    case "people":
      return (
        <svg viewBox="0 0 24 24" className="skill-glyph" aria-hidden="true">
          <circle cx="12" cy="6.4" r="2.2" />
          <path d="M8.2 20.2 10 12.2h4l1.8 8M9.2 14.6h5.6" />
        </svg>
      );
    case "special":
      return (
        <svg viewBox="0 0 24 24" className="skill-glyph" aria-hidden="true">
          <path d="M5 16.5h14l-1.4-6.2A2 2 0 0 0 15.7 9H8.3a2 2 0 0 0-1.9 1.3L5 16.5Z" />
          <circle cx="8.2" cy="16.8" r="1.2" />
          <circle cx="15.8" cy="16.8" r="1.2" />
          <path d="M12 4.4 13.1 7H16l-2.3 1.7.9 2.7L12 9.8 9.4 11.4l.9-2.7L8 7h2.9L12 4.4Z" />
        </svg>
      );
    case "highway":
      return (
        <svg viewBox="0 0 24 24" className="skill-glyph" aria-hidden="true">
          <path d="M6 19 9 5h6l3 14" />
          <path d="M12 7.5v2.2M12 12.2v2.2M12 16.8v1.4" />
        </svg>
      );
    default:
      return assertNever(skillId);
  }
}

export function LockGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="skill-glyph" aria-hidden="true">
      <rect x="6" y="11" width="12" height="9" rx="2.2" />
      <path d="M8.4 11V8.4a3.6 3.6 0 0 1 7.2 0V11" />
    </svg>
  );
}

export function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="skill-check-icon" aria-hidden="true">
      <path d="M6.2 12.4 10.1 16l7.7-8.4" />
    </svg>
  );
}
