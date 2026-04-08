import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function Generating() {
  const { generationId } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('Initializing...')
  const [step, setStep] = useState(0)
  const totalSteps = 4

  const steps = [
    'Planning your learning path...',
    'Searching for YouTube resources...',
    'Fetching documentation...',
    'Synthesizing curriculum...',
  ]

  useEffect(() => {
    // Simulate SSE stream for demo
    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setStatus(steps[currentStep])
        setStep(currentStep + 1)
        currentStep++
      } else {
        clearInterval(interval)
        // Navigate to curriculum page
        setTimeout(() => {
          navigate(`/curriculum/les_demo_${generationId}`)
        }, 1000)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [generationId, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Creating Your Curriculum
          </h2>
          <p className="text-gray-600">{status}</p>
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
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
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
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Step {step} of {totalSteps}
          </p>
        </div>
      </div>
    </div>
  )
}
