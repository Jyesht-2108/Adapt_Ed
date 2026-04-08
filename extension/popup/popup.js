// Popup script for AdaptEd Dyslexic Mode extension

document.addEventListener('DOMContentLoaded', () => {
  const globalModeToggle = document.getElementById('globalModeToggle');
  const domainsList = document.getElementById('domainsList');
  const clearDomainsBtn = document.getElementById('clearDomains');
  const testCurrentPageBtn = document.getElementById('testCurrentPage');

  // Load current state
  loadState();

  // Global mode toggle handler
  globalModeToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.session.set({ globalMode: isEnabled }, () => {
      console.log('[AdaptEd] Global mode:', isEnabled);
      
      // Reload current tab to apply changes
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  });

  // Clear all domains handler
  clearDomainsBtn.addEventListener('click', () => {
    chrome.storage.session.set({ adaptedDomains: [] }, () => {
      console.log('[AdaptEd] All domains cleared');
      loadState();
    });
  });

  // Test on current page handler
  testCurrentPageBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const url = new URL(tabs[0].url);
        const domain = url.hostname;
        
        chrome.storage.session.get(['adaptedDomains'], (result) => {
          const domains = result.adaptedDomains || [];
          if (!domains.includes(domain)) {
            domains.push(domain);
            chrome.storage.session.set({ adaptedDomains: domains }, () => {
              console.log('[AdaptEd] Added domain:', domain);
              chrome.tabs.reload(tabs[0].id);
              loadState();
            });
          } else {
            chrome.tabs.reload(tabs[0].id);
          }
        });
      }
    });
  });

  function loadState() {
    chrome.storage.session.get(['adaptedDomains', 'globalMode'], (result) => {
      // Update global mode toggle
      globalModeToggle.checked = result.globalMode || false;

      // Update domains list
      const domains = result.adaptedDomains || [];
      renderDomainsList(domains);
    });
  }

  function renderDomainsList(domains) {
    if (domains.length === 0) {
      domainsList.innerHTML = '<p class="empty-state">No domains registered yet</p>';
      return;
    }

    domainsList.innerHTML = domains
      .map(
        (domain) => `
        <div class="domain-item">
          <span>${domain}</span>
          <button class="remove-domain" data-domain="${domain}">×</button>
        </div>
      `
      )
      .join('');

    // Add remove handlers
    document.querySelectorAll('.remove-domain').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const domainToRemove = e.target.dataset.domain;
        removeDomain(domainToRemove);
      });
    });
  }

  function removeDomain(domain) {
    chrome.storage.session.get(['adaptedDomains'], (result) => {
      const domains = result.adaptedDomains || [];
      const filtered = domains.filter((d) => d !== domain);
      chrome.storage.session.set({ adaptedDomains: filtered }, () => {
        console.log('[AdaptEd] Removed domain:', domain);
        loadState();
      });
    });
  }
});
