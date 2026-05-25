/**
 * FakeUI Detector - Content Script
 * Responsible for monitoring the DOM for login forms and triggering analysis.
 */

const LOGIN_FORM_INDICATORS = [
  'input[type="password"]',
  'form input[name*="pass"]',
  'form input[id*="pass"]'
];

/**
 * Creates a small passive badge for SAFE sites.
 */
function showSafeBadge() {
  if (document.getElementById('fakeui-safe-badge')) return;

  const badge = document.createElement('div');
  badge.id = 'fakeui-safe-badge';
  badge.innerHTML = '🛡️';
  badge.title = 'Verified Legitimate UI structure';
  
  Object.assign(badge.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    fontSize: '24px',
    zIndex: '2147483647',
    cursor: 'help',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
  });

  document.body.appendChild(badge);
}

/**
 * Identifies the smallest common ancestor that contains a login form.
 * @param {HTMLElement} passwordInput 
 * @returns {HTMLElement|null}
 */
function findLoginContainer(passwordInput) {
  const form = passwordInput.closest('form');
  if (form) return form;

  let current = passwordInput.parentElement;
  while (current && current !== document.body) {
    const hasUserField = current.querySelector('input[type="text"], input[type="email"], input[name*="user"], input[name*="email"]');
    if (hasUserField) return current;
    current = current.parentElement;
  }
  return null;
}

async function triggerAnalysis(container) {
  console.log('[FakeUI] Login form detected. Triggering analysis...');
  
  const { normalizeDOM } = await import(chrome.runtime.getURL('src/content/normalizer.js'));
  const { captureFormVisuals } = await import(chrome.runtime.getURL('src/content/visuals.js'));
  
  const normalizedDOM = normalizeDOM(container);
  const imageData = await captureFormVisuals(container);

  const formInfo = {
    url: window.location.href,
    domain: window.location.hostname,
    protocol: window.location.protocol,
    formAction: container.querySelector('form')?.action || null,
    containerId: container.id || 'unknown',
    normalizedDOM: normalizedDOM,
    imageData: imageData
  };

  chrome.runtime.sendMessage({
    type: 'ANALYSIS_REQUEST',
    payload: formInfo
  }, async (response) => {
    if (chrome.runtime.lastError) {
      console.error('[FakeUI] Error sending analysis request:', chrome.runtime.lastError);
      return;
    }
    if (response && (response.status === 'PHISHING' || response.status === 'WARNING')) {
      const { showOverlay } = await import(chrome.runtime.getURL('src/ui/overlay.js'));
      showOverlay(response);
    } else if (response && response.status === 'SAFE') {
      showSafeBadge();
    }
  });
}

function scanForForms() {
  for (const selector of LOGIN_FORM_INDICATORS) {
    const inputs = document.querySelectorAll(selector);
    for (const input of inputs) {
      const container = findLoginContainer(input);
      if (container) {
        triggerAnalysis(container);
        return;
      }
    }
  }
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      scanForForms();
      break;
    }
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

scanForForms();

      break;
    }
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial scan on load
scanForForms();
