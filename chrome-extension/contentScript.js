// Dyslexia Mode Chrome Extension - Content Script
(function() {
  'use strict';

  // State management
  let isDyslexiaMode = false;
  let isProcessing = false;
  const originalStates = new Map();

  // Configuration
  const IGNORED_TAGS = new Set(['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'CODE', 'PRE', 'NOSCRIPT', 'IFRAME', 'SVG']);
  const BOLD_PERCENTAGE = 0.35;

  // Initialize
  init();

  function init() {
    if (!document.body) {
      setTimeout(init, 100);
      return;
    }

    chrome.storage.local.get(['dyslexiaMode', 'globalDyslexiaMode'], (result) => {
      // If global mode is enabled, activate automatically
      isDyslexiaMode = result.globalDyslexiaMode || result.dyslexiaMode || false;
      createToggleButton();
      if (isDyslexiaMode) {
        applyDyslexiaMode();
      }
    });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'updateGlobalMode') {
        isDyslexiaMode = message.enabled;
        const button = document.getElementById('dyslexia-toggle-btn');
        if (button) {
          if (isDyslexiaMode) {
            button.classList.add('active');
            applyDyslexiaMode();
          } else {
            button.classList.remove('active');
            restoreOriginalText();
          }
        }
      }
    });
  }

  function createToggleButton() {
    const existing = document.getElementById('dyslexia-toggle-container');
    if (existing) existing.remove();

    const toggleContainer = document.createElement('div');
    toggleContainer.id = 'dyslexia-toggle-container';
    toggleContainer.innerHTML = `
      <style>
        #dyslexia-toggle-container {
          position: fixed;
          top: 80px;
          right: 20px;
          z-index: 2147483647;
          font-family: Arial, sans-serif;
        }
        #dyslexia-toggle-btn {
          background: #4A90E2;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        #dyslexia-toggle-btn:hover {
          background: #357ABD;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        #dyslexia-toggle-btn.active {
          background: #27AE60;
        }
        #dyslexia-toggle-btn.active:hover {
          background: #229954;
        }
        .dyslexia-toggle-icon {
          width: 16px;
          height: 16px;
          border: 2px solid white;
          border-radius: 50%;
          position: relative;
        }
        .dyslexia-toggle-icon::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: opacity 0.3s;
        }
        #dyslexia-toggle-btn.active .dyslexia-toggle-icon::after {
          opacity: 1;
        }
        #dyslexia-toggle-btn:not(.active) .dyslexia-toggle-icon::after {
          opacity: 0;
        }
      </style>
      <button id="dyslexia-toggle-btn" class="${isDyslexiaMode ? 'active' : ''}">
        <span class="dyslexia-toggle-icon"></span>
        <span>Dyslexia Mode</span>
      </button>
    `;

    document.body.appendChild(toggleContainer);
    document.getElementById('dyslexia-toggle-btn').addEventListener('click', toggleDyslexiaMode);
  }

  function toggleDyslexiaMode() {
    if (isProcessing) return;

    isDyslexiaMode = !isDyslexiaMode;
    const button = document.getElementById('dyslexia-toggle-btn');
    
    if (isDyslexiaMode) {
      button.classList.add('active');
      applyDyslexiaMode();
    } else {
      button.classList.remove('active');
      restoreOriginalText();
    }

    chrome.storage.local.set({ dyslexiaMode: isDyslexiaMode });
  }

  function applyDyslexiaMode() {
    if (isProcessing) return;
    isProcessing = true;

    originalStates.clear();
    injectDyslexiaStyles();
    processAllTextNodes();

    isProcessing = false;
  }

  function injectDyslexiaStyles() {
    let styleEl = document.getElementById('dyslexia-mode-styles');
    
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dyslexia-mode-styles';
      document.head.appendChild(styleEl);
    }

    // Read the base64 font from the generated CSS file
    fetch(chrome.runtime.getURL('opendyslexic-base64.css'))
      .then(response => response.text())
      .then(fontCss => {
        styleEl.textContent = `
          ${fontCss}
          
          body.dyslexia-mode-active * {
            font-family: "OpenDyslexic", Arial, Verdana, sans-serif !important;
            line-height: 1.7 !important;
            letter-spacing: 0.05em !important;
            word-spacing: 0.16em !important;
          }
          body.dyslexia-mode-active {
            font-size: 115% !important;
          }
          #dyslexia-toggle-container * {
            font-family: Arial, sans-serif !important;
            line-height: normal !important;
            letter-spacing: normal !important;
            word-spacing: normal !important;
          }
        `;
      })
      .catch(err => {
        console.warn('Could not load OpenDyslexic font:', err);
        // Fallback without custom font
        styleEl.textContent = `
          body.dyslexia-mode-active * {
            font-family: Arial, Verdana, sans-serif !important;
            line-height: 1.7 !important;
            letter-spacing: 0.05em !important;
            word-spacing: 0.16em !important;
          }
          body.dyslexia-mode-active {
            font-size: 115% !important;
          }
          #dyslexia-toggle-container * {
            font-family: Arial, sans-serif !important;
            line-height: normal !important;
            letter-spacing: normal !important;
            word-spacing: normal !important;
          }
        `;
      });

    document.body.classList.add('dyslexia-mode-active');
  }

  function removeDyslexiaStyles() {
    const styleEl = document.getElementById('dyslexia-mode-styles');
    if (styleEl) styleEl.remove();
    document.body.classList.remove('dyslexia-mode-active');
  }

  function processAllTextNodes() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          const parent = node.parentElement;
          
          if (!parent || IGNORED_TAGS.has(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }

          if (parent.closest('#dyslexia-toggle-container')) {
            return NodeFilter.FILTER_REJECT;
          }

          if (!node.textContent || !node.textContent.trim()) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    textNodes.forEach(textNode => {
      processTextNode(textNode);
    });
  }

  function processTextNode(textNode) {
    try {
      const parent = textNode.parentElement;
      if (!parent) return;

      if (!originalStates.has(parent)) {
        originalStates.set(parent, parent.innerHTML);
      }

      const originalText = textNode.nodeValue;
      if (!originalText || !originalText.trim()) return;

      const transformedHTML = transformText(originalText);

      const span = document.createElement('span');
      span.setAttribute('data-dyslexia-processed', 'true');
      span.innerHTML = transformedHTML;

      textNode.parentNode.replaceChild(span, textNode);

    } catch (e) {
      console.warn('Error processing text node:', e);
    }
  }

  function transformText(text) {
    return text.replace(/\b([a-zA-Z]{2,})\b/g, (match) => {
      const boldLength = Math.max(1, Math.ceil(match.length * BOLD_PERCENTAGE));
      const boldPart = match.slice(0, boldLength);
      const normalPart = match.slice(boldLength);
      return `<b>${boldPart}</b>${normalPart}`;
    });
  }

  function restoreOriginalText() {
    if (isProcessing) return;
    isProcessing = true;

    removeDyslexiaStyles();

    originalStates.forEach((html, element) => {
      try {
        if (element && element.parentNode && document.body.contains(element)) {
          element.innerHTML = html;
        }
      } catch (e) {
        console.warn('Error restoring element:', e);
      }
    });

    originalStates.clear();
    isProcessing = false;
  }

})();
