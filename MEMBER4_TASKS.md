# Member 4 - Implementation Guide

This document tracks all tasks for Member 4 (Chrome Extension & UI Polish).

## ✅ Completed Tasks

### Phase 1: Extension Core
- [x] Manifest V3 scaffold (`extension/manifest.json`)
- [x] Background service worker (`extension/background.js`)
- [x] Content script with font injection (`extension/content_script.js`)
- [x] Extension popup UI (`extension/popup/`)
- [x] Font encoding scripts (`extension/scripts/`)
- [x] Extension documentation (`extension/README.md`, `extension/QUICKSTART.md`, `extension/TESTING.md`)

### Phase 2: Frontend Integration
- [x] Extension bridge (`frontend/src/lib/extensionBridge.ts`)
- [x] Frontend scaffold (package.json, vite.config.ts, tailwind.config.js)
- [x] Loading skeleton components (`frontend/src/components/LoadingSkeleton.tsx`)
- [x] Empty state components (`frontend/src/components/EmptyState.tsx`)
- [x] Placeholder pages (Home, Generating, Curriculum, Sandbox, Dashboard)

## 📋 Remaining Tasks

### Phase 1: Extension Setup

#### Task 1.1: Download and Encode OpenDyslexic Font
**Status:** ⏳ TODO  
**Priority:** HIGH  
**Estimated Time:** 10 minutes

**Steps:**
1. Visit https://opendyslexic.org/
2. Download OpenDyslexic font package
3. Extract `OpenDyslexic-Regular.otf`
4. Place in `extension/fonts/OpenDyslexic-Regular.otf`
5. Run encoding:
   ```bash
   cd extension
   node scripts/encode-font.js
   node scripts/inject-font.js
   ```

**Verification:**
- [ ] `extension/fonts/OpenDyslexic.b64` exists
- [ ] `extension/content_script.js` no longer has PLACEHOLDER text
- [ ] File size is reasonable (~50-100KB base64)

#### Task 1.2: Create Extension Icons
**Status:** ⏳ TODO  
**Priority:** MEDIUM  
**Estimated Time:** 20 minutes

**Options:**

**Option A: Use Online Generator (Fastest)**
1. Visit https://favicon.io/favicon-generator/
2. Settings:
   - Text: "A"
   - Background: #007bff (blue)
   - Font: Bold
   - Shape: Rounded
3. Download and extract
4. Rename to icon16.png, icon48.png, icon128.png
5. Copy to `extension/icons/`

**Option B: Design Custom Icon**
1. Use Figma/Canva/Adobe XD
2. Create 128x128px icon
3. Export at multiple sizes
4. Save to `extension/icons/`

**Verification:**
- [ ] `extension/icons/icon16.png` exists
- [ ] `extension/icons/icon48.png` exists
- [ ] `extension/icons/icon128.png` exists
- [ ] Icons are actual PNG files (not placeholders)

#### Task 1.3: Load Extension in Chrome
**Status:** ⏳ TODO  
**Priority:** HIGH  
**Estimated Time:** 5 minutes

**Steps:**
1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked"
5. Select `extension/` folder
6. Pin extension to toolbar

**Verification:**
- [ ] Extension appears in extensions list
- [ ] No errors shown
- [ ] Icon visible in toolbar (or puzzle menu)
- [ ] Popup opens when clicked

### Phase 2: Extension Testing

#### Task 2.1: Test Global Mode
**Status:** ⏳ TODO  
**Priority:** HIGH  
**Estimated Time:** 10 minutes

**Steps:**
1. Open extension popup
2. Toggle "Global Mode" ON
3. Visit https://en.wikipedia.org/wiki/Dyslexia
4. Verify font changes

**Verification:**
- [ ] OpenDyslexic font applied
- [ ] Text is left-aligned
- [ ] Line height increased
- [ ] Letter spacing wider
- [ ] No console errors

#### Task 2.2: Test Domain Registration
**Status:** ⏳ TODO  
**Priority:** HIGH  
**Estimated Time:** 10 minutes

**Steps:**
1. Turn OFF global mode
2. Click "Apply to Current Page" on Wikipedia
3. Reload page
4. Check popup shows Wikipedia in registered domains

**Verification:**
- [ ] Domain appears in list
- [ ] Styles apply after reload
- [ ] Can remove domain via × button
- [ ] Styles stop after removal

#### Task 2.3: Test Multiple Sites
**Status:** ⏳ TODO  
**Priority:** MEDIUM  
**Estimated Time:** 15 minutes

