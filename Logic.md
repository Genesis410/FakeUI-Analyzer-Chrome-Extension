# Detailed Logic: FakeUI Detector

The logic is implemented as a **pipelined filter**, where data flows through increasingly complex checks. If a "Hard Gate" provides a definitive answer, the pipeline terminates early to save resources.

## 1. Trigger Logic (The Watchdog)
*   **Event:** `MutationObserver` detects a new node or `DOMContentLoaded` fires.
*   **Condition:** Search for elements matching:
    *   `input[type="password"]`
    *   `form` containing both `email/username` and `password` fields.
*   **Action:** If found, isolate the smallest common ancestor (the "Login Container") and initiate the Analysis Pipeline.

## 2. Hard Gates (The Symbolic Filter)
Executed in order. Any `FAIL` here results in an immediate `PHISHING` verdict.
*   **Gate A: HTTPS Check** $\rightarrow$ If `window.location.protocol !== 'https:'`, trigger **CRITICAL WARNING**.
*   **Gate B: Domain-Action Match** $\rightarrow$ 
    *   Extract `form.action` URL.
    *   Compare the hostname of the `action` URL with `window.location.hostname`.
    *   If `action_hostname !== current_hostname` AND `action_hostname` is not a known legitimate third-party OAuth provider $\rightarrow$ trigger **PHISHING**.
*   **Gate C: High-Risk Keywords** $\rightarrow$ Scan DOM for strings like "Verify your account", "Suspicious activity detected", or "Update your password immediately" combined with a mismatched domain $\rightarrow$ trigger **SUSPICIOUS**.

## 3. Structural Analysis (DOM Hashing)
If Hard Gates are passed, we check for structural identity.
*   **Normalization:** 
    1. Select the Login Container.
    2. Remove attributes: `id`, `class`, `style`, `data-*` (to ignore randomized CSS/tracking IDs).
    3. Remove text nodes (keep only tags and structure).
    4. Strip whitespace and line breaks.
*   **Hashing:** Generate `SHA-256` of the normalized string.
*   **Lookup:** Query `chrome.storage.local`.
    *   **Match Found $\rightarrow$ `SAFE`** (Skip CNN, terminate pipeline).
    *   **No Match $\rightarrow$ Proceed to Visual Analysis.**

## 4. Visual Analysis (CNN Inference)
*   **Capture:** Use `html2canvas` or a hidden `<canvas>` to capture the bounding box of the Login Container.
*   **Preprocessing:** Resize image to model input size (e.g., $224 \times 224$), convert to grayscale, and normalize pixel values.
*   **Inference:** Run the image through the quantized TensorFlow.js model.
*   **Output:** The model returns a probability $S_{cnn}$ (0.0 to 1.0) of the UI being a "Spoof" of a known brand.

## 5. Weighted Scoring & Final Verdict
If no Hard Gate or Hash Match occurred, calculate the composite score:

$$\text{Final Score} = (0.5 \times S_{dom}) + (0.3 \times S_{cnn}) + (0.2 \times S_{rule\_soft})$$

*   **$S_{dom}$:** Similarity score between current DOM and the *closest* known legitimate template (calculated via Levenshtein distance of normalized strings).
*   **$S_{cnn}$:** Visual spoofing probability.
*   **$S_{rule\_soft}$:** Penalty score for minor anomalies (e.g., missing `autocomplete` attributes, non-standard input names).

### Verdict Mapping:
*   **$\text{Score} > 0.85$:** $\rightarrow$ `SAFE` (Green UI)
*   **$0.40 \leq \text{Score} \leq 0.85$:** $\rightarrow$ `WARNING` (Yellow UI - "Caution: UI looks similar to [Brand], but structure differs")
*   **$\text{Score} < 0.40$:** $\rightarrow$ `PHISHING` (Red UI - "Danger: High probability of a fake login screen")

## 6. Background Sync Logic
*   **On-Demand:** If a site is "Unknown," the extension sends a request to the static API for that domain's current hash.
*   **Scheduled:** Every 24 hours, the extension checks the `ETag` of the `legit_hashes.json` file on the remote server. If changed, it downloads the delta and updates `chrome.storage.local`.
