/**
 * Curriculum page — fetches and displays a fully generated curriculum
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import CurriculumViewer from '../components/CurriculumViewer';
import NotesPanel from '../components/NotesPanel';
import { ModuleSkeleton } from '../components/LoadingSkeleton';
import type { LessonResponse } from '../types';

export default function Curriculum() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const sessionId = useAppStore((state) => state.sessionId);

  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch curriculum data
  useEffect(() => {
    if (!lessonId) {
      navigate('/');
      return;
    }

    const fetchCurriculum = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await apiClient.getCurriculum(lessonId);
        setLesson(data);

        // Fetch notes separately
        try {
          const notesData = await apiClient.getLessonNotes(lessonId);
          setNotes(notesData.markdown || '');
        } catch {
          // Notes are optional, don't fail if they're missing
          console.warn('Could not fetch notes');
        }

        // Track progress
        try {
          await apiClient.updateProgress(sessionId, {
            lesson_id: lessonId,
            module_index: 0,
            lesson_index: 0,
            viewed: true,
          });
        } catch {
          console.warn('Could not update progress');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load curriculum');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurriculum();
  }, [lessonId, navigate, sessionId]);

  const handleLessonView = async (moduleIndex: number, lessonIndex: number) => {
    if (!lessonId) return;
    try {
      await apiClient.updateProgress(sessionId, {
        lesson_id: lessonId,
        module_index: moduleIndex,
        lesson_index: lessonIndex,
        viewed: true,
      });
    } catch {
      console.warn('Could not update progress');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-gray-800">AdaptEd</Link>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 mb-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <ModuleSkeleton />
          <ModuleSkeleton />
        </main>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load</h2>
          <p className="text-red-600 mb-4">{error || 'Curriculum not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gray-800">AdaptEd</Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/sandbox/${lessonId}`)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Practice in Sandbox
            </button>
            <button
              onClick={() => navigate(`/viva/${lessonId}`)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              Take Viva Exam
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Curriculum content */}
        <CurriculumViewer
          content={lesson.content}
          onLessonView={handleLessonView}
        />

        {/* Study Notes */}
        {notes && (
          <NotesPanel
            markdown={notes}
            goal={lesson.goal_raw}
          />
        )}
      </main>
    </div>
  );
}
