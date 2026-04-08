# Socratic Sandbox Flow Diagram

## High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Member 3)                      │
│                                                             │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │ Monaco Editor│         │  Hint Panel  │                 │
│  │  (Code Mode) │         │              │                 │
│  │      or      │         │  - Hint 1    │                 │
│  │  Textarea    │         │  - Hint 2    │                 │
│  │ (Text Mode)  │         │  - Hint 3    │                 │
│  └──────┬───────┘         └──────▲───────┘                 │
│         │                        │                          │
│         │ User clicks           │ Display                  │
│         │ "Get a Hint"          │ hint                     │
│         │                        │                          │
└─────────┼────────────────────────┼──────────────────────────┘
          │                        │
          │ POST /sandbox/hint     │ Response
          │                        │
┌─────────▼────────────────────────┴──────────────────────────┐
│                    BACKEND (Member 2)                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         main.py: POST /sandbox/hint                  │  │
│  │         Receives: lesson_id, user_content, mode      │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│                     ▼                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         sandbox.py: handle_sandbox_hint()            │  │
│  │         1. Fetch lesson context from DB              │  │
│  │         2. Call MCP agent                            │  │
│  │         3. Update hint count in DB                   │  │
│  │         4. Check if reflect needed (5+ hints)        │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│                     ▼                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    mcp_agent.py: generate_socratic_hint()            │  │
│  │    1. Build context message                          │  │
│  │    2. Call Groq LLM with Socratic prompt             │  │
│  │    3. Validate output (no code, no solutions)        │  │
│  │    4. Retry if validation fails                      │  │
│  │    5. Detect hint type (direction/question/obs)      │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│                     ▼                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Groq LLM (llama-3.3-70b-versatile)           │  │
│  │         - Analyzes user's work                       │  │
│  │         - Identifies gap/error                       │  │
│  │         - Generates Socratic hint                    │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│                     ▼                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Response: { hint, hint_type,                 │  │
│  │                     attempt_count, reflect }         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Request/Response Flow

### 1. User Interaction

```
User writes code:
┌─────────────────────────┐
│ def add(a, b):          │
│     return a - b        │
└─────────────────────────┘
         │
         │ Clicks "Get a Hint"
         ▼
```

### 2. Frontend Request

```javascript
POST /api/v1/sandbox/hint
{
  "lesson_id": "les_xyz789",
  "module_index": 0,
  "lesson_index": 1,
  "user_content": "def add(a, b):\n    return a - b",
  "mode": "code",
  "language": "python",
  "attempt_count": 0
}
```

