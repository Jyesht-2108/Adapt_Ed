/**
 * Hint panel component
 * Displays hints with type badges, history, and reflect prompt
 */

import { useNavigate } from 'react-router-dom';
import type { Hint, HintType } from '../types';

interface HintPanelProps {
  hints: Hint[];
  isLoading: boolean;
  onGetHint: () => void;
  lessonId: string;
}

const HINT_TYPE_CONFIG: Record<HintType, { label: string; color: string; icon: string }> = {
  direction: {
    label: 'Direction',
    color: 'bg-blue-100 text-blue-700',
    icon: '→',
  },
  question: {
    label: 'Question',
    color: 'bg-purple-100 text-purple-700',
    icon: '?',
  },
  observation: {
    label: 'Observation',
    color: 'bg-green-100 text-green-700',
    icon: '👁',
  },
};

export default function HintPanel({ hints, isLoading, onGetHint, lessonId }: HintPanelProps) {
  const navigate = useNavigate();
  const latestHint = hints[hints.length - 1];
  const showReflect = latestHint?.reflect;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Socratic Hints</h2>
        <p className="text-sm text-gray-600 mt-1">
          Get guidance without spoilers
        </p>
      </div>

      {/* Hints list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hints.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-gray-500 text-sm">No hints yet</p>
            <p className="text-gray-400 text-xs mt-1">Click "Get a Hint" to start</p>
          </div>
        ) : (
          hints.map((hint, index) => {
            const config = HINT_TYPE_CONFIG[hint.hint_type];
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                {/* Hint header */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
                    {config.icon} {config.label}
                  </span>
                  <span className="text-xs text-gray-500">Hint #{index + 1}</span>
                </div>
                {/* Hint content */}
                <p className="text-gray-700 text-sm leading-relaxed">{hint.hint}</p>
              </div>
            );
          })
        )}

        {/* Reflect prompt */}
        {showReflect && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                  Time to Reflect
                </h3>
                <p className="text-sm text-yellow-800 mb-3">
                  You've been working on this for a while. Would you like to revisit the lesson content?
                </p>
                <button
                  onClick={() => navigate(`/curriculum/${lessonId}`)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                >
                  Revisit Lesson
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Get hint button */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onGetHint}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Getting hint...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Get a Hint
            </>
          )}
        </button>
        {hints.length > 0 && (
          <p className="text-xs text-gray-500 text-center mt-2">
            {hints.length} hint{hints.length !== 1 ? 's' : ''} used
          </p>
        )}
      </div>
    </div>
  );
}
