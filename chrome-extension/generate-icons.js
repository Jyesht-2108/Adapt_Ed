/**
 * Generate extension icons using Node.js Canvas
 * 
 * INSTRUCTIONS:
 * 1. Install canvas: npm install canvas
 * 2. Run: node generate-icons.js
 * 3. Icons will be created in chrome-extension/icons/
 */

const fs = require('fs');
const path = require('path');

// Check if canvas is available
let Canvas;
try {
  Canvas = require('canvas');
} catch (e) {
  console.error('❌ Canvas module not found!');
  console.log('\n📦 Install it with: npm install canvas');
  console.log('\n💡 Alternative: Use the create-icons.html file in your browser');
  console.log('   1. Open chrome-extension/create-icons.html in Chrome');
  console.log('   2. Click "Generate Icons"');
  console.log('   3. Save the downloaded files to chrome-extension/icons/');
  process.exit(1);
}

const { createCanvas } = Canvas;

// Create icons directory
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background - Blue gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#4A90E2');
  gradient.addColorStop(1, '#357ABD');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Letter "D" for Dyslexia
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('D', size / 2, size / 2);

  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const filepath = path.join(iconsDir, filename);
  fs.writeFileSync(filepath, buffer);
  
  console.log(`✅ Created: ${filename} (${size}x${size})`);
}

console.log('🎨 Generating extension icons...\n');

generateIcon(16, 'icon16.png');
generateIcon(48, 'icon48.png');
generateIcon(128, 'icon128.png');

console.log('\n✨ All icons generated successfully!');
console.log(`📁 Location: ${iconsDir}`);
console.log('\n📝 Next step: Update manifest.json to reference these icons');
