# Setup Checklist

Quick reference for setting up the Dyslexia Mode extension.

---

## ✅ Setup Tasks

### 1. Font Setup
- [ ] Download OpenDyslexic from https://opendyslexic.org/
- [ ] Place `OpenDyslexic-Regular.otf` in `fonts/` folder
- [ ] Run `node embed-font.js`
- [ ] Copy `@font-face` CSS from `opendyslexic-base64.css`
- [ ] Paste into `contentScript.js` in `injectDyslexiaStyles()` function

### 2. Icons
- [ ] Open `create-icons.html` in Chrome OR run `node generate-icons.js`
- [ ] Save/generate 3 icon files in `icons/` folder:
  - [ ] icon16.png
  - [ ] icon48.png
  - [ ] icon128.png

### 3. Load Extension
- [ ] Open `chrome://extensions/`
- [ ] Enable "Developer mode"
- [ ] Click "Load unpacked"
- [ ] Select `chrome-extension` folder

### 4. Testing
- [ ] Toggle button appears on websites
- [ ] Clicking toggle changes font
- [ ] Text restores when toggled off
- [ ] Popup opens from toolbar icon
- [ ] Global mode works
- [ ] State persists across reloads

---

## 🎯 Quick Test

1. Visit https://wikipedia.org
2. Click blue "Dyslexia Mode" button
3. Verify font changes to OpenDyslexic
4. Verify word beginnings are bold
5. Click button again
6. Verify text restores to original

**Pass:** ✅ All changes work correctly  
**Fail:** ❌ Review SETUP_GUIDE.md troubleshooting

---

## 📋 File Verification

Check these files exist:

```
chrome-extension/
├── fonts/
│   └── OpenDyslexic-Regular.otf     ← Downloaded
├── icons/
│   ├── icon16.png                   ← Generated
│   ├── icon48.png                   ← Generated
│   └── icon128.png                  ← Generated
├── manifest.json                     ← Updated
├── contentScript.js                  ← Updated with @font-face
├── popup.html                        ← Created
├── popup.css                         ← Created
└── popup.js                          ← Created
```

---

## 🚀 Ready to Use

Once all checkboxes are ticked, your extension is ready!

**Time Required:** ~20 minutes  
**Next:** See SETUP_GUIDE.md for detailed instructions