**Test Sites:**
- [ ] https://developer.mozilla.org/
- [ ] https://docs.aws.amazon.com/
- [ ] https://stackoverflow.com/
- [ ] https://github.com/

**For Each Site:**
1. Register domain
2. Verify styles apply
3. Check layout not broken
4. Test navigation still works

### Phase 3: Frontend Integration

#### Task 3.1: Test extensionBridge.ts
**Status:** ⏳ TODO  
**Priority:** HIGH  
**Estimated Time:** 15 minutes

**Steps:**
1. Start frontend: `cd frontend && npm run dev`
2. Open browser console
3. Test in console:
   ```javascript
   import { registerDomainForDyslexicMode, isExtensionAvailable } from './src/lib/extensionBridge'
   
   console.log('Extension available:', isExtensionAvailable())
   registerDomainForDyslexicMode('https://wikipedia.org')
   ```
4. Check extension popup for registered domain

**Verification:**
- [ ] `isExtensionAvailable()` returns true
- [ ] Domain registered successfully
- [ ] No console errors
- [ ] Works when extension not installed (fails silently)

#### Task 3.2: Integrate with LessonCard Component
**Status:** ⏳ TODO  
**Priority:** HIGH  
**Estimated Time:** 20 minutes  
**Depends On:** Member 3's LessonCard.tsx

**Steps:**
1. Wait for Member 3 to create `LessonCard.tsx`
2. Add import:
   ```typescript
   import { registerDomainForDyslexicMode } from '@/lib/extensionBridge'
   ```
3. Wrap citation link click handler:
   ```typescript
   const handleCitationClick = (url: string) => {
     registerDomainForDyslexicMode(url)
     window.open(url, '_blank')
   }
   ```

**Verification:**
- [ ] Citation links call bridge before opening
- [ ] Domains registered automatically
- [ ] Extension activates on external sites
- [ ] Works without extension installed

### Phase 4: UI Polish

#### Task 4.1: Add Favicon
**Status:** ⏳ TODO  
**Priority:** LOW  
**Estimated Time:** 10 minutes

**Steps:**
1. Create or download favicon.svg
2. Place in `frontend/public/favicon.svg`
3. Update `frontend/index.html` if needed

**Verification:**
- [ ] Favicon shows in browser tab
- [ ] Favicon shows in bookmarks

#### Task 4.2: Update Page Titles
**Status:** ⏳ TODO  
**Priority:** LOW  
**Estimated Time:** 10 minutes

**Steps:**
1. Add to each page component:
   ```typescript
   useEffect(() => {
     document.title = 'Page Name - AdaptEd'
   }, [])
   ```

**Pages to Update:**
- [ ] Home: "AdaptEd - Personalized Learning"
- [ ] Generating: "Generating Curriculum - AdaptEd"
- [ ] Curriculum: "[Topic] - AdaptEd"
- [ ] Sandbox: "Practice - AdaptEd"
- [ ] Dashboard: "My Progress - AdaptEd"

#### Task 4.3: Test Loading Skeletons
**Status:** ⏳ TODO  
**Priority:** MEDIUM  
**Estimated Time:** 15 minutes

**Steps:**
1. Import skeletons in pages
2. Show while loading data
3. Replace with real content when loaded

**Verification:**
- [ ] Skeletons show during SSE streaming
- [ ] Smooth transition to real content
- [ ] No layout shift
- [ ] Animations smooth

#### Task 4.4: Test Empty States
**Status:** ⏳ TODO  
**Priority:** MEDIUM  
**Estimated Time:** 10 minutes

**Verification:**
- [ ] Dashboard shows empty state when no curriculums
- [ ] Sandbox shows empty state initially
- [ ] "Start Learning" button works
- [ ] Icons render correctly

### Phase 5: Pre-caching Demo Topics

#### Task 5.1: Generate 5 Demo Topics
**Status:** ⏳ TODO  
**Priority:** HIGH  
**Estimated Time:** 30 minutes  
**Depends On:** Member 1's backend fully working

**Topics to Cache:**
1. "Build a REST API with FastAPI"
2. "Learn how transformers work from scratch"
3. "Understand the DSM-5 criteria for ADHD"
4. "Master React hooks"
5. "Learn SQL joins and subqueries"

**Steps:**
1. Ensure backend is running
2. For each topic:
   - Submit via frontend
   - Wait for generation to complete
   - Verify in Supabase `lessons` table
   - Test cache hit (submit same topic again)

