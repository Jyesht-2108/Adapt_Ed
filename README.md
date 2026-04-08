# AdaptEd — AI-Driven Personalized Learning Platform

> Anyone should be able to master any subject, at their own pace, in a format that works for their brain.

AdaptEd is an AI-powered learning platform that generates fully personalized, goal-anchored curriculums from real-time web content, provides Socratic tutoring without spoon-feeding, and extends dyslexia-friendly rendering globally via a Chrome extension.

---

## 🎯 Core Features

### 1. Personalized Curriculum Generation
- AI-generated learning roadmaps tailored to your specific goal
- Real-time content sourced from YouTube, documentation, and web articles
- Structured modules with lessons, key takeaways, and citations
- Smart caching for instant repeated topic loads (<500ms)

### 2. Socratic Sandbox
- Interactive practice environment with AI hints
- **Code Mode**: Monaco editor for programming topics
- **Text Mode**: Textarea for conceptual/analytical topics
- AI refuses to give direct answers — guides you to discover solutions
- Tracks hint attempts and encourages reflection

### 3. Chrome Extension — Dyslexic Mode
- Applies dyslexia-friendly typography to external websites
- Activates automatically when you click citation links
- OpenDyslexic font with optimized spacing and alignment
- Works across the entire web

### 4. Progress Tracking
- Session-based progress (no login required for v1)
- Completion tracking per module and lesson
- Dashboard showing all active curriculums

### 5. Auto-Generated Study Notes
- Key concepts and takeaways extracted automatically
- Downloadable as `.md` files
- Includes all source citations

---

## 🏗️ Architecture

```
User Browser
├── React Frontend (SPA)
│   ├── Goal intake
│   ├── Curriculum viewer
│   ├── Socratic sandbox
│   └── Progress dashboard
└── Chrome Extension
    └── Dyslexic mode

FastAPI Backend
├── LangGraph Agent (Curriculum Generation)
│   ├── Query Planner
│   ├── Retriever (YouTube + DuckDuckGo + BeautifulSoup)
│   ├── Synthesizer (grok-4.1-fast)
│   └── Formatter + Citation Linker
├── MCP Socratic Agent (Sandbox Hints)
│   └── grok-3-mini with reasoning
└── Supabase (Postgres)
    ├── Lessons cache
    ├── User progress
    └── Session data
```

---

## 🚀 Tech Stack

### Backend
- **FastAPI** — Async Python framework with SSE support
- **LangGraph** — Multi-node retrieval agent for curriculum generation
- **MCP** — Model Context Protocol for Socratic sandbox
- **grok-4.1-fast** — Curriculum synthesis ($0.20/$0.50 per 1M tokens)
- **grok-3-mini** — Socratic hint generation ($0.30/$0.50 per 1M tokens)
- **Supabase** — Managed Postgres for caching and progress
- **youtube-transcript-api** — YouTube content retrieval
- **duckduckgo-search** — Web search without API keys
- **BeautifulSoup4** — Web scraping for documentation

### Frontend
- **React 18 + TypeScript**
- **Zustand** — Lightweight state management
- **Tailwind CSS + ShadCN UI** — Styling
- **Framer Motion** — Animations
- **Monaco Editor** — Code sandbox
- **EventSource API** — SSE streaming

### Chrome Extension
- **Manifest V3**
- **OpenDyslexic font** (base64-embedded)
- **chrome.storage.session** — Domain tracking

---

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- xAI API key (for Grok models)
- Supabase account

### Backend Setup

```bash
# Clone the repository
git clone <repository-url>
cd adapted

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add:
# - XAI_API_KEY=your_xai_api_key
# - SUPABASE_URL=your_supabase_url
# - SUPABASE_SERVICE_KEY=your_service_key

# Create Supabase tables (run SQL in Supabase dashboard)
# See Database Schema section below

# Start backend
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add:
# - VITE_API_URL=http://localhost:8000

# Start development server
npm run dev  # Runs on http://localhost:5173
```

### Chrome Extension Setup

```bash
# Load unpacked extension in Chrome
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the extension/ folder
```

---

## 🗄️ Database Schema

Run this SQL in your Supabase dashboard SQL editor:

