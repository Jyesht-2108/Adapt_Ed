/**
 * Sandbox page - Socratic practice environment
 * Phase 3 implementation
 */

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import CodeEditor from '../components/CodeEditor';
import TextEditor from '../components/TextEditor';
import HintPanel from '../components/HintPanel';
import type { LessonResponse, Hint, SandboxMode } from '../types';

// TEMPORARY: Hardcoded values until Member 2 implements mode detection
const TEMP_SANDBOX_MODE: SandboxMode = 'code';
const TEMP_SANDBOX_LANGUAGE = 'python';

export default function Sandbox() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  // const sessionId = useAppStore((state) => state.sessionId); // TODO: Use for progress tracking
  
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Editor state (using ref to avoid stale closures)
  const editorContentRef = useRef<string>('');
  const [hints, setHints] = useState<Hint[]>([]);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Fetch lesson data
  useEffect(() => {
    if (!lessonId) {
      navigate('/');
      return;
    }

    const fetchLesson = async () => {
      try {
        setIsLoading(true);
        setError(null);
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

  const handleGetHint = async () => {
    if (!lessonId || isGettingHint) return;

    setIsGettingHint(true);
    try {
      const hint = await apiClient.getSandboxHint({
        lesson_id: lessonId,
        module_index: 0, // TODO: Get from lesson context
        lesson_index: 0,
        user_content: editorContentRef.current,
        mode: lesson?.sandbox_mode || TEMP_SANDBOX_MODE,
        language: lesson?.sandbox_language || TEMP_SANDBOX_LANGUAGE,
        attempt_count: attemptCount,
      });

      setHints((prev) => [...prev, hint]);
      setAttemptCount(hint.attempt_count);
    } catch (err) {
      console.error('Failed to get hint:', err);
      // Add error hint to show user
      setHints((prev) => [
        ...prev,
        {
          hint: 'Failed to get hint. Please try again.',
          hint_type: 'direction',
          attempt_count: attemptCount,
          reflect: false,
        },
      ]);
    } finally {
      setIsGettingHint(false);
    }
  };

  const handleEditorChange = (value: string) => {
    editorContentRef.current = value;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading sandbox...</p>
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
          <p className="text-red-600 mb-4">{error || 'Lesson not found'}</p>
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

  const mode = lesson.sandbox_mode || TEMP_SANDBOX_MODE;
  const language = lesson.sandbox_language || TEMP_SANDBOX_LANGUAGE;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold text-gray-900">
              AdaptEd
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              to={`/curriculum/${lessonId}`}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← Back to Curriculum
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Mode: <span className="font-medium">{mode}</span>
            </span>
            {mode === 'code' && (
              <>
                <span className="text-gray-400">|</span>
                <span className="text-sm text-gray-600">
                  Language: <span className="font-medium">{language}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content - Two panel layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left panel - Editor */}
        <div className="flex-1 flex flex-col border-r border-gray-200 bg-white">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Practice Area</h2>
            <p className="text-sm text-gray-600 mt-1">{lesson.goal_raw}</p>
          </div>
          <div className="flex-1 overflow-hidden">
            {mode === 'code' ? (
              <CodeEditor
                language={language}
                onChange={handleEditorChange}
              />
            ) : (
              <TextEditor
                onChange={handleEditorChange}
              />
            )}
          </div>
        </div>

        {/* Right panel - Hints */}
        <div className="w-96 flex flex-col bg-white">
          <HintPanel
            hints={hints}
            isLoading={isGettingHint}
            onGetHint={handleGetHint}
            lessonId={lessonId || ''}
          />
        </div>
      </main>
    </div>
  );
}
