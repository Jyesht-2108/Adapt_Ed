/**
 * Goal input component with validation and example chips
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { apiClient } from '../lib/api';

const EXAMPLE_GOALS = [
  'Build a REST API with FastAPI',
  'Understand the DSM-5 criteria for ADHD',
  'Learn how transformers work from scratch',
  'Master SQL joins and subqueries',
  'Understand React hooks in depth',
];

const MIN_LENGTH = 10;
const MAX_LENGTH = 300;

export default function GoalInput() {
  const [goal, setGoal] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const sessionId = useAppStore((state) => state.sessionId);

  const validateGoal = (value: string): string | null => {
    if (value.length < MIN_LENGTH) {
      return `Goal must be at least ${MIN_LENGTH} characters`;
    }
    if (value.length > MAX_LENGTH) {
      return `Goal must be less than ${MAX_LENGTH} characters`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateGoal(goal);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await apiClient.generateCurriculum({
        goal: goal.trim(),
        session_id: sessionId,
      });

      // Navigate to generation stream page
      navigate(`/generating/${response.generation_id}`, {
        state: { cached: response.cached, goal: goal.trim() }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start generation');
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setGoal(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
            What do you want to learn?
          </label>
          <textarea
            id="goal"
            value={goal}
            onChange={handleChange}
            placeholder="Enter your learning goal..."
            className={`w-full px-4 py-3 border rounded-lg resize-none focus:outline-none focus:ring-2 transition-colors ${
              error
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            rows={4}
            disabled={isLoading}
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-sm ${goal.length > MAX_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
              {goal.length} / {MAX_LENGTH}
            </span>
            {error && (
              <span className="text-sm text-red-500">{error}</span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || goal.length < MIN_LENGTH}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Starting...' : 'Generate Curriculum'}
        </button>
      </form>

      {/* Example chips */}
      <div className="mt-8">
        <p className="text-sm text-gray-600 mb-3">Examples:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_GOALS.map((example, index) => (
            <button
              key={index}
              onClick={() => setGoal(example)}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
