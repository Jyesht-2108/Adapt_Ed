/**
 * Dashboard page - Progress dashboard
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import type { ProgressEntry } from '../types';

export default function Dashboard() {
  const sessionId = useAppStore((state) => state.sessionId);
  const [curriculums, setCurriculums] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiClient.getSessionProgress(sessionId);
        setCurriculums(data.curriculums);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load progress');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [sessionId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">
            AdaptEd
          </Link>
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            New Curriculum
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Learning Progress</h1>
          <p className="text-gray-600">Track your curriculums and continue where you left off</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading your progress...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600">{error}</p>
          </div>
        ) : curriculums.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No curriculums yet</h3>
            <p className="text-gray-600 mb-6">Start learning something new today!</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Your First Curriculum
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curriculums.map((curriculum) => (
              <Link
                key={curriculum.lesson_id}
                to={`/curriculum/${curriculum.lesson_id}`}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {curriculum.goal}
                    </h3>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(curriculum.completion_pct)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all"
                      style={{ width: `${curriculum.completion_pct}%` }}
                    />
                  </div>
                </div>

                {/* Last accessed */}
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Last accessed {formatDate(curriculum.last_accessed)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
