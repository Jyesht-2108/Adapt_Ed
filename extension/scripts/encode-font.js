/**
 * Script to encode OpenDyslexic font to base64
 * 
 * Usage:
 *   1. Download OpenDyslexic-Regular.otf to extension/fonts/
 *   2. Run: node scripts/encode-font.js
 *   3. Copy output and replace PLACEHOLDER_BASE64_FONT_DATA in content_script.js
 */

const fs = require('fs');
const path = require('path');

const fontPath = path.join(__dirname, '../fonts/OpenDyslexic-Regular.otf');
const outputPath = path.join(__dirname, '../fonts/OpenDyslexic.b64');

try {
  // Check if font file exists
  if (!fs.existsSync(fontPath)) {
    console.error('❌ Font file not found:', fontPath);
    console.log('\n📥 Please download OpenDyslexic-Regular.otf from:');
    console.log('   https://opendyslexic.org/');
    console.log('\n📁 Place it in: extension/fonts/OpenDyslexic-Regular.otf');
    process.exit(1);
  }

  // Read font file
  const fontBuffer = fs.readFileSync(fontPath);
  
  // Convert to base64
  const base64Font = fontBuffer.toString('base64');
  
  // Write to output file
  fs.writeFileSync(outputPath, base64Font);
  
  console.log('✅ Font encoded successfully!');
  console.log(`📄 Output saved to: ${outputPath}`);
  console.log(`📊 Size: ${(base64Font.length / 1024).toFixed(2)} KB`);
  console.log('\n📋 Next steps:');
  console.log('   1. Open extension/content_script.js');
  console.log('   2. Replace PLACEHOLDER_BASE64_FONT_DATA with the content of OpenDyslexic.b64');
  console.log('   3. Or run: node scripts/inject-font.js (to auto-inject)');
  
} catch (error) {
  console.error('❌ Error encoding font:', error.message);
  process.exit(1);
}
