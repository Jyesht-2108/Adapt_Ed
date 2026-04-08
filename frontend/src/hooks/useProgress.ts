/**
 * Progress Hook
 * 
 * Manages progress tracking for lessons.
 * Reads/writes to backend and mirrors to localStorage for offline support.
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import type { ProgressEntry, ProgressUpdateRequest } from '../types';

export function useProgress() {
  const sessionId = useAppStore((state) => state.sessionId);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch progress from backend
   */
  const fetchProgress = useCallback(async () => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getProgress(sessionId);
      setProgress(data);
      
      // Mirror to localStorage
      localStorage.setItem(`progress_${sessionId}`, JSON.stringify(data));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch progress';
      setError(message);
      
      // Fallback to localStorage
      const cached = localStorage.getItem(`progress_${sessionId}`);
      if (cached) {
        setProgress(JSON.parse(cached));
      }
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  /**
   * Update progress for a specific lesson
   */
  const updateProgress = useCallback(async (request: ProgressUpdateRequest) => {
    if (!sessionId) return;

    try {
      await apiClient.updateProgress(sessionId, request);
      
      // Refresh progress after update
      await fetchProgress();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update progress';
      console.error('Progress update failed:', message);
      
      // Update localStorage optimistically
      const cached = localStorage.getItem(`progress_${sessionId}`);
      if (cached) {
        const data: ProgressEntry[] = JSON.parse(cached);
        const updated = data.map((entry) => {
          if (entry.lesson_id === request.lesson_id) {
            return {
              ...entry,
              last_accessed: new Date().toISOString(),
            };
          }
          return entry;
        });
        localStorage.setItem(`progress_${sessionId}`, JSON.stringify(updated));
        setProgress(updated);
      }
    }
  }, [sessionId, fetchProgress]);

  /**
   * Mark a lesson as viewed
   */
  const markAsViewed = useCallback(async (
    lessonId: string,
    moduleIndex: number,
    lessonIndex: number
  ) => {
    await updateProgress({
      lesson_id: lessonId,
      module_index: moduleIndex,
      lesson_index: lessonIndex,
      viewed: true,
    });
  }, [updateProgress]);

  /**
   * Get progress for a specific lesson
   */
  const getProgressForLesson = useCallback((lessonId: string): ProgressEntry | null => {
    return progress.find((entry) => entry.lesson_id === lessonId) || null;
  }, [progress]);

  /**
   * Calculate overall completion percentage
   */
  const overallCompletion = useCallback((): number => {
    if (progress.length === 0) return 0;
    
    const total = progress.reduce((sum, entry) => sum + entry.completion_pct, 0);
    return Math.round(total / progress.length);
  }, [progress]);

  // Fetch progress on mount
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    isLoading,
    error,
    fetchProgress,
    updateProgress,
    markAsViewed,
    getProgressForLesson,
    overallCompletion,
  };
}
