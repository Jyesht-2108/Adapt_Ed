# Dyslexia Mode Extension - Complete Setup Guide

Follow these steps to get your extension fully working.

---

## 📋 Prerequisites

- Google Chrome browser
- Node.js installed (for font encoding)
- Text editor

---

## 🚀 Step-by-Step Setup

### Step 1: Download OpenDyslexic Font (5 minutes)

1. Visit https://opendyslexic.org/
2. Click "Download" button
3. Extract the ZIP file
4. Find `OpenDyslexic-Regular.otf`
5. Create folder: `chrome-extension/fonts/`
6. Copy `OpenDyslexic-Regular.otf` to `chrome-extension/fonts/`

**Verify:** You should have `chrome-extension/fonts/OpenDyslexic-Regular.otf`

---

### Step 2: Embed the Font (2 minutes)

```bash
cd chrome-extension
node embed-font.js
```

**What this does:**
- Reads the font file
- Converts it to base64
- Creates `opendyslexic-base64.css`

**Output:** You'll see CSS code printed to console

**Next:** Copy the `@font-face` CSS from `opendyslexic-base64.css`

---

### Step 3: Update contentScript.js (3 minutes)

1. Open `chrome-extension/contentScript.js`
2. Find the `injectDyslexiaStyles()` function (around line 100)
3. Add the `@font-face` CSS at the beginning of the `styleEl.textContent`

**Before:**
```javascript
styleEl.textContent = `
  body.dyslexia-mode-active * {
    font-family: "OpenDyslexic", Arial, Verdana, sans-serif !important;
    ...
```

**After:**
```javascript
styleEl.textContent = `
  @font-face {
    font-family: 'OpenDyslexic';
    src: url('data:font/otf;base64,YOUR_BASE64_HERE') format('opentype');
    font-weight: normal;
    font-style: normal;
  }
  
  body.dyslexia-mode-active * {
    font-family: "OpenDyslexic", Arial, Verdana, sans-serif !important;
    ...
```

**Verify:** The font-family reference now matches the embedded font

---

### Step 4: Generate Icons (2 minutes)

**Option A: Browser Method (Easiest)**

1. Open `chrome-extension/create-icons.html` in Chrome
2. Click "Generate Icons" button
3. Three PNG files will download
4. Create folder: `chrome-extension/icons/`
5. Save files as:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

**Option B: Node.js Method**

```bash
cd chrome-extension
npm install canvas
node generate-icons.js
```

**Verify:** You should have 3 icon files in `chrome-extension/icons/`

---

### Step 5: Load Extension in Chrome (2 minutes)

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right)
4. Click "Load unpacked"
5. Select the `chrome-extension` folder
6. Click "Select Folder"

**Verify:** Extension appears in the list with your icon

---

### Step 6: Test the Extension (5 minutes)

#### Test 1: Toggle Button
1. Visit any website (e.g., https://wikipedia.org)
2. Look for blue "Dyslexia Mode" button in top-right
3. Click to toggle ON
4. Text should change to OpenDyslexic font with bold beginnings
5. Click again to toggle OFF
6. Text should restore to original

**✅ Pass:** Toggle works, font changes, text restores

#### Test 2: Popup UI
1. Click extension icon in Chrome toolbar
2. Popup should open
3. Toggle "Enable on All Sites"
4. Visit a new website
5. Dyslexia mode should be active automatically

**✅ Pass:** Popup opens, global mode works

#### Test 3: Persistence
1. Enable dyslexia mode on a page
2. Reload the page
3. Mode should still be active

**✅ Pass:** State persists across reloads

---

## 🎯 Verification Checklist

Before considering setup complete:

- [ ] OpenDyslexic font downloaded and placed in `fonts/` folder
- [ ] Font encoded to base64 using `embed-font.js`
- [ ] `@font-face` CSS added to `contentScript.js`
- [ ] Three icon files created in `icons/` folder
- [ ] Extension loaded in Chrome without errors
- [ ] Toggle button appears on websites
- [ ] Clicking toggle changes font and formatting
- [ ] Text restores correctly when toggled off
- [ ] Popup UI opens and works
- [ ] Global mode activates on all sites
- [ ] State persists across page reloads

---

## 🐛 Troubleshooting

### Font not changing

**Problem:** Text doesn't change to OpenDyslexic when toggled

**Solutions:**
1. Check if `@font-face` CSS is in `contentScript.js`
2. Verify base64 string is complete (no truncation)
3. Open DevTools → Console, look for errors
4. Reload extension: chrome://extensions/ → click refresh icon

### Toggle button not appearing

**Problem:** No button visible on webpage

**Solutions:**
1. Check if extension is enabled in chrome://extensions/
2. Reload the webpage
3. Check browser console for errors
4. Verify `contentScript.js` has no syntax errors

### Icons not showing

**Problem:** Extension has no icon in toolbar

**Solutions:**
1. Verify icon files exist in `icons/` folder
2. Check file names match manifest.json
3. Reload extension in chrome://extensions/
4. Icons must be PNG format

### Popup not opening

**Problem:** Clicking extension icon does nothing

**Solutions:**
1. Check `popup.html` exists
2. Verify manifest.json has `action.default_popup`
3. Open chrome://extensions/ → click "Errors" if any
4. Check popup.js for syntax errors

### Global mode not working

**Problem:** "Enable on All Sites" doesn't activate mode

**Solutions:**
1. Check `tabs` permission in manifest.json
2. Verify popup.js message listener is working
3. Check contentScript.js has `chrome.runtime.onMessage` listener
4. Reload extension and try again

---

## 📁 Final File Structure

```
chrome-extension/
├── fonts/
│   ├── README.md
│   ├── OpenDyslexic-Regular.otf     ✅ Downloaded
│   └── opendyslexic-base64.css      ✅ Generated
├── icons/
│   ├── README.md
│   ├── icon16.png                   ✅ Generated
│   ├── icon48.png                   ✅ Generated
│   └── icon128.png                  ✅ Generated
├── manifest.json                     ✅ Updated
├── contentScript.js                  ✅ Updated with @font-face
├── popup.html                        ✅ Created
├── popup.css                         ✅ Created
├── popup.js                          ✅ Created
├── bridge.js                         ✅ Created (optional)
├── embed-font.js                     ✅ Created
├── generate-icons.js                 ✅ Created
├── create-icons.html                 ✅ Exists
├── README.md                         ✅ Exists
└── SETUP_GUIDE.md                    ✅ This file
```

---

## 🎉 Success!

If all tests pass, your extension is ready to use!

### Next Steps

1. **Use it:** Visit any website and toggle dyslexia mode
2. **Share it:** Send the folder to team members
3. **Integrate:** Use `bridge.js` to integrate with AdaptEd webapp
4. **Publish:** (Optional) Submit to Chrome Web Store

---

## 🔗 Integration with AdaptEd (Optional)

To enable automatic activation from AdaptEd webapp:

1. Copy `bridge.js` to your frontend project
2. Import in your citation link component:
   ```javascript
   import { enableDyslexiaMode, isDyslexiaModeAvailable } from './bridge.js'
   
   function handleCitationClick(url) {
     if (isDyslexiaModeAvailable()) {
       enableDyslexiaMode()
     }
     window.open(url, '_blank')
   }
   ```

---

## 📞 Need Help?

- Check `README.md` for feature documentation
- Review `fonts/README.md` for font setup
- Review `icons/README.md` for icon generation
- Open browser DevTools console for error messages

---

**Setup Time:** ~20 minutes  
**Difficulty:** Easy  
**Last Updated:** 2026-04-08
