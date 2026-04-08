/**
 * Code editor component using Monaco
 * Dark themed for sandbox code mode
 */

import { useRef } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  language: string;
  onChange: (value: string) => void;
}

export default function CodeEditor({ language, onChange }: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleEditorChange = (value: string | undefined) => {
    onChange(value || '');
  };

  return (
    <div className="h-full">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        defaultValue={`# Start coding here...\n`}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          padding: { top: 16, bottom: 16 },
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          renderLineHighlight: 'gutter',
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
        }}
      />
    </div>
  );
}
