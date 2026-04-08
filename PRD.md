# AdaptEd — Product Requirements Document

**Version:** 1.1  
**Status:** In Progress  
**Last Updated:** 2026-04-08  

---

## Table of Contents

1. [Vision & Problem Statement](#1-vision--problem-statement)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Personas](#3-user-personas)
4. [System Architecture](#4-system-architecture)
5. [Tech Stack (Finalized)](#5-tech-stack-finalized)
6. [Feature Specifications](#6-feature-specifications)
7. [API Design](#7-api-design)
8. [Database Schema](#8-database-schema)
9. [Frontend Structure](#9-frontend-structure)
10. [Chrome Extension Spec](#10-chrome-extension-spec)
11. [Known Risks & Mitigations](#11-known-risks--mitigations)
12. [Out of Scope (v1)](#12-out-of-scope-v1)
13. [Build Order & Milestones](#13-build-order--milestones)

---

## 1. Vision & Problem Statement

### The Problem

Education on the internet is broken in two specific ways:

1. **Static content** — Every learner, regardless of prior knowledge or goal, gets the same pre-built course. A software engineer learning medical diagnostics and a med student learning programming get the same generic slides.
2. **Inaccessible presentation** — The web's default typography is hostile to neurodivergent learners (dyslexia, ADHD). When a learner leaves a learning platform to read a source article, they lose all accommodations.

### The Solution

AdaptEd is an AI-driven platform that:
- Generates a **fully personalized, goal-anchored curriculum** for any topic a user specifies, sourced from real-time web content.
- Provides a **Socratic practice environment** (the Sandbox) that tutors without spoon-feeding, forcing active problem-solving.
- Extends **dyslexia-friendly rendering globally** via a Chrome extension that rewrites third-party websites the user visits from within the platform.

### North Star

> Anyone should be able to master any subject, at their own pace, in a format that works for their brain.

---

## 2. Goals & Success Metrics

### Hackathon Demo Goals

| Goal | Signal |
|---|---|
| Curriculum generates end-to-end without errors | A live demo run on an unseen topic completes successfully |
| Socratic sandbox refuses to give direct answers | Judge attempts to get a solution directly and fails |
| Chrome extension activates correctly on citation click | Navigating to Wikipedia from a citation applies OpenDyslexic |
| Lesson caching works | A repeated topic loads in under 500ms |

### Quality Bars

- Curriculum generation (cold): under 20 seconds
- Curriculum generation (cached): under 500ms
- Retrieval must pull from at least 2 distinct sources per lesson
- MCP agent response latency: under 3 seconds
- Extension DOM rewrite: under 200ms after page load

---

## 3. User Personas

### Primary: The Self-Directed Learner
- Learns outside of formal education (bootcamps, career switchers, curious professionals)
- Has a specific, narrow goal ("I need to understand transformer attention for a job interview")
- Frustrated by having to stitch together YouTube videos, docs, and articles manually

### Secondary: The Neurodivergent Learner
- Has dyslexia or ADHD; standard web typography (justified text, serif fonts, tight line height) is painful
- Currently forced to use browser extensions that are generic and not learning-aware
- Wants accommodations to follow them when they leave the platform to read sources

### Tertiary: The Hackathon Judge (Meta-Persona)
- Needs to see a live, unscripted demo work
- Will try to break the Socratic sandbox by asking for direct answers
- Is impressed by empathy-driven design (accessibility story)

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                                                                 │
│   ┌─────────────────────────┐   ┌──────────────────────────┐   │
│   │   React Frontend (SPA)  │   │   Chrome Extension       │   │
│   │   - Goal intake form    │   │   - Activates on cite     │   │
│   │   - Curriculum viewer   │   │     navigation           │   │
│   │   - Socratic sandbox    │   │   - DOM rewrite          │   │
│   │   - Progress dashboard  │   │   - OpenDyslexic inject  │   │
│   └──────────┬──────────────┘   └──────────────────────────┘   │
└──────────────┼──────────────────────────────────────────────────┘
               │ HTTP / SSE
┌──────────────▼──────────────────────────────────────────────────┐
│                    FastAPI Backend                               │
│                                                                 │
│   ┌──────────────────┐    ┌────────────────────────────────┐   │
│   │  /curriculum/*   │    │   /sandbox/*                   │   │
│   │  - POST /generate│    │   - POST /hint                 │   │
│   │  - GET /stream   │    │   - POST /evaluate             │   │
│   │  - GET /notes    │    │                                │   │
│   └────────┬─────────┘    └──────────────┬─────────────────┘   │
│            │                             │                      │
│   ┌────────▼─────────────────────────────▼─────────────────┐   │
│   │               LangGraph Agent Graph                     │   │
│   │   Node 1: Query Planner                                 │   │
│   │   Node 2: Retriever (YouTube + DDG + BS4)               │   │
│   │   Node 3: Synthesizer (grok-4.1-fast)                   │   │
│   │   Node 4: Formatter + Citation Linker                   │   │
│   └────────┬────────────────────────────────────────────────┘   │
│            │                                                     │
│   ┌────────▼───────────┐    ┌──────────────────────────────┐   │
│   │  Supabase (Postgres)│    │   MCP Socratic Agent         │   │
│   │   - lessons cache  │    │   - Context reader           │   │
│   │   - user progress  │    │   - Hint generator           │   │
│   │   - session data   │    │   - Anti-spoonfeed guard     │   │
│   └────────────────────┘    └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
               │ DDG API / YouTube Transcript API / HTTP
┌──────────────▼──────────────────────────────────────────────────┐
│                    External Services                            │
│   DuckDuckGo Search API   YouTube Transcript API   Public Web  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow: Curriculum Generation

```
User inputs goal
    → Backend checks SQLite cache (hash of normalized goal)
    → CACHE HIT: return cached lesson instantly
    → CACHE MISS:
        → LangGraph Node 1: decompose goal into sub-topics
        → LangGraph Node 2: retrieve for each sub-topic
            → YouTube transcript API (top 2 videos)
            → DuckDuckGo search (top 5 results, snippets only)
            → BeautifulSoup fetch on top 2 URLs (text extraction)
        → LangGraph Node 3: synthesize into structured curriculum (grok-4.1-fast)
        → LangGraph Node 4: format + attach source citations
        → Store in Supabase cache
        → Stream back to frontend via SSE
```

### Data Flow: Socratic Sandbox

```
User writes code / text in sandbox
    → Frontend sends current content + lesson context to /sandbox/hint
    → MCP agent receives: { lesson_topic, user_content, attempt_count }
    → grok-3-mini evaluates against lesson objective
    → Returns: { hint: string, hint_type: 'direction' | 'question' | 'observation' }
    → NEVER returns: completed code, direct answers, solutions
```

---

## 5. Tech Stack (Finalized)

### Backend

| Layer | Choice | Rationale |
|---|---|---|
| Framework | FastAPI | Async-native, clean SSE support, fast to prototype |
| AI model — curriculum | `grok-4.1-fast` | Near-frontier quality at $0.20/$0.50 per 1M tokens; 2M token context window handles large retrieval payloads; fast enough for streaming |
| AI model — sandbox | `grok-3-mini` | Reasoning-optimized at $0.30/$0.50 per 1M tokens; its think-before-responding behavior is ideal for Socratic hint generation; cheap enough to call on every editor update |
| AI provider | xAI API (Grok) | OpenAI-compatible API surface — drop-in with standard `openai` Python SDK pointing to `https://api.x.ai/v1` |
| Agent framework | LangGraph | Multi-node retrieval graph; used only for curriculum generation, not sandbox |
| Context protocol | MCP | Sandbox agent reads live editor context |
| YouTube retrieval | `youtube-transcript-api` | No API key needed, reliable |
| Web search | `duckduckgo-search` (ddgs) | No API key, rate-limit friendly for demo |
| Web scraping | `httpx` + `BeautifulSoup4` | Async-compatible; BS4 for text extraction only |
| Database | Supabase (Postgres) via `supabase-py` | Familiar to the team; managed Postgres with built-in REST API, no infra to run; free tier sufficient for hackathon |
| Background tasks | FastAPI `BackgroundTasks` | Keeps generation async without Celery overhead |
| Streaming | SSE via `sse-starlette` | Real-time curriculum progress to frontend |

> **Decision note on models:** Two models are used intentionally. `grok-4.1-fast` handles curriculum synthesis — it needs quality and speed over a large context (retrieval dumps can be 50k+ tokens). `grok-3-mini` handles the Socratic sandbox — it needs structured reasoning to analyze code/text and produce targeted hints, and it runs on every user keystroke batch, so cost matters. Both use the same xAI API key. Do not use `grok-4` for either role — it is 15× more expensive than `grok-4.1-fast` with marginal quality gain at hackathon scale.

> **Decision note on xAI API setup:** The xAI API is OpenAI-compatible. Use the `openai` Python SDK with `base_url="https://api.x.ai/v1"` and your xAI API key. No new SDK needed.
> ```python
> from openai import AsyncOpenAI
> client = AsyncOpenAI(api_key=XAI_API_KEY, base_url="https://api.x.ai/v1")
> ```

> **Decision note on Supabase:** Using `supabase-py` (v2.28+) with the async client (`acreate_client`). Initialize once at app startup via FastAPI's `lifespan` context manager and inject via dependency. Use the `service_role` key server-side. Tables are created via the Supabase dashboard SQL editor — no migration tooling needed for the hackathon.

> **Decision note on scraping:** Full-page BeautifulSoup scraping is limited to 2 URLs per generation, with a 5-second timeout and graceful fallback to DuckDuckGo snippet only. This prevents demo breakage on JS-heavy or paywalled sites.

### Frontend

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React 18 + TypeScript | Stable, well-supported |
| Routing | React Router v6 | Standard |
| State | Zustand | Lightweight; used ONLY for curriculum metadata + user progress, NOT for editor state |
| Editor state | Local component state + refs | Avoids stale closure bugs with live MCP context |
| Styling | Tailwind CSS + ShadCN UI | Fast component composition |
| Animation | Framer Motion | Page transitions + curriculum reveal animations |
| SSE client | Native `EventSource` API | No library needed |
| Notes export | Client-side markdown → `.md` blob download | Zero dependency, no PDF complexity |

### Chrome Extension

| Layer | Choice |
|---|---|
| Manifest version | V3 |
| Activation trigger | `chrome.storage` + `webNavigation.onCommitted` listener |
| Font injection | OpenDyslexic via base64-embedded `@font-face` in injected CSS |
| Scope | Only on domains stored in `chrome.storage.session` by the webapp |

---

## 6. Feature Specifications

### Feature 1: Goal-Setting Intake

**Description:** The entry point of the app. User inputs a free-form learning goal.

**Behavior:**
- Single text input, no dropdowns, no pre-built categories
- Examples shown as chips below the input (non-selectable, just illustrative):
  - "Build a REST API with FastAPI"
  - "Understand the DSM-5 criteria for ADHD"
  - "Learn how transformers work from scratch"
- On submit: input is normalized (lowercase, stripped) and hashed (SHA-256) for Supabase cache lookup
- If hash matches a cached lesson: immediately redirect to curriculum view with a `cached: true` flag shown subtly in the UI

**Validation:**
- Minimum 10 characters
- Maximum 300 characters
- Empty submit → inline error, not a toast

---

### Feature 2: Curriculum Generation with Streaming

**Description:** LangGraph agent generates a structured learning roadmap and streams it to the user in real time.

**Behavior:**
- After submission, user sees a progress view with SSE-driven status updates:
  - `"Planning your learning path..."`
  - `"Searching for YouTube resources..."`
  - `"Fetching documentation..."`
  - `"Synthesizing curriculum..."`
- Curriculum is structured as:
  ```
  Goal: <user's goal>
  
  Module 1: <topic>
    - Lesson 1.1: <concept>
      Content: <synthesized explanation>
      Sources: [<title> → <url>], [<title> → <url>]
    - Lesson 1.2: ...
  
  Module 2: ...
  
  Key Takeaways: [auto-extracted bullet list]
  ```
- Each source citation is rendered as a clickable link
- Source links trigger the Chrome extension registration flow (see Feature 6)
- Auto-Notes section appears at the bottom: extracted key takeaways with a "Download as .md" button

**Error handling:**
- If retrieval returns 0 sources: show a warning banner ("We couldn't find external sources. Content is generated from model knowledge only. Verify independently.")
- If generation times out (>25s): show error with retry button
- Partial streams are preserved — if SSE disconnects mid-way, whatever arrived is shown with a "Generation interrupted" banner

---

### Feature 3: Socratic Sandbox

**Description:** An interactive practice environment where the MCP agent provides contextual hints without ever giving direct answers.

**Two sandbox modes (determined automatically by lesson topic):**

**Code Mode** (for programming topics):
- Monaco editor (or CodeMirror) embedded in the page
- Language auto-detected from lesson topic (Python, JavaScript, SQL, etc.)
- "Get a hint" button sends current editor content + lesson objective to `/sandbox/hint`

**Text Mode** (for conceptual/clinical/analytical topics):
- Plain textarea with a character counter
- Same hint mechanism

**MCP Agent Behavior (strictly enforced via system prompt):**

The agent MUST:
- Analyze what the user has written and what the lesson objective is
- Identify the specific gap or error
- Return a question, observation, or directional hint

The agent MUST NOT:
- Write any code that solves the problem
- Give a direct answer to "what should I write here?"
- Confirm or deny if the user's solution is complete (it may say "you're on the right track" but not "yes, that's correct")

**Hint types returned:**
- `direction` — points toward the right area ("Think about what happens when the loop index equals the array length")
- `question` — Socratic questioning ("What does a 3-day manic episode rule out?")
- `observation` — neutral observation about what's in the editor ("I notice you're using a `for` loop here. What does each iteration represent?")

**Attempt tracking:**
- Hint count per session is tracked
- After 5 hints on the same problem: a "Reflect" prompt appears ("You've spent significant time on this. Would you like to revisit the lesson content?") — still no direct answer

---

### Feature 4: Progress Dashboard

**Description:** A central hub showing the user's active curriculums and progress.

**Behavior:**
- Lists all generated curriculums (stored in Supabase `progress` table, keyed to session UUID)
- Each shows: goal text, number of modules, completion percentage (based on lessons viewed), last accessed timestamp
- Clicking a curriculum opens the curriculum view at the last-read position
- No authentication in v1 — progress is stored in `localStorage` keyed to a session UUID, synced with Supabase

**Note to judges:** Auth is intentionally out of scope for v1. Session UUID is generated on first visit and persisted in `localStorage`.

---

### Feature 5: Auto-Notes Generation

**Description:** Automatically extract key takeaways from a generated curriculum into a downloadable study guide.

**Behavior:**
- Triggered during curriculum generation (LangGraph Node 4 extracts key takeaways as part of formatting)
- Displayed in a collapsible "Study Notes" panel at the bottom of the curriculum view
- Format:
  ```markdown
  # Study Notes: <goal>
  Generated: <date>
  
  ## Key Concepts
  - <takeaway 1>
  - <takeaway 2>
  
  ## Terms to Know
  - <term>: <definition>
  
  ## Sources
  - [<title>](<url>)
  ```
- "Download as .md" button triggers a client-side blob download — no server call needed

---

### Feature 6: Chrome Extension — Dyslexic Mode

**Description:** Globally applies dyslexia-friendly typography to any external website the user navigates to from within AdaptEd.

**Activation Flow:**
1. User reads lesson in AdaptEd webapp
2. User clicks a source citation link
3. Before opening the link, the webapp calls `chrome.storage.session.set({ adaptedDomains: [...currentDomains, newDomain] })`
4. Link opens in new tab
5. Extension's `content_script.js` fires on `document_idle` for every page
6. Script checks `chrome.storage.session.get('adaptedDomains')` — if current domain is in the list, apply styles

**Styles applied:**
```css
* {
  font-family: 'OpenDyslexic', sans-serif !important;
  text-align: left !important;          /* removes justified text */
  line-height: 1.8 !important;
  word-spacing: 0.16em !important;
  letter-spacing: 0.12em !important;
}
```

**OpenDyslexic delivery:** Base64-encoded as a `@font-face` declaration injected directly into the page — no external CDN call, no CORS issues.

**Extension popup (optional UI):**
- Simple toggle: "AdaptEd Dyslexic Mode: ON / OFF"
- Manual override to activate on any page regardless of AdaptEd origin

**Manifest V3 permissions required:**
```json
{
  "permissions": ["storage", "webNavigation", "activeTab", "scripting"],
  "host_permissions": ["<all_urls>"]
}
```

---

## 7. API Design

### Base URL: `http://localhost:8000/api/v1`

---

#### `POST /curriculum/generate`

Initiates curriculum generation. Returns a `generation_id` immediately; client then connects to SSE stream.

**Request:**
```json
{
  "goal": "Teach me how to build a FastAPI backend",
  "session_id": "uuid-v4"
}
```

**Response:**
```json
{
  "generation_id": "gen_abc123",
  "cached": false
}
```

---

#### `GET /curriculum/stream/{generation_id}`

SSE stream. Client subscribes after receiving `generation_id`.

**Events emitted:**
```
event: status
data: {"message": "Searching YouTube...", "step": 2, "total_steps": 4}

event: chunk
data: {"content": "## Module 1: FastAPI Basics\n\n", "module_index": 0}

event: complete
data: {"lesson_id": "les_xyz789", "cached": false}

event: error
data: {"message": "Retrieval failed for sub-topic: middleware", "fatal": false}
```

---

#### `GET /curriculum/{lesson_id}`

Fetch a fully generated lesson from cache.

**Response:** Full lesson object (see database schema below)

---

#### `GET /curriculum/{lesson_id}/notes`

Returns the auto-extracted study notes in markdown format.

**Response:**
```json
{
  "markdown": "# Study Notes: ...\n\n## Key Concepts\n..."
}
```

---

#### `POST /sandbox/hint`

Request a Socratic hint from the MCP agent.

**Request:**
```json
{
  "lesson_id": "les_xyz789",
  "module_index": 0,
  "lesson_index": 1,
  "user_content": "def add(a, b):\n    return a - b",
  "mode": "code",
  "language": "python",
  "attempt_count": 2
}
```

**Response:**
```json
{
  "hint": "Look closely at the operator you're using. Does subtraction match what 'add' is supposed to do?",
  "hint_type": "observation",
  "attempt_count": 3
}
```

---

#### `GET /session/{session_id}/progress`

Returns all curriculums and completion state for a session.

**Response:**
```json
{
  "curriculums": [
    {
      "lesson_id": "les_xyz789",
      "goal": "...",
      "completion_pct": 40,
      "last_accessed": "2026-04-08T12:30:00Z"
    }
  ]
}
```

---

#### `POST /session/{session_id}/progress`

Update lesson completion state.

**Request:**
```json
{
  "lesson_id": "les_xyz789",
  "module_index": 0,
  "lesson_index": 2,
  "viewed": true
}
```

---

## 8. Database Schema

Using Supabase (managed Postgres). Tables are created via the Supabase dashboard SQL editor. Use the `service_role` key server-side; Row Level Security (RLS) is disabled for v1 since there is no user auth.

### `lessons`

```sql
CREATE TABLE lessons (
    id          TEXT PRIMARY KEY,           -- 'les_' || gen_random_uuid()
    goal_hash   TEXT UNIQUE NOT NULL,       -- SHA-256 of normalized goal
    goal_raw    TEXT NOT NULL,
    content     JSONB NOT NULL,             -- full curriculum as structured JSON
    notes       TEXT,                       -- extracted markdown notes
    sources     JSONB,                      -- array of {title, url}
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    hit_count   INTEGER DEFAULT 0          -- cache hit counter
);

CREATE INDEX idx_lessons_goal_hash ON lessons(goal_hash);
```

### `sessions`

```sql
CREATE TABLE sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    last_seen   TIMESTAMPTZ DEFAULT NOW()
);
```

### `progress`

```sql
CREATE TABLE progress (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id   UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    lesson_id    TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    viewed_nodes JSONB NOT NULL DEFAULT '[]',  -- array of "moduleIdx-lessonIdx"
    hint_counts  JSONB NOT NULL DEFAULT '{}',  -- map of "moduleIdx-lessonIdx" → count
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, lesson_id)
);
```

> **Supabase client setup in FastAPI:**
> ```python
> from supabase import acreate_client, AsyncClient
> from contextlib import asynccontextmanager
>
> supabase: AsyncClient = None
>
> @asynccontextmanager
> async def lifespan(app: FastAPI):
>     global supabase
>     supabase = await acreate_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
>     yield
>
> app = FastAPI(lifespan=lifespan)
> ```
> Use `supabase.table("lessons").select("*").eq("goal_hash", h).execute()` for queries. No ORM needed for the hackathon.

---

## 9. Frontend Structure

```
src/
├── components/
│   ├── ui/                  # ShadCN re-exports + custom variants
│   ├── GoalInput.tsx         # Intake form with examples
│   ├── GenerationStream.tsx  # SSE subscriber + progress UI
│   ├── CurriculumViewer.tsx  # Renders structured curriculum
│   ├── LessonCard.tsx        # Individual lesson with citation links
│   ├── SocraticSandbox.tsx   # Monaco/textarea + hint panel
│   ├── HintPanel.tsx         # Displays hints with type badge
│   ├── NotesPanel.tsx        # Collapsible notes + download button
│   └── ProgressDashboard.tsx # Session curriculum list
│
├── store/
│   └── useAppStore.ts       # Zustand: { curriculums[], activeLessonId, sessionId }
│                             # NOT editor state — that stays in component refs
│
├── hooks/
│   ├── useSSEStream.ts      # Wraps EventSource, returns { chunks, status, error }
│   └── useProgress.ts       # Reads/writes progress to backend + localStorage
│
├── pages/
│   ├── Home.tsx             # Goal intake
│   ├── Generating.tsx       # SSE stream progress view
│   ├── Curriculum.tsx       # Full curriculum view
│   ├── Sandbox.tsx          # Socratic sandbox
│   └── Dashboard.tsx        # Progress dashboard
│
├── lib/
│   ├── api.ts               # All fetch calls to FastAPI
│   ├── hash.ts              # SHA-256 goal normalization
│   └── extensionBridge.ts   # chrome.storage calls for domain registration
│
└── types/
    └── index.ts             # Lesson, Module, Hint, ProgressEntry types
```

### State Management Rules

- **Zustand store** holds: list of curriculum IDs, active lesson ID, session UUID, global loading states
- **Component `useState`/`useRef`** holds: editor content, hint list, sandbox mode
- **`localStorage`** mirrors session UUID and progress for persistence across page refreshes
- **Never** put editor content in Zustand — it causes stale closures with the MCP SSE connection

---

## 10. Chrome Extension Spec

### File Structure

```
extension/
├── manifest.json
├── background.js          # Service worker: watches webNavigation events
├── content_script.js      # Injected on page load: applies styles if domain matches
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
└── fonts/
    └── OpenDyslexic.b64   # Base64 encoded font file
```

### `manifest.json`

```json
{
  "manifest_version": 3,
  "name": "AdaptEd Dyslexic Mode",
  "version": "1.0.0",
  "description": "Applies dyslexia-friendly typography on sites you visit from AdaptEd.",
  "permissions": ["storage", "webNavigation", "activeTab", "scripting"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content_script.js"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "popup/popup.html"
  }
}
```

### `content_script.js` Logic

```javascript
chrome.storage.session.get(['adaptedDomains', 'globalMode'], ({ adaptedDomains, globalMode }) => {
  const currentDomain = window.location.hostname;
  const shouldApply = globalMode || (adaptedDomains && adaptedDomains.includes(currentDomain));
  if (shouldApply) applyDyslexicMode();
});

function applyDyslexicMode() {
  const style = document.createElement('style');
  style.id = 'adapted-dyslexic-mode';
  style.textContent = `
    @font-face {
      font-family: 'OpenDyslexic';
      src: url('data:font/otf;base64,${FONT_B64}') format('opentype');
    }
    * {
      font-family: 'OpenDyslexic', sans-serif !important;
      text-align: left !important;
      line-height: 1.8 !important;
      word-spacing: 0.16em !important;
      letter-spacing: 0.12em !important;
    }
  `;
  document.head.appendChild(style);
}
```

### `extensionBridge.ts` (frontend webapp side)

```typescript
export function registerDomainForDyslexicMode(url: string) {
  try {
    const domain = new URL(url).hostname;
    chrome.storage.session.get(['adaptedDomains'], ({ adaptedDomains }) => {
      const domains = adaptedDomains || [];
      if (!domains.includes(domain)) {
        chrome.storage.session.set({ adaptedDomains: [...domains, domain] });
      }
    });
  } catch {
    // chrome API not available (non-extension context) — fail silently
  }
}
```

Called when user clicks a citation link in `LessonCard.tsx` before opening the URL.

---

## 11. Known Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| BeautifulSoup fails on JS-rendered pages | High | Medium | Limit to 2 URLs, 5s timeout, fallback to DDG snippet only |
| xAI API rate limits during demo | Medium | High | Pre-cache 5 common demo topics before presenting; add exponential backoff; `grok-4.1-fast` and `grok-3-mini` both have generous rate limits compared to top-tier models |
| LangGraph + MCP integration complexity | Medium | High | Build and test them independently first; LangGraph for curriculum, MCP for sandbox — they never call each other |
| Extension `chrome.storage.session` unavailable | Low | Medium | Wrap all `chrome.*` calls in try/catch; extension fails silently if not installed |
| Socratic sandbox prompt jailbreak by judge | Medium | Medium | System prompt uses multiple constraint layers + output validation — if response contains code blocks, retry with stricter prompt; `grok-3-mini`'s reasoning mode makes it harder to jailbreak than pure completion models |
| Long generation time impresses nobody | Medium | High | Use SSE to show real-time progress; even a 15s generation feels fast if you see it working step by step |
| Supabase free tier connection limits | Low | Low | Free tier allows 500MB DB and 2 concurrent connections — fine for hackathon; pool connections via a single shared client |
| `grok-3-mini` reasoning latency for hints | Low | Medium | Set `reasoning_effort: "low"` for hint requests where speed matters more than depth; use `"high"` only for the first hint on a new problem |

---

## 12. Out of Scope (v1)

- **User authentication / accounts** — sessions are UUID-based, progress lives in localStorage + Supabase. No login, no passwords.
- **PDF export** — Notes export is markdown only (`.md` blob download). PDF requires Puppeteer or jsPDF which adds complexity not worth it for hackathon.
- **Mobile responsive UI** — Desktop-first. The sandbox Monaco editor is not mobile-friendly anyway.
- **Multi-language support** — English only.
- **Collaborative learning** — Single-user sessions only.
- **Supabase Auth / RLS** — No row-level security in v1. Service role key is used server-side only. Post-hackathon, enable Supabase Auth and RLS per-user.
- **Video playback** — YouTube links are cited but videos are not embedded. Transcripts are used for context extraction only.
- **Spaced repetition / flashcards** — Possible future feature after the Sandbox is proven.

---

## 13. Build Order & Milestones

Build in this order to ensure you always have a demoable product:

### Phase 1: Backend Foundation (Build first)
- [ ] FastAPI project setup with `supabase-py` async client
- [ ] Create Supabase project; run table SQL in dashboard SQL editor
- [ ] `/curriculum/generate` endpoint (synchronous first, no LangGraph yet)
- [ ] Basic xAI API call via `openai` SDK pointing to `https://api.x.ai/v1` — hardcode a test goal, verify response with `grok-4.1-fast`
- [ ] SSE streaming endpoint (`/curriculum/stream/{id}`)

### Phase 2: Retrieval Layer
- [ ] DuckDuckGo search integration via `ddgs`
- [ ] `youtube-transcript-api` integration
- [ ] BeautifulSoup fetch with timeout + fallback
- [ ] Lesson caching via goal hash lookup in Supabase `lessons` table

### Phase 3: LangGraph Agent
- [ ] Build 4-node graph (Planner → Retriever → Synthesizer → Formatter)
- [ ] Wire into `/curriculum/generate` endpoint
- [ ] Test end-to-end with 3 different topic types (code, medical, conceptual)

### Phase 4: Frontend Core
- [ ] React app scaffold (Vite + TypeScript + Tailwind)
- [ ] Zustand store setup
- [ ] Goal intake page
- [ ] SSE stream subscriber + progress UI
- [ ] Curriculum viewer with citation links

### Phase 5: Socratic Sandbox
- [ ] MCP agent setup
- [ ] `/sandbox/hint` endpoint using `grok-3-mini` with `reasoning_effort: "low"`
- [ ] Sandbox UI (Monaco in code mode, textarea in text mode)
- [ ] Hint panel with attempt tracking
- [ ] Test jailbreak resistance: confirm agent never returns direct code solutions

### Phase 6: Chrome Extension
- [ ] Manifest V3 boilerplate
- [ ] Content script with OpenDyslexic injection
- [ ] `chrome.storage.session` domain registration
- [ ] `extensionBridge.ts` in frontend
- [ ] Test on Wikipedia, AWS docs, APA journal

### Phase 7: Polish & Demo Prep
- [ ] Error states in UI (retrieval failures, timeouts, SSE disconnects)
- [ ] Auto-notes panel + `.md` download
- [ ] Progress dashboard
- [ ] Pre-cache 5 demo topics
- [ ] Rehearse live demo flow (goal → stream → lesson → sandbox → hint refusal → extension)

---

*This document should be treated as the single source of truth for the v1 build. All architectural decisions, scope boundaries, and implementation details above supersede the original brief where they conflict.*