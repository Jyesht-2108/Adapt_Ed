/**
 * Text editor component — dark themed for text mode sandbox
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
        className="flex-1 w-full p-4 bg-secondary/30 border border-border/30 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-foreground placeholder:text-muted-foreground/40 text-[15px] leading-relaxed"
      />
      <div className="mt-2 flex justify-between items-center text-xs text-muted-foreground/60">
        <span>Text mode</span>
        <span className="tabular-nums">{content.length} characters</span>
      </div>
    </div>
  );
}
