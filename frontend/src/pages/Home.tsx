import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/api'
import { useAppStore } from '../store/useAppStore'

export default function Home() {
  const [goal, setGoal] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const sessionId = useAppStore((state) => state.sessionId)

  const exampleGoals = [
    'Build a REST API with FastAPI',
    'Understand the DSM-5 criteria for ADHD',
    'Learn how transformers work from scratch',
    'Master SQL joins and subqueries',
    'Understand React hooks in depth',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (goal.length < 10) {
      setError('Please enter at least 10 characters')
      return
    }

    if (goal.length > 300) {
      setError('Please keep your goal under 300 characters')
      return
    }

    setIsSubmitting(true)

    try {
      // Call API to generate curriculum
      const response = await apiClient.generateCurriculum({
        goal,
        session_id: sessionId,
      })

      // Navigate to generating page with generation ID
      navigate(`/generating/${response.generation_id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start generation'
      setError(message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">AdaptEd</h1>
          <p className="text-xl text-gray-600">
            Master any subject, at your own pace, in a format that works for your brain
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            <label htmlFor="goal" className="block text-lg font-semibold text-gray-700 mb-3">
              What do you want to learn?
            </label>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Enter your learning goal..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none resize-none"
              rows={3}
            />
            {error && <p className="text-error text-sm mt-2">{error}</p>}
            <p className="text-sm text-gray-500 mt-2">
              {goal.length}/300 characters
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 px-6 py-4 bg-primary text-white text-lg font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Starting generation...
                </span>
              ) : (
                'Generate My Curriculum'
              )}
            </button>
          </form>

          <div className="mt-8">
            <p className="text-sm text-gray-600 mb-3">Examples:</p>
            <div className="flex flex-wrap gap-2">
              {exampleGoals.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setGoal(example)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            View my progress
          </button>
        </div>
      </div>
    </div>
  )
}
