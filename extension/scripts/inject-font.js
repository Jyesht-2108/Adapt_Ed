/**
 * Script to automatically inject base64 font into content_script.js
 * 
 * Usage:
 *   1. Ensure OpenDyslexic.b64 exists (run encode-font.js first)
 *   2. Run: node scripts/inject-font.js
 */

const fs = require('fs');
const path = require('path');

const base64Path = path.join(__dirname, '../fonts/OpenDyslexic.b64');
const contentScriptPath = path.join(__dirname, '../content_script.js');

try {
  // Check if base64 file exists
  if (!fs.existsSync(base64Path)) {
    console.error('❌ Base64 font file not found:', base64Path);
    console.log('\n📥 Run this first: node scripts/encode-font.js');
    process.exit(1);
  }

  // Read base64 font
  const base64Font = fs.readFileSync(base64Path, 'utf8').trim();
  
  // Read content script
  let contentScript = fs.readFileSync(contentScriptPath, 'utf8');
  
  // Replace placeholder
  const placeholder = 'PLACEHOLDER_BASE64_FONT_DATA';
  
  if (!contentScript.includes(placeholder)) {
    console.log('⚠️  Placeholder not found. Font may already be injected.');
    console.log('   Looking for existing base64 data...');
    
    if (contentScript.includes('const OPENDYSLEXIC_FONT_B64 = \'') && 
        !contentScript.includes(placeholder)) {
      console.log('✅ Font appears to be already injected.');
      process.exit(0);
    }
  }
  
  contentScript = contentScript.replace(placeholder, base64Font);
  
  // Write back
  fs.writeFileSync(contentScriptPath, contentScript);
  
  console.log('✅ Font injected successfully into content_script.js!');
  console.log(`📊 Font size: ${(base64Font.length / 1024).toFixed(2)} KB`);
  console.log('\n🎉 Extension is ready to use!');
  console.log('   Load it in Chrome: chrome://extensions/ → Load unpacked');
  
} catch (error) {
  console.error('❌ Error injecting font:', error.message);
  process.exit(1);
}
