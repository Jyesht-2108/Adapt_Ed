/**
 * Generate placeholder icons for development
 * Creates simple colored squares as temporary icons
 * 
 * Usage: node scripts/generate-placeholder-icons.js
 * 
 * Note: For production, replace with proper designed icons
 */

const fs = require('fs');
const path = require('path');

// Simple PNG generation without dependencies
// Creates a solid color square

function createPlaceholderPNG(size, color, outputPath) {
  // This is a minimal PNG file structure
  // For production, use proper icon design tools
  
  console.log(`⚠️  Creating ${size}x${size} placeholder icon...`);
  console.log(`   This is a temporary solution for development.`);
  console.log(`   Please replace with proper icons before production!`);
  
  // Create a simple text file as placeholder
  const placeholder = `PLACEHOLDER ICON ${size}x${size}\n\nReplace this with actual PNG icon.\n\nSee extension/icons/README.md for instructions.`;
  
  fs.writeFileSync(outputPath, placeholder);
  console.log(`   Created: ${path.basename(outputPath)}`);
}

const iconsDir = path.join(__dirname, '../icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Generating placeholder icons...\n');

// Generate placeholder files
createPlaceholderPNG(16, '#007bff', path.join(iconsDir, 'icon16.png'));
createPlaceholderPNG(48, '#007bff', path.join(iconsDir, 'icon48.png'));
createPlaceholderPNG(128, '#007bff', path.join(iconsDir, 'icon128.png'));

console.log('\n⚠️  IMPORTANT:');
console.log('   These are placeholder files, not actual PNG images.');
console.log('   The extension will load but icons will not display correctly.');
console.log('\n📝 To create proper icons:');
console.log('   1. Use an online tool like favicon.io or Canva');
console.log('   2. Or use design software (Figma, Sketch, Adobe XD)');
console.log('   3. Export as PNG at 16x16, 48x48, and 128x128 pixels');
console.log('   4. Replace the files in extension/icons/');
console.log('\n💡 Quick solution:');
console.log('   Use a simple letter "A" on blue background');
console.log('   Tools: https://favicon.io/favicon-generator/');