```sql
-- Lessons cache
CREATE TABLE lessons (
    id          TEXT PRIMARY KEY,
    goal_hash   TEXT UNIQUE NOT NULL,
    goal_raw    TEXT NOT NULL,
    content     JSONB NOT NULL,
    notes       TEXT,
    sources     JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    hit_count   INTEGER DEFAULT 0
);

CREATE INDEX idx_lessons_goal_hash ON lessons(goal_hash);

-- User sessions
CREATE TABLE sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    last_seen   TIMESTAMPTZ DEFAULT NOW()
);

-- Progress tracking
CREATE TABLE progress (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id   UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    lesson_id    TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    viewed_nodes JSONB NOT NULL DEFAULT '[]',
    hint_counts  JSONB NOT NULL DEFAULT '{}',
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, lesson_id)
);
```

---

## 🔌 API Endpoints

### Curriculum Generation

**POST** `/api/v1/curriculum/generate`
```json
{
  "goal": "Teach me how to build a FastAPI backend",
  "session_id": "uuid-v4"
}
```

**GET** `/api/v1/curriculum/stream/{generation_id}`  
Server-Sent Events stream for real-time progress

**GET** `/api/v1/curriculum/{lesson_id}`  
Fetch cached lesson

**GET** `/api/v1/curriculum/{lesson_id}/notes`  
Get study notes in markdown

### Socratic Sandbox

**POST** `/api/v1/sandbox/hint`
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

### Progress Tracking

**GET** `/api/v1/session/{session_id}/progress`  
Get all curriculums and completion state

**POST** `/api/v1/session/{session_id}/progress`  
Update lesson completion

---

## 🎮 Usage

### Generate a Curriculum

1. Open the app at `http://localhost:5173`
2. Enter your learning goal (e.g., "Learn how transformers work from scratch")
3. Watch real-time progress as the AI:
   - Plans your learning path
   - Searches YouTube and documentation
   - Synthesizes structured lessons
   - Extracts key takeaways
4. View your personalized curriculum with citations

### Practice in the Sandbox

1. Navigate to a lesson's practice section
2. Write code or text based on the lesson objective
3. Click "Get a hint" when stuck
4. AI provides Socratic guidance without direct answers
5. Iterate until you solve the problem

### Use Dyslexic Mode

1. Read a lesson in AdaptEd
2. Click any source citation link
3. Extension automatically applies dyslexia-friendly styles
4. Navigate freely — styles persist across the domain

---

## ⚙️ Configuration

### Environment Variables

#### Backend `.env`
```env
# xAI API
XAI_API_KEY=your_xai_api_key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# Optional
YOUTUBE_API_KEY=your_youtube_api_key  # Falls back to transcript-api if not set
```

#### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000
```

---

## 🎯 Quality Metrics

- **Curriculum generation (cold)**: <20 seconds
- **Curriculum generation (cached)**: <500ms
- **MCP agent hint latency**: <3 seconds
- **Extension DOM rewrite**: <200ms
- **Minimum 2 distinct sources per lesson**

---

## 🚧 Known Limitations (v1)

- No user authentication (session-based only)
- Desktop-first UI (not mobile responsive)
- English only
- No PDF export (markdown only)
- BeautifulSoup may fail on JS-heavy sites (graceful fallback to snippets)

---

## 🗺️ Roadmap

### Phase 1: Backend Foundation ✅
- FastAPI + Supabase setup
- xAI API integration
- SSE streaming

### Phase 2: Retrieval Layer ✅
- DuckDuckGo search
- YouTube transcript API
- BeautifulSoup scraping
- Lesson caching

### Phase 3: LangGraph Agent 🚧
- 4-node curriculum generation graph
- Query planning and synthesis
- Citation formatting

### Phase 4: Frontend Core 🚧
- React app with Zustand
- Goal intake and curriculum viewer
- SSE stream subscriber

### Phase 5: Socratic Sandbox 📋
- MCP agent with grok-3-mini
- Monaco editor integration
- Hint panel with attempt tracking

### Phase 6: Chrome Extension 📋
- Manifest V3 implementation
- OpenDyslexic font injection
- Domain registration bridge

### Phase 7: Polish & Demo Prep 📋
- Error handling
- Auto-notes panel
- Progress dashboard
- Pre-cache demo topics

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

[Your License Here]

---

## 🙏 Acknowledgments

- **xAI** for Grok models
- **Supabase** for managed Postgres
- **OpenDyslexic** font project
- All open-source contributors

---

**Built for hackathon demo** | **Version 1.0** | **Last updated: 2026-04-08**
