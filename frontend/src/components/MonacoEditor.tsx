/**
 * Monaco Editor Component
 * 
 * Wraps @monaco-editor/react for code editing in Sandbox mode.
 * Supports multiple languages and themes.
 */

import { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  height?: string;
  theme?: 'vs-dark' | 'light';
}

export function MonacoEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = '500px',
  theme = 'vs-dark',
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    
    // Focus editor on mount
    editor.focus();
  };

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  useEffect(() => {
    // Update editor options when readOnly changes
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly });
    }
  }, [readOnly]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme={theme}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          readOnly,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
        }}
      />
    </div>
  );
}

/**
 * Text Editor Component (for non-code sandbox mode)
 * Simple textarea for text-based exercises
 */

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export function TextEditor({
  value,
  onChange,
  readOnly = false,
  placeholder = 'Type your answer here...',
}: TextEditorProps) {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        className="w-full h-[500px] p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-300">
        <p className="text-sm text-gray-600">
          {value.length} characters
        </p>
      </div>
    </div>
  );
}
