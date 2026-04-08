import { useParams } from 'react-router-dom'
import { SandboxEmptyState } from '../components/EmptyState'

export default function Sandbox() {
  const { lessonId } = useParams()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Socratic Sandbox</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Practice Area
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <SandboxEmptyState />
            </div>
          </div>

          {/* Hint Panel */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Hints & Guidance
            </h2>
            <div className="text-center py-12 text-gray-500">
              <p>Click "Get a hint" to receive guidance</p>
            </div>
            <button className="w-full mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              Get a Hint
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Lesson ID: {lessonId}
        </p>
      </main>
    </div>
  )
}
