// Background service worker for AdaptEd Dyslexic Mode
// Listens for navigation events and manages extension state

chrome.webNavigation.onCommitted.addListener((details) => {
  // Log navigation for debugging
  if (details.frameId === 0) {
    console.log('[AdaptEd] Navigation detected:', details.url);
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getDomains') {
    chrome.storage.session.get(['adaptedDomains', 'globalMode'], (result) => {
      sendResponse(result);
    });
    return true; // Keep channel open for async response
  }
});

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('[AdaptEd] Extension installed');
  chrome.storage.session.set({ adaptedDomains: [], globalMode: false });
});
