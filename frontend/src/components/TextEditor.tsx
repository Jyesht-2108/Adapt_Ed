/**
 * Text editor component
 * For text mode in sandbox (conceptual/clinical topics)
 */

import { useState } from 'react';

interface TextEditorProps {
  onChange: (value: string) => void;
}

export default function TextEditor({ onChange }: TextEditorProps) {
  const [content, setContent] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    onChange(value);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Start writing your answer here..."
        className="flex-1 w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-sans text-base leading-relaxed"
      />
      <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
        <span>Text mode</span>
        <span>{content.length} characters</span>
      </div>
    </div>
  );
}
