/**
 * Local Cache Logic
 * Handles DOM hashing and lookup in chrome.storage.local.
 */

/**
 * Generates a SHA-256 hash of a string.
 * @param {string} message 
 * @returns {Promise<string>} Hex string hash.
 */
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Checks if the normalized DOM hash matches a known legitimate template.
 * @param {Object} payload 
 * @returns {Promise<Object>} { status: 'SAFE' | 'UNKNOWN' }
 */
export async function checkHashCache(payload) {
  const { domain, normalizedDOM } = payload;
  
  if (!normalizedDOM) {
    return { status: 'UNKNOWN' };
  }

  console.log(`[FakeUI-Cache] Hashing DOM for ${domain}...`);
  const currentHash = await sha256(normalizedDOM);
  
  const storage = await chrome.storage.local.get(['legit_hashes']);
  const legitHashes = storage.legit_hashes || {};

  const knownHash = legitHashes[domain];
  if (knownHash === currentHash) {
    console.log(`[FakeUI-Cache] MATCH FOUND for ${domain}!`);
    return { status: 'SAFE' };
  }

  console.log(`[FakeUI-Cache] No match for ${domain}.`);
  return { status: 'UNKNOWN' };
}

/**
 * Updates the local cache with new legitimate hashes.
 * @param {Object} newHashes Mapping of domain -> hash.
 */
export async function updateHashCache(newHashes) {
  const storage = await chrome.storage.local.get(['legit_hashes']);
  const currentHashes = storage.legit_hashes || {};
  
  const updatedHashes = { ...currentHashes, ...newHashes };
  await chrome.storage.local.set({ legit_hashes: updatedHashes });
  console.log('[FakeUI-Cache] Local hash cache updated.');
}
