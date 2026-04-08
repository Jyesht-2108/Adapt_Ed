# AdaptEd Extension - Quick Start Guide

Get the extension running in 5 minutes.

## Prerequisites

- Google Chrome (or Chromium-based browser)
- Node.js installed (for font encoding)
- AdaptEd project cloned

## Step 1: Download OpenDyslexic Font

1. Visit https://opendyslexic.org/
2. Click "Download" button
3. Extract the ZIP file
4. Find `OpenDyslexic-Regular.otf`
5. Copy it to `extension/fonts/OpenDyslexic-Regular.otf`

## Step 2: Encode the Font

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

## Step 3: Create Icons (Optional for Development)

For quick testing, you can skip this. The extension will load but won't show icons.

For proper icons:
1. Visit https://favicon.io/favicon-generator/
2. Create a simple icon (e.g., letter "A" on blue background)
3. Download and extract
4. Rename files to icon16.png, icon48.png, icon128.png
5. Copy to `extension/icons/`

## Step 4: Load Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Navigate to and select the `extension/` folder
6. Click "Select Folder"

You should see:
```
AdaptEd Dyslexic Mode
Version 1.0.0
ID: [random-extension-id]
```

## Step 5: Test the Extension

### Quick Test (Standalone)

1. Click the extension icon in Chrome toolbar
   - If you don't see it, click the puzzle piece icon and pin it
2. Toggle "Global Mode" ON
3. Visit https://en.wikipedia.org/wiki/Dyslexia
4. You should see:
   - OpenDyslexic font applied
   - Wider letter spacing
   - Increased line height
   - Left-aligned text

### Full Test (With AdaptEd)

1. Start AdaptEd backend:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. Start AdaptEd frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open http://localhost:5173
4. Generate a curriculum (e.g., "Learn Python basics")
5. Click any citation link
6. The external site should have dyslexic mode applied automatically

## Troubleshooting

### Extension won't load
- Check all files exist (manifest.json, background.js, content_script.js)
- Look for errors in chrome://extensions/
- Verify manifest.json is valid JSON

### Font not applying
- Check content_script.js doesn't have PLACEHOLDER text
- Run the font encoding scripts again
- Check browser console for errors (F12)

### Icons not showing
- This is OK for development
- Extension still works without icons
- Follow Step 3 to add proper icons

### "Cannot read property 'session' of undefined"
- Extension is trying to use chrome.storage but it's not available
- This is expected when testing outside Chrome
- The code fails silently by design

## Next Steps

- Read [README.md](README.md) for detailed documentation
- Read [TESTING.md](TESTING.md) for comprehensive testing guide
- Customize popup UI in `popup/popup.html` and `popup/popup.css`
- Add your own icon designs

## Development Workflow

When making changes:

1. Edit files in `extension/`
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Reload any open tabs to see changes

## Common Commands

```bash
# Encode font
node scripts/encode-font.js

# Inject font into content script
node scripts/inject-font.js

# Generate placeholder icons (development only)
node scripts/generate-placeholder-icons.js
```

## Getting Help

- Check console for `[AdaptEd]` log messages
- Open extension popup to see registered domains
- Check chrome://extensions/ for error messages
- Review TESTING.md for specific test scenarios

## Production Checklist

Before deploying:
- [ ] Real OpenDyslexic font embedded (not placeholder)
- [ ] Proper icons created (16px, 48px, 128px)
- [ ] All tests in TESTING.md pass
- [ ] No console errors
- [ ] Works with AdaptEd webapp integration
- [ ] Tested on multiple websites

## Quick Reference

**Extension Popup:**
- Toggle global mode
- View registered domains
- Remove specific domains
- Apply to current page

**Storage Keys:**
- `adaptedDomains`: Array of registered hostnames
- `globalMode`: Boolean for global activation

**Console Commands:**
```javascript
// Check registered domains
chrome.storage.session.get(['adaptedDomains'], console.log)

// Check global mode
chrome.storage.session.get(['globalMode'], console.log)

// Clear all
chrome.storage.session.clear()
```

---

**Time to complete:** ~5 minutes  
**Difficulty:** Easy  
**Prerequisites:** Basic command line knowledge
