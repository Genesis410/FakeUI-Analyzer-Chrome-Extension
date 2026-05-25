# Architecture and Schema: FakeUI Detector

## 1. High-Level Architecture
The system uses a **Client-Side Heavy** architecture to ensure low latency and privacy.

*   **Content Script (The Sensor):**
    *   Monitors DOM changes via `MutationObserver`.
    *   Identifies login forms and extracts the normalized DOM structure.
    *   Captures a canvas-based screenshot of the form region.
*   **Background Service Worker (The Brain):**
    *   Executes "Hard Gates" (binary logic).
    *   Manages the Local Hash Cache via `chrome.storage.local`.
    *   Runs TensorFlow.js model inference for visual scoring.
    *   Handles asynchronous remote delta updates from the static JSON source.
*   **UI Overlay (The Alert):**
    *   Displays the tripartite verdict (`SAFE`, `WARNING`, `PHISHING`).
    *   Provides a transparent breakdown of the score (e.g., "Domain mismatch: -0.5").
*   **Remote Static Store:**
    *   Static JSON file (GitHub/Cloudflare Pages) containing `domain -> hash` mappings.

## 2. Data Flow
`DOM Trigger` $\rightarrow$ `Content Script` $\rightarrow$ `Hard Gates` $\rightarrow$ `Hash Lookup` $\rightarrow$ `CNN Inference` $\rightarrow$ `Weighted Score` $\rightarrow$ `Verdict` $\rightarrow$ `UI Alert`.

## 3. Schema (Data Models)

### Legitimate Hash Entry
```json
{
  "domain": "accounts.google.com",
  "hash": "sha256_normalized_dom_structure",
  "version": 1,
  "lastUpdated": "2026-05-25T10:00:00Z"
}
```

### Verdict Object
```typescript
interface Verdict {
  status: 'SAFE' | 'WARNING' | 'PHISHING';
  confidence: number; // 0.0 to 1.0
  breakdown: {
    hardGates: string[]; // e.g., ["HTTPS_OK", "DOMAIN_MISMATCH"]
    domScore: number;
    visualScore: number;
    ruleScore: number;
  };
  timestamp: number;
}
```

## 4. DOM Normalization Strategy
To ensure hash stability despite dynamic IDs or minor UI tweaks, the DOM is normalized before hashing:
1. Strip all `id` and `class` attributes that follow randomized patterns.
2. Remove all whitespace, comments, and script tags.
3. Standardize the order of attributes.
4. Hash the resulting structural string.
