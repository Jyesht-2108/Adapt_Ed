/**
 * Lesson card component - displays individual lesson with citation links
 */

import { openWithDyslexicMode } from '../lib/extensionBridge';
import type { Lesson } from '../types';

interface LessonCardProps {
  lesson: Lesson;
  moduleIndex: number;
  lessonIndex: number;
  onView: (moduleIndex: number, lessonIndex: number) => void;
}

export default function LessonCard({ lesson, moduleIndex, lessonIndex, onView }: LessonCardProps) {
  const handleCitationClick = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    openWithDyslexicMode(url);
  };

  const handleView = () => {
    onView(moduleIndex, lessonIndex);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{lesson.title}</h3>
      
      <div className="prose prose-sm max-w-none text-gray-700 mb-4">
        {lesson.content.split('\n').map((paragraph, idx) => (
          paragraph.trim() && <p key={idx} className="mb-2">{paragraph}</p>
        ))}
      </div>

      {/* Sources */}
      {lesson.sources && lesson.sources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Sources:</p>
          <div className="space-y-1">
            {lesson.sources.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                onClick={(e) => handleCitationClick(source.url, e)}
                className="flex items-start text-sm text-blue-600 hover:text-blue-700 group"
              >
                <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="group-hover:underline">{source.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleView}
        className="mt-4 text-sm text-gray-500 hover:text-gray-700 font-medium"
      >
        Mark as viewed
      </button>
    </div>
  );
}
