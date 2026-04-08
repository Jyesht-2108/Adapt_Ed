/**
 * Loading skeleton components for AdaptEd
 * Shown while SSE is streaming curriculum data
 */

export function CurriculumCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  )
}

export function LessonItemSkeleton() {
  return (
    <div className="border-l-4 border-gray-200 pl-4 py-3 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
      <div className="h-3 bg-gray-100 rounded w-5/6"></div>
    </div>
  )
}

export function ModuleSkeleton() {
  return (
    <div className="mb-8 animate-pulse">
      <div className="h-7 bg-gray-300 rounded w-1/3 mb-4"></div>
      <div className="space-y-4">
        <LessonItemSkeleton />
        <LessonItemSkeleton />
        <LessonItemSkeleton />
      </div>
    </div>
  )
}

export function DashboardCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 bg-gray-200 rounded w-2/3"></div>
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-100 rounded w-1/4"></div>
        <div className="h-4 bg-gray-100 rounded w-1/3"></div>
      </div>
      <div className="h-2 bg-gray-200 rounded w-full"></div>
    </div>
  )
}

export function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="h-10 bg-gray-300 rounded w-1/2 mb-8 animate-pulse"></div>
        <ModuleSkeleton />
        <ModuleSkeleton />
      </div>
    </div>
  )
}
