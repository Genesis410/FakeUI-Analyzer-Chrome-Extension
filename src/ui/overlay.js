/**
 * Interruption Overlay Logic
 * Manages the injection and interaction of the warning modal.
 */

export async function showOverlay(verdict) {
  // 1. Inject CSS
  if (!document.getElementById('fakeui-styles')) {
    const link = document.createElement('link');
    link.id = 'fakeui-styles';
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('src/ui/overlay.css');
    document.head.appendChild(link);
  }

  // 2. Create Overlay Structure
  const overlay = document.createElement('div');
  overlay.className = 'fakeui-overlay';

  const isPhishing = verdict.status === 'PHISHING';
  const modalClass = isPhishing ? 'phishing' : 'warning';
  const headerText = isPhishing ? '🛑 STOP! This page is a fraudulent clone.' : '⚠️ CAUTION: This login looks unusual.';
  const primaryBtnText = isPhishing ? 'Leave Page Now' : 'Close Warning';

  overlay.innerHTML = `
    <div class="fakeui-modal ${modalClass}">
      <div class="fakeui-header">${headerText}</div>
      <div class="fakeui-evidence">
        <strong>Why?</strong>
        <div class="fakeui-evidence-list">
          ${renderEvidence(verdict.breakdown)}
        </div>
      </div>
      <div class="fakeui-actions">
        <button class="fakeui-btn fakeui-btn-secondary" id="fakeui-trust">I trust this site</button>
        <button class="fakeui-btn fakeui-btn-primary" id="fakeui-action">${primaryBtnText}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // 3. Bind Actions
  document.getElementById('fakeui-trust').onclick = () => {
    overlay.remove();
    // In a real app, save exception to storage
  };

  document.getElementById('fakeui-action').onclick = () => {
    if (isPhishing) {
      window.location.href = 'https://google.com';
    } else {
      overlay.remove();
    }
  };
}

function renderEvidence(breakdown) {
  const items = [];
  if (breakdown.hardGates) {
    breakdown.hardGates.forEach(gate => items.push(`❌ ${gate}`));
  }
  if (breakdown.visualScore !== undefined && breakdown.visualScore < 0.5) {
    items.push(`❌ Visual anomaly detected`);
  }
  if (breakdown.domScore !== undefined && breakdown.domScore < 0.6) {
    items.push(`❌ Structural mismatch`);
  }
  
  return items.length > 0 
    ? items.map(item => `<div class="fakeui-evidence-item">${item}</div>`).join('')
    : '<div class="fakeui-evidence-item">Our AI detected a high probability of a spoofed UI.</div>';
}
