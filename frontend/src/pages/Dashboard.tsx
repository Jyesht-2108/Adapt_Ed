import { useNavigate } from 'react-router-dom'
import { DashboardEmptyState } from '../components/EmptyState'
import { DashboardCardSkeleton } from '../components/LoadingSkeleton'

export default function Dashboard() {
  const navigate = useNavigate()
  const [curriculums] = useState([]) // TODO: Load from API

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">My Learning Dashboard</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            New Curriculum
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {curriculums.length === 0 ? (
          <DashboardEmptyState onStartLearning={() => navigate('/')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
            <DashboardCardSkeleton />
          </div>
        )}
      </main>
    </div>
  )
}

function useState(arg0: never[]): [any] {
  throw new Error('Function not implemented.')
}
