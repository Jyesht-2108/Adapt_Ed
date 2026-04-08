# 🚀 START HERE - Quick Setup

**Your extension is 90% complete!** Just need 3 quick steps.

---

## ⚡ Quick Start (20 minutes)

### Step 1: Download Font (5 min)
1. Go to https://opendyslexic.org/
2. Download the font
3. Extract and find `OpenDyslexic-Regular.otf`
4. Create folder: `chrome-extension/fonts/`
5. Copy font file there

### Step 2: Embed Font (2 min)
```bash
cd chrome-extension
node embed-font.js
```
Then copy the `@font-face` CSS into `contentScript.js` (instructions will be shown)

### Step 3: Generate Icons (5 min)
Open `create-icons.html` in Chrome → Click "Generate Icons" → Save to `icons/` folder

### Step 4: Load Extension (2 min)
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `chrome-extension` folder

### Step 5: Test (5 min)
Visit any website → Click blue "Dyslexia Mode" button → Verify it works!

---

## 📚 Documentation

- **Quick Setup:** `CHECKLIST.md` (1 page)
- **Detailed Guide:** `SETUP_GUIDE.md` (complete instructions)
- **Implementation Plan:** `IMPLEMENTATION_PLAN.md` (technical details)
- **Features:** `README.md` (what it does)

---

## ✅ What's Already Done

- ✅ Toggle button UI
- ✅ Dyslexia formatting logic
- ✅ Bold word beginnings
- ✅ State persistence
- ✅ Popup UI
- ✅ Global mode
- ✅ All scripts and docs

## ⏳ What You Need to Do

- [ ] Download font (5 min)
- [ ] Run embed script (2 min)
- [ ] Generate icons (5 min)
- [ ] Load in Chrome (2 min)
- [ ] Test (5 min)

**Total:** ~20 minutes

---

## 🎯 Quick Test

After setup:
1. Visit https://wikipedia.org
2. Click blue button (top-right)
3. Text should change to OpenDyslexic
4. Word beginnings should be bold
5. Click again to restore

**Works?** ✅ You're done!  
**Issues?** See `SETUP_GUIDE.md` troubleshooting

---

## 📞 Help

- **Setup issues:** See `SETUP_GUIDE.md`
- **Quick reference:** See `CHECKLIST.md`
- **Technical details:** See `IMPLEMENTATION_PLAN.md`

---

**Ready?** Start with Step 1 above! 🚀
