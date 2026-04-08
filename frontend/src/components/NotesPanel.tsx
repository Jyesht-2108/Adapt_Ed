/**
 * Notes panel component - collapsible with markdown download
 */

import { useState } from 'react';

interface NotesPanelProps {
  markdown: string;
  goal: string;
}

export default function NotesPanel({ markdown, goal }: NotesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${goal.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!markdown || markdown.trim() === '') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Study Notes</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Download .md
          </button>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono bg-gray-50 p-4 rounded">
              {markdown}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
