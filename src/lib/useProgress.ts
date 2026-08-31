"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  bumpDrivingDays,
  defaultProgress,
  type ProgressState,
} from "@/lib/progress";
import type { QualityPreference } from "@/lib/quality";
import type { JurisdictionId } from "@/engine/types";
import type { AttentionMode } from "@/lib/progress";

interface ProgressStore extends ProgressState {
  setJurisdiction: (id: JurisdictionId) => void;
  setAttentionMode: (mode: AttentionMode) => void;
  setQualityOverride: (value: QualityPreference) => void;
  completeOnboarding: (id: JurisdictionId) => void;
  addXp: (amount: number) => void;
  completeLesson: (skillId: string, lessonId: string, signIds: string[]) => void;
  saveCard: (cardId: string, card: ProgressState["cards"][string]) => void;
  togglePauseDays: () => void;
  markPracticedToday: () => void;
}

export const useProgress = create<ProgressStore>()(
  persist(
    (set) => ({
      ...defaultProgress(),
      setJurisdiction: (id) => set({ jurisdictionId: id }),
      setAttentionMode: (mode) => set({ attentionMode: mode }),
      setQualityOverride: (value) => set({ qualityOverride: value }),
      completeOnboarding: (id) =>
        set({
          jurisdictionId: id,
          onboardingComplete: true,
        }),
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      completeLesson: (skillId, lessonId, signIds) =>
        set((state) => {
          const current = state.skills[skillId] ?? { completedLessonIds: [], crowns: 0 };
          const completedLessonIds = current.completedLessonIds.includes(lessonId)
            ? current.completedLessonIds
            : [...current.completedLessonIds, lessonId];
          return {
            skills: {
              ...state.skills,
              [skillId]: {
                completedLessonIds,
                crowns: Math.min(5, completedLessonIds.length),
              },
            },
            collectedSignIds: Array.from(new Set([...state.collectedSignIds, ...signIds])),
            drivingDays: bumpDrivingDays(state.drivingDays),
          };
        }),
      saveCard: (cardId, card) =>
        set((state) => ({ cards: { ...state.cards, [cardId]: card } })),
      togglePauseDays: () =>
        set((state) => ({
          drivingDays: { ...state.drivingDays, paused: !state.drivingDays.paused },
        })),
      markPracticedToday: () =>
        set((state) => ({ drivingDays: bumpDrivingDays(state.drivingDays) })),
    }),
    { name: "sygnal-progress" },
  ),
);
