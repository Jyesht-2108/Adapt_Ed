# AdaptEd Extension Testing Guide

Comprehensive testing checklist for the Chrome extension.

## Pre-Testing Setup

### 1. Install Extension
```bash
# Navigate to Chrome
chrome://extensions/

# Enable Developer Mode (toggle top-right)
# Click "Load unpacked"
# Select: /path/to/adapted/extension/
```

### 2. Verify Installation
- [ ] Extension appears in extensions list
- [ ] No errors in extension card
- [ ] Icon appears in Chrome toolbar (may be hidden in puzzle piece menu)

## Phase 1: Extension Core Testing

### Test 1.1: Manual Domain Registration

**Steps:**
1. Open extension popup (click icon in toolbar)
2. Click "Apply to Current Page" while on Wikipedia
3. Reload the page

**Expected:**
- [ ] Domain appears in "Registered Domains" list
- [ ] Page reloads automatically
- [ ] OpenDyslexic font is applied
- [ ] Text alignment is left (not justified)
- [ ] Line height is increased (1.8)
- [ ] Letter spacing is wider (0.12em)

**Test Sites:**
- [ ] https://en.wikipedia.org/wiki/Dyslexia
- [ ] https://developer.mozilla.org/
- [ ] https://docs.aws.amazon.com/

### Test 1.2: Global Mode

**Steps:**
1. Open extension popup
2. Toggle "Global Mode" ON
3. Visit any website

**Expected:**
- [ ] Styles apply to ALL websites
- [ ] Toggle state persists in popup
- [ ] Works on previously unregistered domains

**Test Sites:**
- [ ] https://news.ycombinator.com/
- [ ] https://github.com/
- [ ] https://stackoverflow.com/

### Test 1.3: Domain Removal

**Steps:**
1. Register 3 different domains
2. Open popup
3. Click × button next to one domain
4. Visit that domain

**Expected:**
- [ ] Domain removed from list
- [ ] Styles no longer apply to that domain
- [ ] Other domains still work

### Test 1.4: Clear All Domains

**Steps:**
1. Register multiple domains
2. Click "Clear All Domains"
3. Visit previously registered domains

**Expected:**
- [ ] All domains removed from list
- [ ] Styles no longer apply
- [ ] Global mode still works if enabled

## Phase 2: Integration Testing with AdaptEd

### Test 2.1: Citation Link Registration

**Prerequisites:**
- AdaptEd frontend running at http://localhost:5173
- Backend running at http://localhost:8000
- Extension installed

**Steps:**
1. Open AdaptEd webapp
2. Generate a curriculum (e.g., "Learn FastAPI")
3. Wait for curriculum to load
4. Click a citation link (external source)

**Expected:**
- [ ] New tab opens with external site
- [ ] Domain is automatically registered (check popup)
- [ ] Dyslexic mode styles are applied
- [ ] No console errors in either tab

**Debug:**
```javascript
// In AdaptEd webapp console:
chrome.storage.session.get(['adaptedDomains'], console.log)

// Should show array with the clicked domain
```

### Test 2.2: Multiple Citation Clicks

**Steps:**
1. Click 5 different citation links from curriculum
2. Check extension popup

**Expected:**
- [ ] All 5 domains registered
- [ ] No duplicates in list
- [ ] Each domain's styles work

### Test 2.3: Extension Not Installed

**Steps:**
1. Disable/remove extension
2. Click citation link in AdaptEd

**Expected:**
- [ ] Link still opens normally
- [ ] No console errors
- [ ] No broken functionality
- [ ] App works without extension

## Phase 3: Edge Cases & Error Handling

### Test 3.1: Invalid URLs

**Steps:**
1. Try to register: `javascript:alert('test')`
2. Try to register: `chrome://extensions/`
3. Try to register: `file:///C:/test.html`

**Expected:**
- [ ] Extension handles gracefully
- [ ] No crashes
- [ ] Invalid URLs ignored

### Test 3.2: Session Persistence

**Steps:**
1. Register 3 domains
2. Close Chrome completely
3. Reopen Chrome
4. Check extension popup

**Expected:**
- [ ] Domains are cleared (session storage)
- [ ] Global mode is reset to OFF
- [ ] Extension still works

### Test 3.3: Multiple Windows

**Steps:**
1. Register domain in Window 1
2. Open Window 2
3. Visit same domain in Window 2

