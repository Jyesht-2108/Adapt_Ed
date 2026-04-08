# AdaptEd Dyslexic Mode - Chrome Extension

Chrome extension that applies dyslexia-friendly typography to websites visited from the AdaptEd learning platform.

## Features

- **Automatic Activation**: Applies OpenDyslexic font when you click citation links from AdaptEd
- **Global Mode**: Toggle to apply dyslexic mode to all websites
- **Domain Management**: View and manage registered domains
- **Session-based**: Domains are stored per browser session

## Installation

### Development Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension/` folder from this project

### Production Build

(Instructions for Chrome Web Store submission will be added later)

## Setup Instructions

### 1. Add OpenDyslexic Font

The extension requires the OpenDyslexic font to be embedded as base64.

**Steps:**

1. Download OpenDyslexic font from: https://opendyslexic.org/
2. Use the Regular variant (OpenDyslexic-Regular.otf)
3. Convert to base64:
   ```bash
   # On Linux/Mac
   base64 OpenDyslexic-Regular.otf > font.b64
   
   # On Windows (PowerShell)
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("OpenDyslexic-Regular.otf")) > font.b64
   ```
4. Copy the base64 string
5. Open `content_script.js`
6. Replace `PLACEHOLDER_BASE64_FONT_DATA` with your base64 string

### 2. Add Extension Icons

Create icons in the `extension/icons/` folder:
- `icon16.png` (16x16px)
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

You can use any icon design tool or generate them from a single SVG.

## How It Works

### Architecture

```
User clicks citation in AdaptEd webapp
    ↓
extensionBridge.ts calls chrome.storage.session.set()
    ↓
Domain added to adaptedDomains array
    ↓
User navigates to external site
    ↓
content_script.js checks chrome.storage.session
    ↓
If domain matches → inject OpenDyslexic styles
```

### Files

- **manifest.json**: Extension configuration and permissions
- **background.js**: Service worker for navigation events
- **content_script.js**: Injected into all pages, applies styles conditionally
- **popup/**: Extension popup UI for manual control

### Storage Schema

```javascript
chrome.storage.session = {
  adaptedDomains: string[],  // Array of hostnames
  globalMode: boolean        // Apply to all sites
}
```

## Testing

### Manual Testing

1. Load the extension in Chrome
2. Open the extension popup
3. Enable "Global Mode"
4. Visit any website (e.g., Wikipedia)
5. Verify OpenDyslexic font is applied

### Integration Testing with AdaptEd

1. Start the AdaptEd frontend (`npm run dev` in `frontend/`)
2. Generate a curriculum with external sources
3. Click a citation link
4. Verify the domain is registered (check popup)
5. Verify styles are applied on the external site

### Test Sites

- Wikipedia: https://en.wikipedia.org/
- MDN Web Docs: https://developer.mozilla.org/
- AWS Documentation: https://docs.aws.amazon.com/
- APA PsycNet: https://psycnet.apa.org/

## Permissions Explained

- **storage**: Store registered domains and settings
- **webNavigation**: Detect when user navigates to new pages
- **activeTab**: Access current tab for "Apply to Current Page" feature
- **scripting**: Inject content scripts dynamically
- **host_permissions: ["<all_urls>"]**: Apply styles to any website

## Troubleshooting

### Styles not applying

1. Check if domain is registered: Open popup → check "Registered Domains"
2. Check console: Open DevTools → look for `[AdaptEd]` logs
3. Verify font is embedded: Check `content_script.js` for base64 data
4. Reload the page after registering domain

### Extension not loading

1. Check `chrome://extensions/` for errors
2. Verify all files exist (manifest.json, background.js, content_script.js, popup/)
3. Check manifest.json syntax (must be valid JSON)

### Global mode not working

1. Open popup and verify toggle is ON
2. Reload the page after enabling
3. Check chrome.storage.session in DevTools:
   ```javascript
   chrome.storage.session.get(['globalMode'], console.log)
   ```

## Development

### File Structure

```
extension/
├── manifest.json           # Extension config
├── background.js           # Service worker
├── content_script.js       # Style injection logic
├── popup/
│   ├── popup.html         # Popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

### Making Changes

1. Edit files in `extension/`
2. Go to `chrome://extensions/`
3. Click the refresh icon on the AdaptEd extension card
4. Reload any open tabs to see changes

## License

Part of the AdaptEd project. See main project LICENSE.

## Credits

- OpenDyslexic font: https://opendyslexic.org/
- Created for AdaptEd hackathon project
