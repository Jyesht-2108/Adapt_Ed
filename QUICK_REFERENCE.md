# AdaptEd - Quick Reference Guide

Fast lookup for common tasks and commands.

---

## 🚀 Quick Start

### Start Everything
```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --reload

# Terminal 2: Frontend
cd frontend
npm install  # first time only
npm run dev

# Terminal 3: Extension
# Load in Chrome: chrome://extensions/ → Load unpacked → select extension/
```

---

## 📁 File Locations

### Extension
- Main logic: `extension/content_script.js`
- Popup UI: `extension/popup/popup.html`
- Config: `extension/manifest.json`
- Docs: `extension/README.md`

### Frontend
- Extension bridge: `frontend/src/lib/extensionBridge.ts`
- Pages: `frontend/src/pages/`
- Components: `frontend/src/components/`
- Config: `frontend/vite.config.ts`

### Backend
- API routes: `backend/app/routers/`
- Config: `backend/app/config.py`
- Main: `backend/main.py`

### Documentation
- Tasks: `MEMBER4_TASKS.md`
- Demo: `DEMO.md`
- Testing: `extension/TESTING.md`
- Summary: `IMPLEMENTATION_SUMMARY.md`

---

## 🔧 Common Commands

### Extension
```bash
# Encode font
cd extension
node scripts/encode-font.js

# Inject font into content script
node scripts/inject-font.js

# Generate placeholder icons
node scripts/generate-placeholder-icons.js
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

### Backend
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload

# Start with specific port
uvicorn main:app --reload --port 8000
```

---

## 🌐 URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Chrome Extensions: chrome://extensions/

---

## 🔍 Debugging

### Extension Console Logs
```javascript
// In any webpage console
chrome.storage.session.get(['adaptedDomains', 'globalMode'], console.log)

// Clear storage
chrome.storage.session.clear()

// Check if extension is available
typeof chrome !== 'undefined' && chrome.storage
```

### Frontend Console
```javascript
// Test extension bridge
import { isExtensionAvailable, registerDomainForDyslexicMode } from './src/lib/extensionBridge'

console.log('Extension available:', isExtensionAvailable())
registerDomainForDyslexicMode('https://wikipedia.org')
```

### Backend Logs
```bash
# Watch logs in terminal where uvicorn is running
# Look for [AdaptEd] prefixed messages
```

---

## 🧪 Testing

### Extension Quick Test
1. Load extension in Chrome
2. Open popup
3. Toggle "Global Mode" ON
4. Visit https://en.wikipedia.org/wiki/Dyslexia
5. Verify font changes

### Frontend Quick Test
1. Start frontend: `npm run dev`
2. Open http://localhost:5173
3. Enter a goal
4. Click "Generate My Curriculum"
5. Verify navigation to generating page

### Backend Quick Test
```bash
# Test health endpoint
curl http://localhost:8000/

# Test curriculum generation (requires backend running)
curl -X POST http://localhost:8000/api/v1/curriculum/generate \
  -H "Content-Type: application/json" \
  -d '{"goal": "Learn Python", "session_id": "test-123"}'
```

---

## 📝 Key Concepts

### Extension Storage
```javascript
// Storage schema
{
  adaptedDomains: string[],  // Array of hostnames
  globalMode: boolean        // Apply to all sites
}
```

### Extension Bridge
```typescript
// Register domain before opening link
registerDomainForDyslexicMode(url: string)

// Check if extension is available
isExtensionAvailable(): boolean

// Get registered domains
getRegisteredDomains(): Promise<string[]>
```

### API Endpoints
```
POST   /api/v1/curriculum/generate
GET    /api/v1/curriculum/stream/{generation_id}
GET    /api/v1/curriculum/{lesson_id}
GET    /api/v1/curriculum/{lesson_id}/notes
POST   /api/v1/sandbox/hint
GET    /api/v1/session/{session_id}/progress
POST   /api/v1/session/{session_id}/progress
```

---

## 🐛 Common Issues

### Extension not loading
- Check chrome://extensions/ for errors
- Verify all files exist
- Reload extension after changes

### Font not applying
- Check content_script.js has base64 data (not PLACEHOLDER)
- Verify domain is registered (check popup)
- Reload page after registration

### Frontend not connecting to backend
- Check backend is running on port 8000
- Verify CORS settings in backend
- Check browser console for errors

### Backend errors
- Check .env file exists and has correct values
- Verify Supabase credentials
- Check Python dependencies installed

---

## 📊 Progress Tracking

### Check Task Status
See `MEMBER4_TASKS.md` for detailed checklist

### Quick Status
- Extension Core: ✅ 100%
- Extension Setup: ⏳ 0%
- Frontend Scaffold: ✅ 100%
- Integration: ⏳ 50%
- Testing: ⏳ 0%
- Demo Prep: ⏳ 0%

---

## 🎯 Next Actions

1. Download OpenDyslexic font
2. Run encoding scripts
3. Create extension icons
4. Load extension in Chrome
5. Test global mode
6. Wait for Member 3's LessonCard.tsx
7. Integrate citation links
8. Pre-cache 5 demo topics
9. Write final demo script
10. Rehearse demo

---

## 📞 Getting Help

### Documentation
- Extension: `extension/README.md`
- Quick Start: `extension/QUICKSTART.md`
- Testing: `extension/TESTING.md`
- Tasks: `MEMBER4_TASKS.md`

### External Resources
- Chrome Extensions: https://developer.chrome.com/docs/extensions/
- React: https://react.dev/
- Vite: https://vitejs.dev/
- Tailwind: https://tailwindcss.com/

---

## 💡 Tips

- Use `[AdaptEd]` prefix in console.log for easy filtering
- Test extension on multiple sites (Wikipedia, MDN, GitHub)
- Keep extension popup open while debugging
- Use Chrome DevTools → Application → Storage to inspect chrome.storage
- Reload extension after every change
- Clear browser cache if styles not updating

---

## ⚡ Keyboard Shortcuts

### Chrome DevTools
- `F12` - Open DevTools
- `Ctrl+Shift+C` - Inspect element
- `Ctrl+Shift+J` - Open console
- `Ctrl+R` - Reload page
- `Ctrl+Shift+R` - Hard reload (clear cache)

### VS Code
- `Ctrl+P` - Quick file open
- `Ctrl+Shift+F` - Search in files
- `Ctrl+`` - Toggle terminal
- `F5` - Start debugging

---

## 🎨 Color Palette

```css
Primary: #007bff
Primary Dark: #0056b3
Success: #4CAF50
Warning: #ff9800
Error: #dc3545
Gray 50: #f8f9fa
Gray 100: #e9ecef
Gray 200: #dee2e6
Gray 300: #ced4da
```

---

## 📦 Dependencies

### Extension
- None (vanilla JavaScript)

### Frontend
- react, react-dom
- react-router-dom
- zustand
- framer-motion
- @monaco-editor/react
- tailwindcss

### Backend
- fastapi
- uvicorn
- sse-starlette
- openai
- langgraph
- supabase
- httpx
- beautifulsoup4
- duckduckgo-search
- youtube-transcript-api

---

**Last Updated:** 2026-04-08  
**For:** Member 4 (Chrome Extension & UI Polish)
