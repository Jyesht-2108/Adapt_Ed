/**
 * Generation stream component - displays SSE progress
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSSEStream } from '../hooks/useSSEStream';
import ErrorBanner from './ErrorBanner';

interface GenerationStreamProps {
  generationId: string;
  goal: string;
  cached: boolean;
}

export default function GenerationStream({ generationId, goal, cached }: GenerationStreamProps) {
  const navigate = useNavigate();
  const { status, step, totalSteps, chunks, lessonId, isComplete, error, isConnected } = useSSEStream(generationId);
  const [showDisconnectWarning, setShowDisconnectWarning] = useState(false);

  // Show disconnect warning if connection drops mid-stream
  useEffect(() => {
    if (!isConnected && !isComplete && !error && chunks.length > 0) {
      setShowDisconnectWarning(true);
    }
  }, [isConnected, isComplete, error, chunks.length]);

  // Redirect to curriculum when complete
  useEffect(() => {
    if (isComplete && lessonId) {
      // Small delay for better UX
      setTimeout(() => {
        navigate(`/curriculum/${lessonId}`);
      }, 1000);
    }
  }, [isComplete, lessonId, navigate]);

  if (cached) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Found Cached Curriculum!</h2>
        <p className="text-gray-600">Loading your previously generated curriculum...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Generation Failed</h2>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Goal display */}
      <div className="mb-8 text-center">
        <p className="text-sm text-gray-500 mb-2">Generating curriculum for:</p>
        <h2 className="text-2xl font-bold text-gray-900">{goal}</h2>
      </div>

      {/* Disconnect warning */}
      {showDisconnectWarning && (
        <ErrorBanner
          type="warning"
          message="Connection interrupted. Partial content is shown below. You can continue or retry."
          onRetry={() => window.location.reload()}
          onDismiss={() => setShowDisconnectWarning(false)}
        />
      )}

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Status message */}
      {status && (
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center">
            {isConnected && (
              <div className="mr-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              </div>
            )}
            <p className="text-gray-700">{status}</p>
          </div>
        </div>
      )}

      {/* Content chunks preview */}
      {chunks.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Preview:</h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            {chunks.map((chunk, index) => (
              <div key={index} className="animate-fade-in">
                {chunk}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion state */}
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
  );
}
