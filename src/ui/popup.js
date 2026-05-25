/**
 * Management Popup Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  const blockedCountEl = document.getElementById('blocked-count');
  const updateBtn = document.getElementById('update-hashes');
  const clearWhitelistBtn = document.getElementById('clear-whitelist');
  const sensitivityInput = document.getElementById('sensitivity');

  // Load stats from storage
  const storage = await chrome.storage.local.get(['blocked_count', 'sensitivity']);
  
  blockedCountEl.textContent = storage.blocked_count || '0';
  if (storage.sensitivity) {
    sensitivityInput.value = storage.sensitivity;
  }

  // Handle sensitivity change
  sensitivityInput.oninput = async (e) => {
    await chrome.storage.local.set({ sensitivity: e.target.value });
  };

  // Update hashes manually
  updateBtn.onclick = async () => {
    updateBtn.disabled = true;
    updateBtn.textContent = 'Updating...';
    
    chrome.runtime.sendMessage({ type: 'FORCE_SYNC' }, (response) => {
      updateBtn.disabled = false;
      updateBtn.textContent = 'Update Hash Database';
      alert('Hash database updated successfully!');
    });
  };

  // Clear whitelist
  clearWhitelistBtn.onclick = async () => {
    await chrome.storage.local.remove('whitelist');
    alert('Whitelist cleared.');
  };
});
