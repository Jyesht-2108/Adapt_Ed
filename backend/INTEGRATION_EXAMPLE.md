# Integration Example for Member 3 (Frontend)

## How to Use the Sandbox Endpoint

### 1. Get Lesson Info with Sandbox Mode

When loading a lesson, the API now returns sandbox configuration:

```typescript
// GET /api/v1/curriculum/{lesson_id}
const response = await fetch(`/api/v1/curriculum/${lessonId}`);
const lesson = await response.json();

console.log(lesson.sandbox_mode);      // "code" or "text"
console.log(lesson.sandbox_language);  // "python", "javascript", etc. or null
```

### 2. Set Up the Editor

Based on `sandbox_mode`:

```typescript
if (lesson.sandbox_mode === "code") {
  // Use Monaco editor
  // Set language to lesson.sandbox_language
  <MonacoEditor 
    language={lesson.sandbox_language}
    value={userCode}
    onChange={setUserCode}
  />
} else {
  // Use plain textarea
  <textarea 
    value={userText}
    onChange={(e) => setUserText(e.target.value)}
  />
}
```

### 3. Request a Hint

When user clicks "Get a hint":

```typescript
const requestHint = async () => {
  const response = await fetch('/api/v1/sandbox/hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lesson_id: lessonId,
      module_index: 0,
      lesson_index: 1,
      user_content: userCode,  // or userText
      mode: lesson.sandbox_mode,
      language: lesson.sandbox_language,
      attempt_count: hintCount
    })
  });
  
  const hint = await response.json();
  
  // Update UI
  setHintCount(hint.attempt_count);
  setHints([...hints, {
    text: hint.hint,
    type: hint.hint_type
  }]);
  
  // Show reflect prompt if needed
  if (hint.reflect) {
    setShowReflectPrompt(true);
  }
};
```

### 4. Display Hints

Show hints with type badges:

```typescript
{hints.map((hint, i) => (
  <div key={i} className="hint-card">
    <span className={`badge badge-${hint.type}`}>
      {hint.type}
    </span>
    <p>{hint.text}</p>
  </div>
))}
```

### 5. Handle Reflect Prompt

After 5 hints:

```typescript
{showReflectPrompt && (
  <div className="reflect-prompt">
    <p>You've been working on this for a while. Would you like to revisit the lesson?</p>
    <button onClick={() => navigate(`/curriculum/${lessonId}`)}>
      Review Lesson
    </button>
    <button onClick={() => setShowReflectPrompt(false)}>
      Keep Trying
    </button>
  </div>
)}
```

## Example Component Structure

```typescript
// SandboxPage.tsx
import { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';

export function SandboxPage({ lessonId, moduleIndex, lessonIndex }) {
  const [lesson, setLesson] = useState(null);
  const [userContent, setUserContent] = useState('');
  const [hints, setHints] = useState([]);
  const [hintCount, setHintCount] = useState(0);
  const [showReflect, setShowReflect] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load lesson
    fetch(`/api/v1/curriculum/${lessonId}`)
      .then(res => res.json())
      .then(setLesson);
  }, [lessonId]);

  const getHint = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/sandbox/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: lessonId,
          module_index: moduleIndex,
          lesson_index: lessonIndex,
          user_content: userContent,
          mode: lesson.sandbox_mode,
          language: lesson.sandbox_language,
          attempt_count: hintCount
        })
      });
      
      const hint = await response.json();
      
      setHints([...hints, hint]);
      setHintCount(hint.attempt_count);
      setShowReflect(hint.reflect);
    } catch (error) {
      console.error('Error getting hint:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!lesson) return <div>Loading...</div>;

  return (
    <div className="sandbox-container">
      <div className="editor-panel">
        {lesson.sandbox_mode === 'code' ? (
          <MonacoEditor
            language={lesson.sandbox_language}
            value={userContent}
            onChange={setUserContent}
            theme="vs-dark"
          />
        ) : (
          <textarea
            value={userContent}
            onChange={(e) => setUserContent(e.target.value)}
            placeholder="Write your answer here..."
          />
        )}
        
        <button 
          onClick={getHint} 
          disabled={loading || !userContent}
        >
          {loading ? 'Thinking...' : 'Get a Hint'}
        </button>
      </div>

      <div className="hint-panel">
        <h3>Hints ({hintCount})</h3>
        
        {hints.map((hint, i) => (
          <div key={i} className={`hint hint-${hint.hint_type}`}>
            <span className="hint-badge">{hint.hint_type}</span>
            <p>{hint.hint}</p>
          </div>
        ))}
        
        {showReflect && (
          <div className="reflect-prompt">
            <p>You've spent significant time on this. Would you like to revisit the lesson content?</p>
            <button onClick={() => window.location.href = `/curriculum/${lessonId}`}>
              Review Lesson
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Styling Suggestions

```css
.hint {
  padding: 1rem;
  margin: 0.5rem 0;
  border-radius: 8px;
  border-left: 4px solid;
}

.hint-direction {
  border-color: #3b82f6;
  background: #eff6ff;
}

.hint-question {
  border-color: #8b5cf6;
  background: #f5f3ff;
}

.hint-observation {
  border-color: #10b981;
  background: #ecfdf5;
}

.hint-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.reflect-prompt {
  padding: 1.5rem;
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 8px;
  margin-top: 1rem;
}
```

## Testing the Integration

1. Start the backend:
```bash
cd backend
uvicorn main:app --reload
```

2. Test with curl:
```bash
# Get lesson with sandbox mode
curl http://localhost:8000/api/v1/curriculum/les_test123

# Request a hint
curl -X POST http://localhost:8000/api/v1/sandbox/hint \
  -H "Content-Type: application/json" \
  -d '{
    "lesson_id": "les_test123",
    "module_index": 0,
    "lesson_index": 0,
    "user_content": "def add(a, b):\n    return a - b",
    "mode": "code",
    "language": "python",
    "attempt_count": 0
  }'
```

3. Expected response:
```json
{
  "hint": "Look at the operator you're using. Does it match the function name?",
  "hint_type": "observation",
  "attempt_count": 1,
  "reflect": false
}
```

## Error Handling

```typescript
try {
  const response = await fetch('/api/v1/sandbox/hint', { ... });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const hint = await response.json();
  // ... use hint
} catch (error) {
  // Show error to user
  setError('Failed to get hint. Please try again.');
}
```

## State Management

Store in component state (NOT Zustand):

```typescript
// ✓ CORRECT - Component state
const [userContent, setUserContent] = useState('');
const [hints, setHints] = useState([]);

// ✗ WRONG - Don't put in Zustand
// This causes stale closure bugs with live updates
```

## Questions?

Contact Member 2 for any integration issues.
