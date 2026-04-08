# Extension Icons

This directory contains the extension icons in various sizes.

## Required Sizes

- `icon16.png` - 16x16px (toolbar icon)
- `icon48.png` - 48x48px (extension management page)
- `icon128.png` - 128x128px (Chrome Web Store)

## Design Guidelines

### Concept
The icon should represent:
- Learning / Education (book, graduation cap, brain)
- Accessibility (universal access symbol)
- Typography / Text (letter 'A', font symbol)

### Suggested Design
A simple, recognizable icon with:
- Primary color: Blue (#007bff) - represents learning
- Accent: Green (#4CAF50) - represents accessibility
- Style: Flat, modern, minimal

### Example Concepts
1. **Letter 'A' with accessibility symbol**
2. **Book with dyslexic-friendly font preview**
3. **Brain with text lines**
4. **Graduation cap with 'A'**

## Creating Icons

### Option 1: Use Figma/Sketch/Adobe XD
1. Create a 128x128px artboard
2. Design your icon
3. Export at 1x, 0.375x, and 0.125x scales
4. Save as icon128.png, icon48.png, icon16.png

### Option 2: Use Online Tools
- Favicon.io: https://favicon.io/
- Canva: https://www.canva.com/
- Figma: https://www.figma.com/

### Option 3: Use SVG + ImageMagick
```bash
# If you have an SVG icon
convert icon.svg -resize 128x128 icon128.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 16x16 icon16.png
```

## Placeholder Icons

For development, you can use simple colored squares:

```bash
# Create placeholder icons (requires ImageMagick)
convert -size 128x128 xc:#007bff icon128.png
convert -size 48x48 xc:#007bff icon48.png
convert -size 16x16 xc:#007bff icon16.png
```

Or use this Node.js script:
```bash
node scripts/generate-placeholder-icons.js
```

## Testing Icons

1. Load extension in Chrome
2. Check toolbar - should show icon16.png
3. Go to chrome://extensions/ - should show icon48.png
4. Icon should be clear and recognizable at all sizes

## Best Practices

- Use PNG format with transparency
- Keep design simple (recognizable at 16px)
- Use consistent colors with AdaptEd brand
- Test on light and dark backgrounds
- Avoid text (hard to read at small sizes)
- Use high contrast for visibility
