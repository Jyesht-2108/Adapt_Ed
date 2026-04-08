# AdaptEd Frontend - Member 3 Implementation

## Phase 2 Complete ✅

All Phase 2 pages and components are implemented and ready for integration with the backend.

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` if needed (default points to `http://localhost:8000/api/v1`).

### 3. Run Development Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## Implemented Features

### Phase 1 - App Scaffold ✅

- ✅ Vite + React 18 + TypeScript + Tailwind CSS
- ✅ React Router v6 with all routes
- ✅ Zustand store with localStorage persistence
- ✅ Type definitions matching backend models
- ✅ API client with typed wrappers
- ✅ Extension bridge for Chrome extension integration

### Phase 2 - Pages & Components ✅

#### Home Page (`/`)
- ✅ Goal input form with validation (10-300 chars)
- ✅ Example goal chips
- ✅ Inline error messages
- ✅ Character counter
- ✅ Calls `/curriculum/generate` endpoint
- ✅ Navigates to generation stream

#### Generation Stream Page (`/generating/:generationId`)
- ✅ SSE client hook (`useSSEStream`)
- ✅ Real-time progress bar
- ✅ Status message display
- ✅ Content chunk preview
- ✅ Handles all SSE events: `status`, `chunk`, `complete`, `error`
- ✅ Auto-redirects to curriculum on completion
- ✅ Cache hit detection

#### Curriculum Viewer Page (`/curriculum/:lessonId`)
- ✅ Fetches curriculum from backend
- ✅ Expandable module sections
- ✅ Lesson cards with content
- ✅ Citation links with extension bridge integration
- ✅ Progress tracking (mark as viewed)
- ✅ Sticky header with navigation
- ✅ "Practice in Sandbox" button (if sandbox_mode available)

#### Notes Panel
- ✅ Collapsible panel
- ✅ Markdown display
- ✅ Client-side `.md` download (no server call)
- ✅ Filename based on goal

#### Progress Dashboard (`/dashboard`)
- ✅ Lists all curriculums for session
- ✅ Completion percentage per curriculum
- ✅ Last accessed timestamp with relative time
- ✅ Empty state with CTA
- ✅ Grid layout with hover effects

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── GoalInput.tsx              ✅ Goal intake form
│   │   ├── GenerationStream.tsx       ✅ SSE progress display
│   │   ├── CurriculumViewer.tsx       ✅ Module/lesson renderer
│   │   ├── LessonCard.tsx             ✅ Individual lesson card
│   │   └── NotesPanel.tsx             ✅ Collapsible notes with download
│   ├── hooks/
│   │   └── useSSEStream.ts            ✅ SSE client hook
│   ├── lib/
│   │   ├── api.ts                     ✅ API client
│   │   ├── hash.ts                    ✅ Goal hashing
│   │   └── extensionBridge.ts         ✅ Chrome extension bridge
│   ├── pages/
│   │   ├── Home.tsx                   ✅ Goal intake page
│   │   ├── Generating.tsx             ✅ Generation stream page
│   │   ├── Curriculum.tsx             ✅ Curriculum viewer page
│   │   ├── Sandbox.tsx                ⏳ Phase 3
│   │   └── Dashboard.tsx              ✅ Progress dashboard
│   ├── store/
│   │   └── useAppStore.ts             ✅ Zustand store
│   ├── types/
│   │   └── index.ts                   ✅ Type definitions
│   ├── App.tsx                        ✅ Router setup
│   └── main.tsx                       ✅ Entry point
└── package.json
```

## Key Features

### SSE Streaming
The `useSSEStream` hook handles real-time curriculum generation:
- Connects to `/curriculum/stream/{generationId}`
- Listens for `status`, `chunk`, `complete`, `error` events
- Auto-reconnects on disconnect
- Graceful error handling

### Extension Bridge
Citation links call `openWithDyslexicMode(url)` before opening:
```typescript
import { openWithDyslexicMode } from '../lib/extensionBridge';

// In LessonCard.tsx
const handleCitationClick = (url: string, e: React.MouseEvent) => {
  e.preventDefault();
  openWithDyslexicMode(url);
};
```

This registers the domain with the Chrome extension for dyslexic mode.

### State Management
Zustand store is minimal and focused:
- `sessionId` - UUID generated on first visit
- `curriculums[]` - List of progress entries
- `activeLessonId` - Currently viewed lesson

**CRITICAL:** Editor content is NEVER stored in Zustand (Phase 3 will use refs).

### Progress Tracking
Progress is tracked both locally and on the backend:
- `localStorage` - Mirrors Zustand state for persistence
- Backend - `/session/{session_id}/progress` endpoints
- Updates on lesson view via `updateProgress()`

## Integration with Backend

All endpoints are ready to integrate:

| Frontend Call | Backend Endpoint | Status |
|---|---|---|
| `apiClient.generateCurriculum()` | `POST /curriculum/generate` | ✅ Working |
| `useSSEStream()` | `GET /curriculum/stream/{id}` | ✅ Working |
| `apiClient.getCurriculum()` | `GET /curriculum/{id}` | ✅ Working |
| `apiClient.getLessonNotes()` | `GET /curriculum/{id}/notes` | ✅ Working |
| `apiClient.getSessionProgress()` | `GET /session/{id}/progress` | ✅ Working |
| `apiClient.updateProgress()` | `POST /session/{id}/progress` | ✅ Working |

## Testing

### Manual Testing Checklist

1. **Home Page**
   - [ ] Enter goal < 10 chars → see error
   - [ ] Enter goal > 300 chars → see error
   - [ ] Click example chip → goal populates
   - [ ] Submit valid goal → navigate to generating page

2. **Generation Stream**
   - [ ] See progress bar update
   - [ ] See status messages change
   - [ ] See content chunks appear
   - [ ] Auto-redirect to curriculum on complete

3. **Curriculum Viewer**
   - [ ] Modules expand/collapse
   - [ ] Citation links open in new tab
   - [ ] "Mark as viewed" updates progress
   - [ ] Notes panel expands/collapses
   - [ ] Download .md works

4. **Dashboard**
   - [ ] See list of curriculums
   - [ ] Progress bars show correct %
   - [ ] Click curriculum → navigate to viewer
   - [ ] Empty state shows when no curriculums

## What's Next (Phase 3)

- [ ] Sandbox page layout (two-panel)
- [ ] Monaco editor integration (code mode)
- [ ] Textarea editor (text mode)
- [ ] Hint panel UI
- [ ] "Get a hint" button integration
- [ ] "Reflect" prompt after 5 hints

## For Member 2

The frontend is ready for your `/sandbox/hint` endpoint integration!

When you're ready, the frontend will:
1. Send `SandboxHintRequest` to your endpoint
2. Display hints with type badges (`direction`, `question`, `observation`)
3. Show "Reflect" prompt when `reflect: true`
4. Track attempt count per problem

## For Member 4

The extension bridge is ready!

`extensionBridge.ts` exports:
- `registerDomainForDyslexicMode(url)` - Registers domain in `chrome.storage.session`
- `openWithDyslexicMode(url)` - Registers + opens URL

The frontend calls this before opening citation links in `LessonCard.tsx`.

## Notes

- All components use Tailwind CSS for styling
- No external UI library needed (built custom components)
- TypeScript strict mode enabled
- All API calls are typed
- Error states handled gracefully
- Loading states on all async operations
