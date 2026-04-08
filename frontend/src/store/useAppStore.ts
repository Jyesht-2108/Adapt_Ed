/**
 * Zustand store for AdaptEd
 * 
 * CRITICAL: Only stores curriculum metadata and session info.
 * NEVER store editor content here - use component refs to avoid stale closures.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProgressEntry } from '../types';

interface AppState {
  // Session
  sessionId: string;
  
  // Curriculums
  curriculums: ProgressEntry[];
  activeLessonId: string | null;
  
  // Actions
  setSessionId: (id: string) => void;
  setCurriculums: (curriculums: ProgressEntry[]) => void;
  setActiveLessonId: (id: string | null) => void;
  addCurriculum: (curriculum: ProgressEntry) => void;
  updateCurriculum: (lessonId: string, updates: Partial<ProgressEntry>) => void;
}

// Generate UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      sessionId: generateUUID(),
      curriculums: [],
      activeLessonId: null,
      
      // Actions
      setSessionId: (id) => set({ sessionId: id }),
      
      setCurriculums: (curriculums) => set({ curriculums }),
      
      setActiveLessonId: (id) => set({ activeLessonId: id }),
      
      addCurriculum: (curriculum) => set((state) => ({
        curriculums: [curriculum, ...state.curriculums]
      })),
      
      updateCurriculum: (lessonId, updates) => set((state) => ({
        curriculums: state.curriculums.map((c) =>
          c.lesson_id === lessonId ? { ...c, ...updates } : c
        )
      })),
    }),
    {
      name: 'adapted-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        curriculums: state.curriculums,
        activeLessonId: state.activeLessonId,
      }),
    }
  )
);
