/**
 * Hard Gates Logic
 * Implements binary symbolic checks for immediate phishing detection.
 */

const HIGH_RISK_KEYWORDS = [
  "verify your account",
  "suspicious activity detected",
  "update your password immediately",
  "security alert: login required",
  "action required: account locked"
];

const OAuth_PROVIDERS = [
  "accounts.google.com",
  "login.microsoftonline.com",
  "facebook.com",
  "appleid.apple.com"
];

/**
 * Performs binary checks to see if a form is immediately suspicious.
 * @param {Object} payload 
 * @returns {Promise<Object>} { verdict: 'PHISHING' | 'UNKNOWN', reasons: string[] }
 */
export async function performHardGates(payload) {
  const { protocol, domain, formAction, url } = payload;
  const reasons = [];

  console.log(`[FakeUI-Gates] Analyzing: ${domain}`);

  // Gate A: HTTPS Check
  if (protocol !== 'https:') {
    reasons.push('NO_HTTPS');
  }

  // Gate B: Domain-Action Match
  if (formAction) {
    try {
      const actionUrl = new URL(formAction);
      const actionHostname = actionUrl.hostname;

      if (actionHostname !== domain && !OAuth_PROVIDERS.includes(actionHostname)) {
        reasons.push('DOMAIN_ACTION_MISMATCH');
      }
    } catch (e) {
      console.error('[FakeUI-Gates] Invalid form action URL:', formAction);
      reasons.push('INVALID_FORM_ACTION');
    }
  }

  // Gate C: High-Risk Keywords (Simplified scan of URL and domain)
  // Note: Content script can send DOM text for a more thorough scan
  const lowerUrl = url.toLowerCase();
  for (const keyword of HIGH_RISK_KEYWORDS) {
    if (lowerUrl.includes(keyword)) {
      reasons.push(`RISK_KEYWORD: ${keyword}`);
      break;
    }
  }

  // Decision: If we have critical failures, mark as PHISHING
  // In a real scenario, we might require 2+ reasons or specific critical ones
  if (reasons.includes('DOMAIN_ACTION_MISMATCH') || reasons.includes('NO_HTTPS')) {
    return { verdict: 'PHISHING', reasons };
  }

  return { verdict: 'UNKNOWN', reasons };
}