**Expected:**
- [ ] Styles apply in both windows
- [ ] Session storage shared across windows

### Test 3.4: Incognito Mode

**Steps:**
1. Open incognito window
2. Try to use extension

**Expected:**
- [ ] Extension works (if allowed in incognito)
- [ ] Or gracefully disabled (if not allowed)
- [ ] No errors

## Phase 4: Performance Testing

### Test 4.1: Load Time

**Steps:**
1. Register domain
2. Open DevTools → Network tab
3. Visit registered domain
4. Check "Disable cache"
5. Reload page

**Expected:**
- [ ] Styles apply in <200ms after page load
- [ ] No external font requests
- [ ] No CORS errors
- [ ] Page load not significantly slower

### Test 4.2: Large Pages

**Test Sites:**
- [ ] https://en.wikipedia.org/wiki/List_of_lists_of_lists
- [ ] https://developer.mozilla.org/en-US/docs/Web/JavaScript

**Expected:**
- [ ] Styles apply to entire page
- [ ] No performance degradation
- [ ] No browser lag

### Test 4.3: Dynamic Content

**Test Sites:**
- [ ] https://twitter.com/ (infinite scroll)
- [ ] https://reddit.com/ (dynamic loading)

**Expected:**
- [ ] Styles apply to dynamically loaded content
- [ ] MutationObserver catches new elements

## Phase 5: Browser Compatibility

### Test 5.1: Chrome Versions

Test on:
- [ ] Chrome Stable (latest)
- [ ] Chrome Beta
- [ ] Chromium

### Test 5.2: Chromium-based Browsers

Test on:
- [ ] Microsoft Edge
- [ ] Brave
- [ ] Opera

**Expected:**
- [ ] Extension loads without modification
- [ ] All features work identically

## Phase 6: Visual Regression Testing

### Test 6.1: Font Application

**Check on various sites:**
- [ ] Headings use OpenDyslexic
- [ ] Body text uses OpenDyslexic
- [ ] Code blocks use OpenDyslexic (monospace variant)
- [ ] Buttons/UI elements use OpenDyslexic

### Test 6.2: Layout Preservation

**Expected:**
- [ ] Page layout not broken
- [ ] Images still display
- [ ] Navigation still works
- [ ] Forms still functional

### Test 6.3: Specific Elements

Check these elements render correctly:
- [ ] Tables
- [ ] Lists (ordered/unordered)
- [ ] Blockquotes
- [ ] Code blocks
- [ ] Forms and inputs
- [ ] Buttons and links

## Phase 7: Security Testing

### Test 7.1: XSS Prevention

**Steps:**
1. Try to inject script via domain name
2. Try to inject HTML in popup

**Expected:**
- [ ] No script execution
- [ ] HTML escaped properly

### Test 7.2: Permissions Audit

**Check:**
- [ ] Only necessary permissions requested
- [ ] No sensitive data accessed
- [ ] No data sent to external servers

## Automated Testing (Future)

```javascript
// Example Puppeteer test
const puppeteer = require('puppeteer');

async function testExtension() {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=/path/to/extension`,
      `--load-extension=/path/to/extension`
    ]
  });
  
  const page = await browser.newPage();
  await page.goto('https://wikipedia.org');
  
  // Check if styles applied
  const fontFamily = await page.evaluate(() => {
    return window.getComputedStyle(document.body).fontFamily;
  });
  
  console.assert(fontFamily.includes('OpenDyslexic'));
  
  await browser.close();
}
```

## Bug Report Template

When filing bugs, include:

```
**Environment:**
- Chrome Version: 
- OS: 
- Extension Version: 1.0.0

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**


**Actual Behavior:**


**Screenshots:**


**Console Errors:**


**Additional Context:**

```

## Test Results Checklist

Before marking Phase 1 complete:
- [ ] All Phase 1 tests pass
- [ ] All Phase 2 tests pass
- [ ] All Phase 3 tests pass
- [ ] Performance acceptable (Phase 4)
- [ ] Works on Chrome/Edge (Phase 5)
- [ ] No visual regressions (Phase 6)
- [ ] No security issues (Phase 7)

## Sign-off

Tested by: _______________  
Date: _______________  
Version: 1.0.0  
Status: ☐ Pass ☐ Fail ☐ Needs Work
