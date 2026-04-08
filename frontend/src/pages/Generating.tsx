/**
 * Generating page - SSE stream progress view
 */

import { useParams, useLocation, Navigate } from 'react-router-dom';
import GenerationStream from '../components/GenerationStream';

export default function Generating() {
  const { generationId } = useParams<{ generationId: string }>();
  const location = useLocation();
  const state = location.state as { cached?: boolean; goal?: string } | null;

  // Redirect to home if no generation ID
  if (!generationId) {
    return <Navigate to="/" replace />;
  }

  // Redirect to home if no goal in state
  if (!state?.goal) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="pt-8 pb-4 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">AdaptEd</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex items-center justify-center px-4 py-16">
        <GenerationStream
          generationId={generationId}
          goal={state.goal}
          cached={state.cached || false}
        />
      </main>
    </div>
  );
}
