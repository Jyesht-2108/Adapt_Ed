/**
 * Curriculum page - Full curriculum view
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import CurriculumViewer from '../components/CurriculumViewer';
import NotesPanel from '../components/NotesPanel';
import type { LessonResponse } from '../types';

export default function Curriculum() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const sessionId = useAppStore((state) => state.sessionId);
  const setActiveLessonId = useAppStore((state) => state.setActiveLessonId);
  
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonId) {
      navigate('/');
      return;
    }

    const fetchCurriculum = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch curriculum
        const curriculumData = await apiClient.getCurriculum(lessonId);
        setLesson(curriculumData);
        setActiveLessonId(lessonId);

        // Fetch notes
        try {
          const notesData = await apiClient.getLessonNotes(lessonId);
          setNotes(notesData.markdown);
        } catch (err) {
          console.error('Failed to fetch notes:', err);
          // Notes are optional, don't fail the whole page
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load curriculum');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurriculum();
  }, [lessonId, navigate, setActiveLessonId]);

  const handleLessonView = async (moduleIndex: number, lessonIndex: number) => {
    if (!lessonId) return;

    try {
      await apiClient.updateProgress(sessionId, {
        lesson_id: lessonId,
        module_index: moduleIndex,
        lesson_index: lessonIndex,
        viewed: true,
      });
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading curriculum...</p>
        </div>
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">
            AdaptEd
          </Link>
          <div className="flex items-center gap-4">
            {lesson.sandbox_mode && (
              <Link
                to={`/sandbox/${lessonId}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Practice in Sandbox
              </Link>
            )}
            <Link
              to="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <CurriculumViewer
            content={lesson.content}
            onLessonView={handleLessonView}
          />
          
          <NotesPanel
            markdown={notes}
            goal={lesson.goal_raw}
          />
        </div>
      </main>
    </div>
  );
}
