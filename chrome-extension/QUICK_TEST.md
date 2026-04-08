# Quick Test Guide - Chrome Extension

## 🚀 5-Minute Test

Follow these steps to quickly test your extension:

---

## Step 1: Load Extension (1 minute)

```
1. Open Chrome
2. Go to: chrome://extensions/
3. Toggle ON "Developer mode" (top-right)
4. Click "Load unpacked"
5. Select folder: chrome-extension
6. ✅ Extension should appear in list
```

---

## Step 2: Test Toggle Button (2 minutes)

```
1. Visit: https://en.wikipedia.org/wiki/Dyslexia
2. Look for blue "Dyslexia Mode" button (top-right)
3. Click button
4. ✅ Font should change to OpenDyslexic
5. ✅ Word beginnings should be bold
6. ✅ Text should be larger and more spaced
7. Click button again
8. ✅ Text should restore to original
```

---

## Step 3: Test Popup (1 minute)

```
1. Click extension icon in Chrome toolbar
2. ✅ Popup should open
3. Toggle ON "Enable on All Sites"
4. Open new tab: https://www.google.com
5. ✅ Dyslexia mode should be active automatically
6. Go back to popup
7. Toggle OFF "Enable on All Sites"
8. Reload Google tab
9. ✅ Dyslexia mode should be disabled
```

---

## Step 4: Test Persistence (1 minute)

```
1. Visit any website
2. Click toggle button to enable
3. Reload page (F5)
4. ✅ Mode should still be active
5. Close Chrome completely
6. Reopen Chrome
7. Visit same website
8. ✅ Mode should still be active
```

---

## ✅ Success Checklist

If all these work, your extension is ready:

- [ ] Extension loads without errors
- [ ] Toggle button appears and works
- [ ] Font changes to OpenDyslexic
- [ ] Word beginnings are bold
- [ ] Popup opens and toggle works
- [ ] Global mode works on all sites
- [ ] Settings persist across reloads
- [ ] No console errors (F12)

---

## 🐛 If Something Doesn't Work

### Toggle button not appearing?
- Reload extension in chrome://extensions/
- Refresh the webpage (F5)
- Check console for errors (F12)

### Font not changing?
- Check if opendyslexic-base64.css exists
- Look for errors in console (F12)
- Try disabling and re-enabling

### Popup not opening?
- Check if popup.html exists
- Reload extension
- Try clicking icon again

### Global mode not working?
- Disable and re-enable in popup
- Reload all tabs
- Check extension permissions

---

## 🎯 Expected Behavior

### When Enabled:
- Font: OpenDyslexic (dyslexia-friendly)
- Bold: First 35% of each word
- Size: 115% of original
- Line height: 1.7 (more space between lines)
- Letter spacing: 0.05em (more space between letters)
- Word spacing: 0.16em (more space between words)

### When Disabled:
- Everything returns to original state
- No visual changes remain

---

## 📸 Visual Indicators

### Toggle Button:
- **Blue**: Dyslexia mode OFF
- **Green**: Dyslexia mode ON
- **Location**: Top-right of webpage

### Popup:
- **Toggle OFF**: Gray/white
- **Toggle ON**: Blue/green
- **Text**: "Enable on All Sites"

---

## 🔍 Debug Mode

To see what's happening:

```
1. Open any webpage
2. Press F12 (open DevTools)
3. Go to Console tab
4. Enable dyslexia mode
5. Look for messages:
   - "[Dyslexia Mode] Global mode: true/false"
   - Font loading messages
   - Any error messages
```

---

## ⏱️ Performance

The extension should:
- Load instantly (< 100ms)
- Apply changes smoothly (< 500ms)
- Not slow down page loading
- Not cause any lag or stuttering

If you experience slowness:
- Check console for errors
- Try on a simpler webpage
- Reload the extension

---

## 🎉 All Tests Passed?

Congratulations! Your extension is working perfectly.

**Next steps:**
1. Use it on your favorite websites
2. Share with team members
3. (Optional) Integrate with AdaptEd webapp
4. (Optional) Generate better icons using create-icons.html

---

**Happy Reading! 📚**
