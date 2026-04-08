# AdaptEd - Complete Setup Guide

Step-by-step instructions to get the entire AdaptEd project running.

---

## Prerequisites

### Required Software
- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Google Chrome** - [Download](https://www.google.com/chrome/)
- **Git** - [Download](https://git-scm.com/)

### Required Accounts
- **xAI Account** - Get API key from [x.ai](https://x.ai/)
- **Supabase Account** - Sign up at [supabase.com](https://supabase.com/)

### Optional
- **VS Code** - Recommended IDE
- **Postman** - For API testing

---

## Part 1: Clone Repository

```bash
git clone <repository-url>
cd adapted
```

---

## Part 2: Backend Setup

### Step 1: Create Virtual Environment

```bash
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

If `requirements.txt` doesn't exist yet, install manually:
```bash
pip install fastapi uvicorn sse-starlette openai langgraph supabase httpx beautifulsoup4 duckduckgo-search youtube-transcript-api python-dotenv pydantic mcp
```

### Step 3: Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
# Use your favorite text editor
```

Required values in `.env`:
```env
XAI_API_KEY=your_xai_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### Step 4: Set Up Supabase

1. Go to [supabase.com](https://supabase.com/)
2. Create a new project
3. Go to SQL Editor
4. Run this SQL:

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

5. Go to Settings → API
6. Copy:
   - Project URL → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

### Step 5: Start Backend

```bash
uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Test it:
```bash
curl http://localhost:8000/docs
```

---

## Part 3: Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Configure Environment

```bash
# Copy example env file
cp .env.example .env
```

Content of `.env`:
```env
VITE_API_URL=http://localhost:8000
```

### Step 3: Start Frontend

```bash
npm run dev
```

You should see:
```
VITE v5.1.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Open http://localhost:5173 in your browser.

---

## Part 4: Chrome Extension Setup

### Step 1: Download OpenDyslexic Font

1. Visit https://opendyslexic.org/
2. Click "Download"
3. Extract the ZIP file
4. Find `OpenDyslexic-Regular.otf`
5. Copy to `extension/fonts/OpenDyslexic-Regular.otf`

### Step 2: Encode Font

```bash
cd extension
node scripts/encode-font.js
node scripts/inject-font.js
```

You should see:
```
✅ Font encoded successfully!
✅ Font injected successfully into content_script.js!
```

### Step 3: Create Icons

**Option A: Quick (Placeholder)**
```bash
node scripts/generate-placeholder-icons.js
```

**Option B: Proper Icons**
1. Visit https://favicon.io/favicon-generator/
2. Create icon with:
   - Text: "A"
   - Background: #007bff
   - Font: Bold
3. Download and extract
4. Rename files:
   - `favicon-16x16.png` → `icon16.png`
   - `favicon-32x32.png` → `icon48.png` (resize to 48x48)
   - `android-chrome-192x192.png` → `icon128.png` (resize to 128x128)
5. Copy to `extension/icons/`

### Step 4: Load Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Navigate to and select the `extension/` folder
6. Click "Select Folder"

You should see:
```
AdaptEd Dyslexic Mode
Version 1.0.0
ID: [random-extension-id]
```

### Step 5: Pin Extension

1. Click the puzzle piece icon in Chrome toolbar
2. Find "AdaptEd Dyslexic Mode"
3. Click the pin icon

---

## Part 5: Verify Everything Works

### Test 1: Backend Health Check

```bash
curl http://localhost:8000/docs
```

Should open API documentation.

### Test 2: Frontend Loads

1. Open http://localhost:5173
2. Should see AdaptEd home page
3. No console errors

### Test 3: Extension Works

1. Click extension icon in toolbar
2. Popup should open
3. Toggle "Global Mode" ON
4. Visit https://en.wikipedia.org/wiki/Dyslexia
5. Font should change to OpenDyslexic

### Test 4: Full Integration (When Backend Complete)

1. Open http://localhost:5173
2. Enter goal: "Learn Python basics"
3. Click "Generate My Curriculum"
4. Should see progress indicators
5. Should navigate to curriculum page
6. Click a citation link
7. Extension should activate on external site

---

## Troubleshooting

### Backend Issues

**Error: "ModuleNotFoundError"**
```bash
# Ensure virtual environment is activated
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

**Error: "Connection refused" to Supabase**
- Check `SUPABASE_URL` in `.env`
- Check `SUPABASE_SERVICE_KEY` in `.env`
- Verify Supabase project is active

**Error: "Invalid API key" for xAI**
- Check `XAI_API_KEY` in `.env`
- Verify key is active at x.ai

### Frontend Issues

**Error: "Cannot find module"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: "Port 5173 already in use"**
```bash
# Kill process on port 5173
# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:5173 | xargs kill -9
```

**Error: "Failed to fetch" from backend**
- Ensure backend is running on port 8000
- Check CORS settings in `backend/main.py`
- Verify `VITE_API_URL` in `frontend/.env`

### Extension Issues

**Extension won't load**
- Check chrome://extensions/ for errors
- Verify all files exist (manifest.json, background.js, content_script.js)
- Check manifest.json is valid JSON

**Font not applying**
- Verify `content_script.js` has base64 data (not PLACEHOLDER)
- Check browser console for errors (F12)
- Reload page after registering domain

**Icons not showing**
- This is OK for development
- Extension still works without icons
- Follow icon creation steps above

---

## Development Workflow

### Daily Startup

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Available for commands
```

### Making Changes

**Backend Changes:**
1. Edit files in `backend/`
2. FastAPI auto-reloads
3. Test at http://localhost:8000/docs

**Frontend Changes:**
1. Edit files in `frontend/src/`
2. Vite auto-reloads
3. Check http://localhost:5173

**Extension Changes:**
1. Edit files in `extension/`
2. Go to chrome://extensions/
3. Click refresh icon on extension card
4. Reload any open tabs

### Git Workflow

```bash
# Create feature branch
git checkout -b member-4/feature-name

# Make changes
git add .
git commit -m "feat(extension): add feature"

# Push to remote
git push origin member-4/feature-name

# Open PR on GitHub
```

---

## Environment Variables Reference

### Backend `.env`
```env
XAI_API_KEY=your_xai_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000
```

---

## Port Reference

- **5173** - Frontend (Vite dev server)
- **8000** - Backend (FastAPI)
- **54321** - Supabase local (if using local instance)

---

## Next Steps

After setup is complete:

1. **For Member 1:** Implement LangGraph agent and retrieval layer
2. **For Member 2:** Implement MCP Socratic agent
3. **For Member 3:** Implement frontend components and API integration
4. **For Member 4:** Test extension, integrate with frontend, pre-cache topics

---

## Getting Help

### Documentation
- Project README: `README.md`
- Team tasks: `TEAM.md`
- Member 4 tasks: `MEMBER4_TASKS.md`
- Extension docs: `extension/README.md`
- Quick reference: `QUICK_REFERENCE.md`

### External Resources
- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- Vite: https://vitejs.dev/
- Chrome Extensions: https://developer.chrome.com/docs/extensions/
- Supabase: https://supabase.com/docs

---

## Success Checklist

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Chrome installed
- [ ] xAI API key obtained
- [ ] Supabase project created
- [ ] Backend virtual environment created
- [ ] Backend dependencies installed
- [ ] Backend `.env` configured
- [ ] Supabase tables created
- [ ] Backend running on port 8000
- [ ] Frontend dependencies installed
- [ ] Frontend `.env` configured
- [ ] Frontend running on port 5173
- [ ] OpenDyslexic font downloaded
- [ ] Font encoded and injected
- [ ] Extension icons created
- [ ] Extension loaded in Chrome
- [ ] Extension popup opens
- [ ] Global mode works on Wikipedia

---

**Setup Time:** ~30-45 minutes  
**Difficulty:** Intermediate  
**Last Updated:** 2026-04-08