**Verification:**
- [ ] All 5 topics in Supabase
- [ ] Each has correct `goal_hash`
- [ ] Cache hits load in <500ms
- [ ] Content is complete and correct

#### Task 5.2: Verify Cache Performance
**Status:** ⏳ TODO  
**Priority:** MEDIUM  
**Estimated Time:** 15 minutes

**Steps:**
1. Open DevTools Network tab
2. Submit cached topic
3. Measure time to first content

**Verification:**
- [ ] Response time <500ms
- [ ] No external API calls
- [ ] Curriculum loads instantly
- [ ] "Cached" badge shows in UI

### Phase 6: Demo Preparation

#### Task 6.1: Write DEMO.md
**Status:** ⏳ TODO  
**Priority:** HIGH  
**Estimated Time:** 45 minutes

**Content to Include:**
- Demo flow (step-by-step)
- What to say at each step
- Which topics to use
- Fallback plan if live generation fails
- How to show extension activation
- How to demonstrate Socratic sandbox
- Talking points for judges

**Verification:**
- [ ] Clear step-by-step instructions
- [ ] Timing estimates for each step
- [ ] Backup plans documented
- [ ] Talking points for key features

#### Task 6.2: Create Demo Checklist
**Status:** ⏳ TODO  
**Priority:** MEDIUM  
**Estimated Time:** 15 minutes

**Pre-Demo Checklist:**
- [ ] Backend running
- [ ] Frontend running
- [ ] Extension loaded
- [ ] 5 topics cached
- [ ] Test run completed
- [ ] Browser tabs prepared
- [ ] Demo script reviewed

#### Task 6.3: Rehearse Demo
**Status:** ⏳ TODO  
**Priority:** HIGH  
**Estimated Time:** 60 minutes

**Steps:**
1. Run through entire demo flow
2. Time each section
3. Practice talking points
4. Test fallback scenarios
5. Record any issues

**Verification:**
- [ ] Demo completes in <10 minutes
- [ ] All features demonstrated
- [ ] Smooth transitions
- [ ] No errors encountered
- [ ] Confident delivery

## 🔗 Integration Points

### With Member 1 (Backend)
- **Need:** Backend running at http://localhost:8000
- **Need:** Supabase access to verify cached topics
- **Handoff:** Confirm 5 demo topics are cached

### With Member 2 (Sandbox)
- **No dependencies** - Extension works independently

### With Member 3 (Frontend)
- **Need:** `LessonCard.tsx` component to integrate citation links
- **Handoff:** Agree on `extensionBridge.ts` interface
- **Coordinate:** Where to add favicon and page titles

## 📊 Progress Tracking

### Overall Progress: 40%

- ✅ Extension Core: 100% (5/5 tasks)
- ⏳ Extension Setup: 0% (0/3 tasks)
- ⏳ Extension Testing: 0% (0/3 tasks)
- ⏳ Frontend Integration: 50% (1/2 tasks)
- ⏳ UI Polish: 0% (0/4 tasks)
- ⏳ Pre-caching: 0% (0/2 tasks)
- ⏳ Demo Prep: 0% (0/3 tasks)

### Next Actions (Priority Order)
1. ⚡ Download and encode OpenDyslexic font
2. ⚡ Load extension in Chrome
3. ⚡ Test global mode
4. ⚡ Create extension icons
5. 🔄 Wait for Member 3's LessonCard.tsx
6. 🔄 Wait for Member 1's backend completion
7. ⚡ Pre-cache 5 demo topics
8. ⚡ Write DEMO.md

## 🐛 Known Issues

None yet - track issues here as they arise.

## 📝 Notes

- Extension can be built completely independently
- Frontend integration requires coordination with Member 3
- Pre-caching requires Member 1's backend to be stable
- Demo script should be written last (after everything works)

## ✅ Sign-off Checklist

Before marking Member 4 tasks complete:

- [ ] Extension loads without errors
- [ ] OpenDyslexic font embedded and working
- [ ] Global mode works on all test sites
- [ ] Domain registration works
- [ ] Integration with frontend citation links works
- [ ] All UI polish tasks complete
- [ ] 5 demo topics cached and verified
- [ ] DEMO.md written and reviewed
- [ ] Full demo rehearsed successfully
- [ ] All tests in TESTING.md pass

---

**Last Updated:** 2026-04-08  
**Status:** In Progress  
**Completion:** 40%
