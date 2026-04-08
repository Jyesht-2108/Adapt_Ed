/**
 * Bridge for AdaptEd webapp integration
 * 
 * This file can be included in the AdaptEd frontend to enable
 * automatic activation when users click citation links.
 * 
 * USAGE IN FRONTEND:
 * 
 * import { enableDyslexiaMode, isDyslexiaModeAvailable } from './bridge.js'
 * 
 * // Check if extension is installed
 * if (isDyslexiaModeAvailable()) {
 *   // Enable dyslexia mode when user clicks citation
 *   enableDyslexiaMode()
 * }
 */

/**
 * Check if Dyslexia Mode extension is available
 * @returns {boolean}
 */
export function isDyslexiaModeAvailable() {
  return typeof chrome !== 'undefined' && 
         chrome.storage !== undefined && 
         chrome.storage.local !== undefined;
}

/**
 * Enable dyslexia mode globally
 * This will activate the mode on all pages
 */
export function enableDyslexiaMode() {
  if (!isDyslexiaModeAvailable()) {
    console.warn('[AdaptEd] Dyslexia Mode extension not installed');
    return;
  }

  chrome.storage.local.set({ 
    globalDyslexiaMode: true,
    dyslexiaMode: true 
  }, () => {
    console.log('[AdaptEd] Dyslexia Mode enabled globally');
  });
}

/**
 * Disable dyslexia mode globally
 */
export function disableDyslexiaMode() {
  if (!isDyslexiaModeAvailable()) {
    return;
  }

  chrome.storage.local.set({ 
    globalDyslexiaMode: false,
    dyslexiaMode: false 
  }, () => {
    console.log('[AdaptEd] Dyslexia Mode disabled');
  });
}

/**
 * Toggle dyslexia mode
 */
export async function toggleDyslexiaMode() {
  if (!isDyslexiaModeAvailable()) {
    return false;
  }

  return new Promise((resolve) => {
    chrome.storage.local.get(['globalDyslexiaMode'], (result) => {
      const newState = !result.globalDyslexiaMode;
      chrome.storage.local.set({ 
        globalDyslexiaMode: newState,
        dyslexiaMode: newState 
      }, () => {
        console.log('[AdaptEd] Dyslexia Mode toggled:', newState);
        resolve(newState);
      });
    });
  });
}

/**
 * Get current dyslexia mode state
 * @returns {Promise<boolean>}
 */
export async function getDyslexiaModeState() {
  if (!isDyslexiaModeAvailable()) {
    return false;
  }

  return new Promise((resolve) => {
    chrome.storage.local.get(['globalDyslexiaMode'], (result) => {
      resolve(result.globalDyslexiaMode || false);
    });
  });
}

// For non-module usage
if (typeof window !== 'undefined') {
  window.DyslexiaModeBridge = {
    isAvailable: isDyslexiaModeAvailable,
    enable: enableDyslexiaMode,
    disable: disableDyslexiaMode,
    toggle: toggleDyslexiaMode,
    getState: getDyslexiaModeState
  };
}
