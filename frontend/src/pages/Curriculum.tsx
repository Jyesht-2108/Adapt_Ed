import { useParams } from 'react-router-dom'
import { ModuleSkeleton } from '../components/LoadingSkeleton'

export default function Curriculum() {
  const { lessonId } = useParams()

  // TODO: Fetch curriculum data from API
  // For now, show skeleton
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">AdaptEd</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
              Cached
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Loading curriculum...
          </h2>
          <p className="text-gray-600">Lesson ID: {lessonId}</p>
        </div>

        <ModuleSkeleton />
        <ModuleSkeleton />
      </main>
    </div>
  )
}
