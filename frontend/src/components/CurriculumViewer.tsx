/**
 * Curriculum viewer component - renders modules and lessons
 */

import { useState } from 'react';
import LessonCard from './LessonCard';
import type { CurriculumContent } from '../types';

interface CurriculumViewerProps {
  content: CurriculumContent;
  onLessonView: (moduleIndex: number, lessonIndex: number) => void;
}

export default function CurriculumViewer({ content, onLessonView }: CurriculumViewerProps) {
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Goal header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">{content.goal}</h1>
        <p className="text-blue-100">
          {content.modules.length} module{content.modules.length !== 1 ? 's' : ''} • {' '}
          {content.modules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons
        </p>
      </div>

      {/* Modules */}
      {content.modules.map((module, moduleIndex) => (
        <div key={moduleIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Module header */}
          <button
            onClick={() => toggleModule(moduleIndex)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-sm mr-3">
                {moduleIndex + 1}
              </span>
              <h2 className="text-xl font-semibold text-gray-900">{module.title}</h2>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedModules.has(moduleIndex) ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Module lessons */}
          {expandedModules.has(moduleIndex) && (
            <div className="px-6 pb-6 space-y-4">
              {module.lessons.map((lesson, lessonIndex) => (
                <LessonCard
                  key={lessonIndex}
                  lesson={lesson}
                  moduleIndex={moduleIndex}
                  lessonIndex={lessonIndex}
                  onView={onLessonView}
                />
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Key takeaways */}
      {content.key_takeaways && content.key_takeaways.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Takeaways</h3>
          <ul className="space-y-2">
            {content.key_takeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
