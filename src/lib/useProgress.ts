"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  bumpDrivingDays,
  defaultProgress,
  hydratePersistedProgress,
  skillProgressKey,
  type AttentionMode,
  type ProgressState,
} from "@/lib/progress";
import type { QualityPreference } from "@/lib/quality";
import type { JurisdictionId } from "@/engine/types";

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
          const key = skillProgressKey(state.jurisdictionId, skillId);
          const current = state.skills[key] ?? { completedLessonIds: [], crowns: 0 };
          const completedLessonIds = current.completedLessonIds.includes(lessonId)
            ? current.completedLessonIds
            : [...current.completedLessonIds, lessonId];
          return {
            skills: {
              ...state.skills,
              [key]: {
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
    {
      name: "sygnal-progress",
      version: 2,
      migrate: (persisted) => hydratePersistedProgress(persisted as ProgressState),
    },
  ),
);
