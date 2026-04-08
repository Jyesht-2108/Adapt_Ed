/**
 * Script to embed OpenDyslexic font as base64
 * 
 * INSTRUCTIONS:
 * 1. Download OpenDyslexic-Regular.otf from https://opendyslexic.org/
 * 2. Place it in chrome-extension/fonts/OpenDyslexic-Regular.otf
 * 3. Run: node embed-font.js
 * 4. Copy the output and paste into contentScript.js
 */

const fs = require('fs');
const path = require('path');

const fontPath = path.join(__dirname, 'fonts', 'OpenDyslexic-Regular.otf');

if (!fs.existsSync(fontPath)) {
  console.error('❌ Font file not found!');
  console.log('\n📥 Please download OpenDyslexic-Regular.otf from:');
  console.log('   https://opendyslexic.org/');
  console.log('\n📁 Create folder: chrome-extension/fonts/');
  console.log('📁 Place file: chrome-extension/fonts/OpenDyslexic-Regular.otf');
  console.log('\n🔄 Then run: node embed-font.js');
  process.exit(1);
}

console.log('📖 Reading font file...');
const fontBuffer = fs.readFileSync(fontPath);
const base64Font = fontBuffer.toString('base64');

console.log('✅ Font encoded successfully!');
console.log(`📊 Size: ${(base64Font.length / 1024).toFixed(2)} KB\n`);

console.log('📋 Copy this CSS and add it to your contentScript.js:\n');
console.log('─'.repeat(80));
console.log(`
@font-face {
  font-family: 'OpenDyslexic';
  src: url('data:font/otf;base64,${base64Font}') format('opentype');
  font-weight: normal;
  font-style: normal;
}
`);
console.log('─'.repeat(80));

// Also save to a file for easy copying
const outputPath = path.join(__dirname, 'opendyslexic-base64.css');
fs.writeFileSync(outputPath, `
@font-face {
  font-family: 'OpenDyslexic';
  src: url('data:font/otf;base64,${base64Font}') format('opentype');
  font-weight: normal;
  font-style: normal;
}
`);

console.log(`\n💾 Also saved to: ${outputPath}`);
console.log('\n✨ Next step: Update contentScript.js injectDyslexiaStyles() function');
