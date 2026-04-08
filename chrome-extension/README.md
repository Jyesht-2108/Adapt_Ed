# Dyslexia Mode Chrome Extension

A Chrome extension that adds a dyslexia-friendly reading mode to any webpage without modifying the original frontend code.

## Features

- **Toggle Button**: Fixed at top-right corner of any webpage
- **Dyslexia-Friendly Formatting**:
  - OpenDyslexic font family
  - Increased font size (+15%)
  - Enhanced line height (1.7)
  - Improved letter spacing (0.05em)
  - Better word spacing (0.16em)
  - Bold first 35% of each word for easier reading
- **Persistent State**: Toggle state saved using chrome.storage
- **Full Restoration**: Original text perfectly restored when toggled off
- **Performance Optimized**: Safe DOM traversal, ignores scripts/styles/inputs

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. The extension is now active on all webpages

## Usage

1. Visit any webpage
2. Look for the "Dyslexia Mode" button in the top-right corner
3. Click to toggle dyslexia-friendly formatting ON/OFF
4. State persists across page reloads

## Technical Details

- **Manifest Version**: 3
- **Permissions**: storage, activeTab
- **Content Script**: Runs on all URLs at document_idle
- **DOM Traversal**: Uses TreeWalker for safe text node processing
- **State Management**: WeakMap for original text storage
- **Idempotent**: Safe to toggle multiple times

## Files

- `manifest.json` - Extension configuration
- `contentScript.js` - Main logic for text transformation and UI
- `README.md` - This file

## Notes

- Does NOT modify your frontend codebase
- Works on any website
- Ignores form inputs, code blocks, and scripts
- Handles dynamic content (SPAs)
- No external dependencies

## Optional: Add Icons

Create simple icon files (icon16.png, icon48.png, icon128.png) or remove the icons section from manifest.json if not needed.
