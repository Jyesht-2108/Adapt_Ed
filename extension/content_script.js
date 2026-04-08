// Content script for AdaptEd Dyslexic Mode
// Applies dyslexia-friendly typography to web pages

// OpenDyslexic font base64 encoded (placeholder - needs actual font file)
// To generate: base64 encode the OpenDyslexic-Regular.otf file
const OPENDYSLEXIC_FONT_B64 = 'PLACEHOLDER_BASE64_FONT_DATA';

// Check if styles are already applied
if (!document.getElementById('adapted-dyslexic-mode')) {
  chrome.storage.session.get(['adaptedDomains', 'globalMode'], (result) => {
    const currentDomain = window.location.hostname;
    const adaptedDomains = result.adaptedDomains || [];
    const globalMode = result.globalMode || false;
    
    const shouldApply = globalMode || adaptedDomains.includes(currentDomain);
    
    if (shouldApply) {
      console.log('[AdaptEd] Applying dyslexic mode to:', currentDomain);
      applyDyslexicMode();
    } else {
      console.log('[AdaptEd] Domain not registered:', currentDomain);
    }
  });
}

function applyDyslexicMode() {
  // Check if already applied
  if (document.getElementById('adapted-dyslexic-mode')) {
    console.log('[AdaptEd] Styles already applied');
    return;
  }

  const style = document.createElement('style');
  style.id = 'adapted-dyslexic-mode';
  
  // Note: Replace PLACEHOLDER_BASE64_FONT_DATA with actual base64 encoded font
  style.textContent = `
    @font-face {
      font-family: 'OpenDyslexic';
      src: url('data:font/otf;base64,${OPENDYSLEXIC_FONT_B64}') format('opentype');
      font-weight: normal;
      font-style: normal;
    }
    
    * {
      font-family: 'OpenDyslexic', sans-serif !important;
      text-align: left !important;
      line-height: 1.8 !important;
      word-spacing: 0.16em !important;
      letter-spacing: 0.12em !important;
    }
    
    /* Preserve monospace for code blocks */
    code, pre, kbd, samp, tt {
      font-family: 'OpenDyslexic', 'Courier New', monospace !important;
    }
  `;
  
  document.head.appendChild(style);
  console.log('[AdaptEd] Dyslexic mode styles applied successfully');
}

// Listen for dynamic content changes
const observer = new MutationObserver(() => {
  if (!document.getElementById('adapted-dyslexic-mode')) {
    chrome.storage.session.get(['adaptedDomains', 'globalMode'], (result) => {
      const currentDomain = window.location.hostname;
      const shouldApply = result.globalMode || (result.adaptedDomains || []).includes(currentDomain);
      if (shouldApply) {
        applyDyslexicMode();
      }
    });
  }
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});
