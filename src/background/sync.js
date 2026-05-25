/**
 * Background Sync Logic
 * Handles fetching legitimate hashes from a static remote source.
 */

import { updateHashCache } from './cache.js';

const REMOTE_HASHES_URL = 'https://raw.githubusercontent.com/your-repo/fakeui-detector/main/legit_hashes.json';

/**
 * Fetches the latest hash list and updates the local cache.
 * @param {string} [domain] Optional domain to fetch specifically (Lazy Fetch).
 */
export async function syncHashes(domain = null) {
  console.log(`[FakeUI-Sync] Syncing hashes${domain ? ` for ${domain}` : ' (Full Sync)'}...`);
  
  try {
    const url = domain 
      ? `${REMOTE_HASHES_URL}?domain=${domain}` // Hypothetical API param
      : REMOTE_HASHES_URL;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    
    // Assuming data is { "domain.com": "hash", ... }
    await updateHashCache(data);
    
    console.log('[FakeUI-Sync] Sync successful.');
  } catch (e) {
    console.error('[FakeUI-Sync] Sync failed:', e);
  }
}

/**
 * Scheduled sync function called by chrome.alarms.
 */
export async function performScheduledSync() {
  console.log('[FakeUI-Sync] Performing scheduled 24h sync...');
  await syncHashes();
}
