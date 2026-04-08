// Popup script for Dyslexia Mode extension

document.addEventListener('DOMContentLoaded', () => {
  const globalToggle = document.getElementById('globalToggle');

  // Load current state
  chrome.storage.local.get(['globalDyslexiaMode'], (result) => {
    globalToggle.checked = result.globalDyslexiaMode || false;
  });

  // Handle toggle change
  globalToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    
    // Save to storage
    chrome.storage.local.set({ 
      globalDyslexiaMode: isEnabled,
      dyslexiaMode: isEnabled  // Also set dyslexiaMode for consistency
    }, () => {
      console.log('[Dyslexia Mode] Global mode:', isEnabled);
      
      // Notify all tabs to update
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateGlobalMode',
            enabled: isEnabled
          }).catch(() => {
            // Ignore errors for tabs that don't have content script
          });
        });
      });
      
      // Reload active tab to apply changes
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  });
});
