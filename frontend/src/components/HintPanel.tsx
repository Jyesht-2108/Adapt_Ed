/**
 * Hint Panel Component
 * 
 * Displays hints from the Socratic sandbox with type badges.
 * Shows hint history and reflect prompt when needed.
 */

import { useState } from 'react';
import type { Hint, HintType } from '../types';

interface HintPanelProps {
  hints: Hint[];
  isLoading: boolean;
  onGetHint: () => void;
  onReflect?: () => void;
}

export function HintPanel({ hints, isLoading, onGetHint, onReflect }: HintPanelProps) {
  const [showReflectPrompt, setShowReflectPrompt] = useState(false);
  
  // Check if we should show reflect prompt
  const latestHint = hints[hints.length - 1];
  const shouldShowReflect = latestHint?.reflect && !showReflectPrompt;

  if (shouldShowReflect) {
    setShowReflectPrompt(true);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Hints & Guidance</h2>
        <p className="text-sm text-gray-600 mt-1">
          Get Socratic hints to guide your learning
        </p>
      </div>

      {/* Reflect Prompt */}
      {showReflectPrompt && (
        <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-2xl">🤔</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-2">
                Time to Reflect
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                You've been working on this for a while. Would you like to revisit the lesson material?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowReflectPrompt(false);
                    onReflect?.();
                  }}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                >
                  Review Lesson
                </button>
                <button
                  onClick={() => setShowReflectPrompt(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                >
                  Keep Trying
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hint History */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {hints.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">💡</div>
            <p className="text-sm">No hints yet</p>
            <p className="text-xs mt-1">Click "Get a Hint" to receive guidance</p>
          </div>
        ) : (
          hints.map((hint, index) => (
            <HintCard key={index} hint={hint} index={index} />
          ))
        )}
      </div>

      {/* Get Hint Button */}
      <button
        onClick={onGetHint}
        disabled={isLoading}
        className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Getting hint...
          </span>
        ) : (
          'Get a Hint'
        )}
      </button>

      {/* Attempt Counter */}
      {hints.length > 0 && (
        <p className="text-xs text-gray-500 text-center mt-2">
          {hints.length} hint{hints.length !== 1 ? 's' : ''} used
        </p>
      )}
    </div>
  );
}

/**
 * Individual Hint Card
 */

interface HintCardProps {
  hint: Hint;
  index: number;
}

function HintCard({ hint, index }: HintCardProps) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500">
          Hint #{index + 1}
        </span>
        <HintTypeBadge type={hint.hint_type} />
      </div>
      <p className="text-sm text-gray-800 leading-relaxed">{hint.hint}</p>
    </div>
  );
}

/**
 * Hint Type Badge
 */

interface HintTypeBadgeProps {
  type: HintType;
}

function HintTypeBadge({ type }: HintTypeBadgeProps) {
  const styles = {
    direction: 'bg-blue-100 text-blue-800',
    question: 'bg-purple-100 text-purple-800',
    observation: 'bg-green-100 text-green-800',
  };

  const icons = {
    direction: '→',
    question: '?',
    observation: '👁',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type]}`}>
      {icons[type]} {type}
    </span>
  );
}
