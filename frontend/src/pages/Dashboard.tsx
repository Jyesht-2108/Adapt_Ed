/**
 * Dashboard page — shows all generated curriculums and progress
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardEmptyState } from '../components/EmptyState';
import { DashboardCardSkeleton } from '../components/LoadingSkeleton';
import { apiClient } from '../lib/api';
import { useAppStore } from '../store/useAppStore';
import type { ProgressEntry } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const sessionId = useAppStore((state) => state.sessionId);
  const [curriculums, setCurriculums] = useState<ProgressEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.getSessionProgress(sessionId);
        setCurriculums(data.curriculums || []);
      } catch (err) {
        console.error('Failed to fetch progress:', err);
        setError(err instanceof Error ? err.message : 'Failed to load progress');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-aurora">
      {/* Header */}
      <header className="glass-strong border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <BookOpen className="w-5 h-5" />
              <span className="font-semibold">AdaptEd</span>
            </Link>
            <span className="text-border">|</span>
            <h1 className="text-sm font-semibold text-foreground">Dashboard</h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Curriculum
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Learning
            </button>
          </div>
        ) : curriculums.length === 0 ? (
          <DashboardEmptyState onStartLearning={() => navigate('/')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {curriculums.map((curriculum) => (
              <div
                key={curriculum.lesson_id}
                onClick={() => navigate(`/curriculum/${curriculum.lesson_id}`)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2">
                  {curriculum.goal}
                </h3>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(curriculum.completion_pct)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(curriculum.completion_pct, 100)}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Last accessed: {new Date(curriculum.last_accessed).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
