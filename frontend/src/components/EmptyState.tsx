/**
 * Empty state components for AdaptEd
 * Shown when there's no data to display
 */

interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export function DashboardEmptyState({ onStartLearning }: { onStartLearning: () => void }) {
  return (
    <EmptyState
      icon={
        <svg
          className="w-24 h-24"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      }
      title="No curriculums yet"
      description="Start learning something new! Enter a topic you want to master and we'll create a personalized curriculum just for you."
      action={{
        label: "Start Learning",
        onClick: onStartLearning,
      }}
    />
  )
}

export function SandboxEmptyState() {
  return (
    <EmptyState
      icon={
        <svg
          className="w-24 h-24"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      }
      title="Start practicing"
      description="Write your code or answer in the editor. Click 'Get a hint' when you need guidance."
    />
  )
}

export function NotesEmptyState() {
  return (
    <div className="text-center py-8 text-gray-500">
      <p>No study notes available for this lesson.</p>
    </div>
  )
}
