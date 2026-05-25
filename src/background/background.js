/**
 * FakeUI Detector - Background Service Worker
 * The central brain responsible for hard gates, hash lookups, and ML inference.
 */

import { performHardGates } from './gates.js';
import { checkHashCache } from './cache.js';
import { runVisualAnalysis } from './ml.js';
import { syncHashes, performScheduledSync } from './sync.js';

/**
 * Calculates the Levenshtein distance between two strings.
 * Used for structural similarity scoring.
 */
function calculateLevenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Computes structural similarity score based on normalized DOM strings.
 * @param {string} currentDOM 
 * @param {string} targetDOM 
 * @returns {number} Similarity score (0.0 to 1.0).
 */
function computeDomSimilarity(currentDOM, targetDOM) {
  const distance = calculateLevenshtein(currentDOM, targetDOM);
  const maxLength = Math.max(currentDOM.length, targetDOM.length);
  if (maxLength === 0) return 1.0;
  return 1.0 - distance / maxLength;
}

/**
 * Main analysis pipeline.
 * @param {Object} request 
 * @returns {Promise<Object>} Verdict
 */
async function analyzeForm(request) {
  const { domain } = request.payload;
  
  console.log(`[FakeUI-BG] Analyzing form at ${domain}...`);

  // 1. Hard Gates (Immediate Fail/Pass)
  const gateResult = await performHardGates(request.payload);
  if (gateResult.verdict === 'PHISHING') {
    return { status: 'PHISHING', confidence: 1.0, breakdown: { hardGates: gateResult.reasons } };
  }

  // 2. Structural Analysis (Hash Lookup)
  const hashResult = await checkHashCache(request.payload);
  if (hashResult.status === 'SAFE') {
    return { status: 'SAFE', confidence: 1.0, breakdown: { hardGates: ['HASH_MATCH'] } };
  }

  // Lazy Fetch: If unknown, try to sync the specific domain in the background
  syncHashes(domain);

  // 3. Visual Analysis (ML Inference)
  const visualScore = await runVisualAnalysis(request.payload);
  
  // 4. Structural Similarity (Levenshtein)
  // In a real scenario, we'd compare against the closest known legitimate template for that brand
  const domScore = 0.5; // Placeholder for similarity to closest template
  
  // 5. Soft Rule Check
  const ruleScore = 0.7; // Placeholder for minor anomalies

  // Final Weighted Scoring
  const finalScore = (0.5 * domScore) + (0.3 * visualScore) + (0.2 * ruleScore);
  
  if (finalScore < 0.4) {
    return { status: 'PHISHING', confidence: finalScore, breakdown: { domScore, visualScore, ruleScore } };
  } else if (finalScore < 0.85) {
    return { status: 'WARNING', confidence: finalScore, breakdown: { domScore, visualScore, ruleScore } };
  } else {
    return { status: 'SAFE', confidence: finalScore, breakdown: { domScore, visualScore, ruleScore } };
  }
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYSIS_REQUEST') {
    analyzeForm(message)
      .then(verdict => sendResponse(verdict))
      .catch(err => {
        console.error('[FakeUI-BG] Analysis Error:', err);
        sendResponse({ status: 'ERROR', error: err.message });
      });
    return true;
  }
});

// Setup scheduled sync alarm
chrome.alarms.create('daily_sync', { periodInMinutes: 1440 }); // 24 hours
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'daily_sync') {
    performScheduledSync();
  }
});

console.log('[FakeUI-BG] Background worker initialized.');

