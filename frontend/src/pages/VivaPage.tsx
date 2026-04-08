/**
 * Viva Page — Start screen and exam flow for viva voce examinations
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import VivaExamRoom from '../components/viva/VivaExamRoom';
import type { LessonResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function VivaPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const sessionId = useAppStore((state) => state.sessionId);

  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Viva session
  const [vivaSessionId, setVivaSessionId] = useState<string | null>(null);
  const [firstQuestion, setFirstQuestion] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');

  // Fetch lesson data
  useEffect(() => {
    if (!lessonId) {
      navigate('/');
      return;
    }

    const fetchLesson = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.getCurriculum(lessonId);
        setLesson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lesson');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, navigate]);

  const handleStartExam = async () => {
    if (!lesson || !lessonId) return;

    setIsStarting(true);
    setError(null);

    const topic = lesson.content?.modules?.[0]?.title || lesson.goal_raw;
    setModuleTitle(topic);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/viva/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lessonId,
          module_topic: topic,
          session_id: sessionId,
        }),
      });

      if (!response.ok) throw new Error('Failed to start examination');
      const data = await response.json();

      setVivaSessionId(data.viva_session_id);
      setFirstQuestion(data.first_question);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start exam');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !vivaSessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(`/curriculum/${lessonId}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Curriculum
          </button>
        </div>
      </div>
    );
  }

  // Show exam room if session is active
  if (vivaSessionId && firstQuestion) {
    return (
      <VivaExamRoom
        vivaSessionId={vivaSessionId}
        moduleTitle={moduleTitle}
        firstQuestion={firstQuestion}
        lessonId={lessonId || ''}
      />
    );
  }

  // Start screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
            <span className="text-4xl">🎤</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Viva Voce Examination</h1>
          <p className="text-gray-600">
            Test your understanding through an AI-powered oral examination
          </p>
        </div>

        {lesson && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-1">Topic</h3>
            <p className="text-sm text-blue-700">{lesson.goal_raw}</p>
          </div>
        )}

        <div className="space-y-3 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm flex-shrink-0">🎯</div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">5 Questions</h4>
              <p className="text-xs text-gray-500">The examiner will ask 5 questions on the topic</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm flex-shrink-0">🎤</div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Voice or Text</h4>
              <p className="text-xs text-gray-500">Answer with your voice or type your response</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm flex-shrink-0">📹</div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Webcam Proctoring</h4>
              <p className="text-xs text-gray-500">Webcam will monitor for multiple faces, looking away, and devices</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-sm flex-shrink-0">✅</div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">60% to Pass</h4>
              <p className="text-xs text-gray-500">Score at least 60% across all questions</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleStartExam}
          disabled={isStarting}
          className="w-full px-6 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
        >
          {isStarting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Starting Exam...
            </>
          ) : (
            <>
              🎤 Start Examination
            </>
          )}
        </button>

        <div className="mt-4 text-center">
          <Link
            to={`/curriculum/${lessonId}`}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Curriculum
          </Link>
        </div>
      </div>
    </div>
  );
}
