# Extension Icons

## Quick Generation (Browser Method)

1. Open `chrome-extension/create-icons.html` in Chrome
2. Click "Generate Icons" button
3. Three PNG files will download automatically
4. Save them to this folder as:
   - `icon16.png`
   - `icon48.png`
   - `icon128.png`

## Alternative: Node.js Method

```bash
cd chrome-extension
npm install canvas
node generate-icons.js
```

## Icon Sizes

- **icon16.png** - 16x16px - Toolbar icon
- **icon48.png** - 48x48px - Extension management page
- **icon128.png** - 128x128px - Chrome Web Store

## Design

- Background: Blue gradient (#4A90E2 to #357ABD)
- Letter: White "D" (for Dyslexia)
- Font: Bold Arial

## File Structure

```
chrome-extension/icons/
├── README.md       # This file
├── icon16.png      # Generate this
├── icon48.png      # Generate this
└── icon128.png     # Generate this
```
