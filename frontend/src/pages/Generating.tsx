/**
 * Generating page — shows real SSE stream progress during curriculum generation
 */

import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSSEStream } from '../hooks/useSSEStream';
import { useAppStore } from '../store/useAppStore';

export default function Generating() {
  const { generationId } = useParams<{ generationId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = useAppStore((state) => state.sessionId);

  // Get goal and cached from navigation state
  const goal = (location.state as any)?.goal || '';
  const cached = (location.state as any)?.cached || false;

  const { status, step, totalSteps, chunks, lessonId, isComplete, error, isConnected } =
    useSSEStream({
      generationId: generationId || null,
      goal,
      sessionId,
    });

  const steps = [
    'Planning your learning path...',
    'Searching for resources...',
    'Synthesizing curriculum content...',
    'Formatting and extracting notes...',
  ];

  // Redirect to curriculum when complete
  useEffect(() => {
    if (isComplete && lessonId) {
      setTimeout(() => {
        navigate(`/curriculum/${lessonId}`);
      }, 1200);
    }
  }, [isComplete, lessonId, navigate]);

  // If cached, redirect immediately
  useEffect(() => {
    if (cached && generationId) {
      setTimeout(() => {
        navigate(`/curriculum/${generationId}`);
      }, 800);
    }
  }, [cached, generationId, navigate]);

  if (cached) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Found Cached Curriculum!</h2>
          <p className="text-gray-600">Loading your previously generated curriculum...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Generation Failed</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>

          {/* Show partial content if available */}
          {chunks.length > 0 && (
            <div className="mt-6 text-left bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Partial content received:</h3>
              <div className="text-sm text-gray-700">
                {chunks.map((chunk, i) => (
                  <div key={i}>{chunk}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Creating Your Curriculum
          </h2>
          {goal && (
            <p className="text-sm text-gray-500 mb-2">For: {goal}</p>
          )}
          <p className="text-gray-600">{status || 'Connecting...'}</p>
        </div>

        <div className="space-y-3">
          {steps.map((stepText, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                idx < step
                  ? 'bg-green-50 text-green-700'
                  : idx === step
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-gray-50 text-gray-400'
              }`}
            >
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  idx < step
                    ? 'bg-green-500 text-white'
                    : idx === step
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-500'
                }`}
              >
                {idx < step ? '✓' : idx + 1}
              </div>
              <span className="text-sm font-medium">{stepText}</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Content chunks preview */}
        {chunks.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Preview:</h3>
            <div className="text-sm text-gray-700 space-y-1">
              {chunks.map((chunk, i) => (
                <div key={i}>{chunk}</div>
              ))}
            </div>
          </div>
        )}

        {isComplete && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-medium">Curriculum generated successfully!</p>
            <p className="text-sm text-gray-500 mt-1">Redirecting...</p>
          </div>
        )}
      </div>
    </div>
  );
}