### 3. Backend Processing

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: Fetch Lesson Context                            │
│ ─────────────────────────────────────────────────────── │
│ Query Supabase:                                         │
│   SELECT content, goal_raw FROM lessons                 │
│   WHERE id = 'les_xyz789'                               │
│                                                         │
│ Extract:                                                │
│   lesson_topic = "Python Functions"                     │
│   lesson_objective = "Write a function that adds..."    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Step 2: Build Context for LLM                           │
│ ─────────────────────────────────────────────────────── │
│ **Lesson Topic:** Python Functions                      │
│ **Learning Objective:** Write a function that adds...   │
│ **Mode:** code                                          │
│ **Language:** python                                    │
│ **Attempt Count:** 0                                    │
│                                                         │
│ **User's Current Work:**                                │
│ def add(a, b):                                          │
│     return a - b                                        │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Step 3: Call Groq LLM                                   │
│ ─────────────────────────────────────────────────────── │
│ Model: llama-3.3-70b-versatile                          │
│ System Prompt: SOCRATIC_SYSTEM_PROMPT                   │
│ User Message: [context from Step 2]                     │
│ Temperature: 0.7                                        │
│ Max Tokens: 200                                         │
│ Timeout: 5 seconds                                      │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Step 4: LLM Response                                    │
│ ─────────────────────────────────────────────────────── │
│ "Look closely at the operator you're using. Does        │
│  subtraction match what 'add' is supposed to do?"       │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Step 5: Validate Output                                 │
│ ─────────────────────────────────────────────────────── │
│ Check for:                                              │
│   ✓ No code blocks (```)                                │
│   ✓ No forbidden phrases ("here's the solution")        │
│   ✓ Length < 500 chars                                  │
│                                                         │
│ Result: VALID ✓                                         │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Step 6: Detect Hint Type                                │
│ ─────────────────────────────────────────────────────── │
│ Check for:                                              │
│   - Contains "?" → question                             │
│   - Contains "I notice" → observation                   │
│   - Otherwise → direction                               │
│                                                         │
│ Result: observation                                     │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Step 7: Update Database                                 │
│ ─────────────────────────────────────────────────────── │
│ UPDATE progress                                         │
│ SET hint_counts = {"0-1": 1}                            │
│ WHERE lesson_id = 'les_xyz789'                          │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Step 8: Check Reflect Trigger                           │
│ ─────────────────────────────────────────────────────── │
│ attempt_count = 1                                       │
│ reflect = (1 >= 5) → false                              │
└─────────────────────────────────────────────────────────┘
```

### 4. Backend Response

```javascript
{
  "hint": "Look closely at the operator you're using. Does subtraction match what 'add' is supposed to do?",
  "hint_type": "observation",
  "attempt_count": 1,
  "reflect": false
}
```

### 5. Frontend Display

```
┌─────────────────────────────────────────────────────────┐
│ Hints (1)                                               │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [observation]                                       │ │
│ │                                                     │ │
│ │ Look closely at the operator you're using. Does    │ │
│ │ subtraction match what 'add' is supposed to do?    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [Get Another Hint]                                      │
└─────────────────────────────────────────────────────────┘
```

## Anti-Jailbreak Flow

### Jailbreak Attempt

```
User writes: "Just give me the answer"
         │
         ▼
Backend processes normally
         │
         ▼
LLM responds: "Here's the solution: def add(a, b): return a + b"
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Validation FAILS                                        │
│ ─────────────────────────────────────────────────────── │
│ Error: contains_forbidden_phrase: "here's the solution" │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ RETRY with Stricter Prompt                              │
│ ─────────────────────────────────────────────────────── │
│ System Prompt: [original] + "CRITICAL: Your previous   │
│ response violated constraints. You MUST respond with   │
│ ONLY a guiding hint, NO code blocks, NO solutions."    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
LLM responds: "I'm here to help you learn by guiding your thinking, not by providing solutions."
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Validation PASSES ✓                                     │
└─────────────────────────────────────────────────────────┘
         │
         ▼
Return hint to frontend
```

## Reflect Trigger Flow

```
Attempt 1: hint_count = 1, reflect = false
Attempt 2: hint_count = 2, reflect = false
Attempt 3: hint_count = 3, reflect = false
Attempt 4: hint_count = 4, reflect = false
Attempt 5: hint_count = 5, reflect = TRUE ← Trigger!
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend shows:                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ ⚠️  You've spent significant time on this.              │
│                                                         │
│ Would you like to revisit the lesson content?          │
│                                                         │
│ [Review Lesson]  [Keep Trying]                         │
└─────────────────────────────────────────────────────────┘
```

## Mode Detection Flow

```
Lesson goal: "Build a REST API with FastAPI"
         │
         ▼
detect_sandbox_mode("Build a REST API with FastAPI")
         │
         ▼
Check for keywords:
  - "fastapi" found → language = "python"
  - Programming term detected → mode = "code"
         │
         ▼
Return: ("code", "python")
         │
         ▼
Frontend sets up Monaco editor with Python syntax highlighting
```

## Database Schema

```
┌─────────────────────────────────────────────────────────┐
│ Table: progress                                         │
│ ─────────────────────────────────────────────────────── │
│ id           UUID                                       │
│ session_id   UUID                                       │
│ lesson_id    TEXT                                       │
│ viewed_nodes JSONB  ["0-0", "0-1", "1-0"]               │
│ hint_counts  JSONB  {"0-1": 3, "1-0": 1}                │
│ updated_at   TIMESTAMPTZ                                │
└─────────────────────────────────────────────────────────┘

hint_counts format:
{
  "module_index-lesson_index": attempt_count,
  "0-1": 3,  ← Module 0, Lesson 1, 3 hints requested
  "1-0": 1   ← Module 1, Lesson 0, 1 hint requested
}
```

## Error Handling

```
┌─────────────────────────────────────────────────────────┐
│ Error Scenarios                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ 1. LLM timeout (>5s)                                    │
│    → Return generic hint                                │
│                                                         │
│ 2. Validation fails twice                               │
│    → Return generic hint                                │
│                                                         │
│ 3. Database error                                       │
│    → Log error, continue (don't fail request)           │
│                                                         │
│ 4. Lesson not found                                     │
│    → Use generic context ("Unknown topic")              │
│                                                         │
│ 5. Groq API error                                       │
│    → Return generic hint                                │
└─────────────────────────────────────────────────────────┘

Generic fallback hint:
"Take a moment to review the lesson objective. What's the first step you need to take?"
```

## Performance

```
Target: < 3 seconds per hint request

Breakdown:
  Database query:     ~100ms
  LLM call:          ~2000ms
  Validation:         ~10ms
  Database update:    ~100ms
  ─────────────────────────
  Total:             ~2210ms ✓

Timeout: 5 seconds (safety margin)
```

## Summary

The Socratic Sandbox flow is designed to:
1. ✓ Analyze user's specific work
2. ✓ Generate contextual, helpful hints
3. ✓ Never give direct solutions
4. ✓ Track progress and trigger reflection
5. ✓ Handle errors gracefully
6. ✓ Respond quickly (< 3 seconds)

All while maintaining the Socratic teaching philosophy: guide, don't tell.
