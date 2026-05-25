# Detailed Implementation Plan: FakeUI Detector

This plan outlines the step-by-step execution to move from design to a production-ready browser extension.

## Phase 1: Foundation & Scaffolding
*   **Task 1.1: Project Initialization**
    *   Set up project structure (src/content, src/background, src/ui, assets/).
    *   Configure `manifest.json` (v3) with necessary permissions: `storage`, `activeTab`, `scripting`, `host_permissions`.
*   **Task 1.2: Basic Content Script Skeleton**
    *   Implement `MutationObserver` to detect login forms.
    *   Implement basic form detection logic (`input[type="password"]`).
*   **Task 1.3: Background Worker Setup**
    *   Set up `service_worker` to handle messages from content scripts.
    *   Implement a basic messaging protocol for `AnalysisRequest` and `VerdictResponse`.

## Phase 2: Symbolic Engine (The Hard Gates)
*   **Task 2.1: Hard Gate Implementation**
    *   Implement `HTTPS` check.
    *   Implement `Domain-Action` mismatch logic (including OAuth whitelist).
    *   Implement high-risk keyword scanning.
*   **Task 2.2: DOM Normalization Pipeline**
    *   Build the normalization function (attribute stripping, whitespace removal).
    *   Implement `SHA-256` hashing for the normalized DOM string.
*   **Task 2.3: Local Hash Cache System**
    *   Implement `chrome.storage.local` wrapper for storing and retrieving domain hashes.

## Phase 3: Data Infrastructure & Sync
*   **Task 3.1: Static Remote Store Setup**
    *   Create `legit_hashes.json` on GitHub Pages/Cloudflare Pages.
    *   Implement the JSON schema for domain-hash mappings.
*   **Task 3.2: Background Sync Logic**
    *   Implement "Lazy Fetch" (fetch on cache miss).
    *   Implement scheduled 24h delta updates using `ETag` validation.

## Phase 4: Visual Intelligence (ML Integration)
*   **Task 4.1: TF.js Environment Setup**
    *   Integrate `@tensorflow/tfjs` into the background worker.
    *   Implement WebGL backend initialization.
*   **Task 4.2: Model Deployment**
    *   Convert the trained MobileNetV3-Small model to TF.js format (INT8 quantized).
    *   Implement lazy loading of the model from assets.
*   **Task 4.3: Visual Preprocessing Pipeline**
    *   Implement canvas-based screenshot capture of the login container.
    *   Implement grayscale conversion, resizing ($224 \times 224$), and normalization.

## Phase 5: Verdict & UI Integration
*   **Task 5.1: Weighted Scoring Engine**
    *   Implement the final scoring formula: $(0.5 \times S_{dom}) + (0.3 \times S_{cnn}) + (0.2 \times S_{rule\_soft})$.
    *   Implement Levenshtein distance for $S_{dom}$ (Structural Similarity).
*   **Task 5.2: Interruption Overlay UI**
    *   Build the Red/Yellow warning overlays with the evidence list.
    *   Implement "Leave Page" and "Trust Site" actions.
*   **Task 5.3: Passive Badge & Management Popup**
    *   Build the green shield badge for `SAFE` sites.
    *   Build the extension popup for settings, whitelist, and stats.

## Phase 6: Benchmark Tasks
*   **Benchmark 6.1: Detection Accuracy (Precision/Recall)**
    *   Test against a dataset of 100 legitimate and 100 known phishing forms.
    *   Measure False Positive Rate (FPR) and False Negative Rate (FNR).
*   **Benchmark 6.2: Latency Profiling**
    *   Measure time from `DOM Trigger` $\rightarrow$ `Verdict`.
    *   Break down latency by: Normalization $\rightarrow$ Hash Lookup $\rightarrow$ ML Inference.
    *   Goal: Average total latency $< 200\text{ms}$.
*   **Benchmark 6.3: Model Size & RAM**
    *   Measure peak memory usage during inference.
    *   Verify bundle size of the quantized model.

## Phase 7: Stress Test Tasks
*   **Stress Test 7.1: DOM Complexity Test**
    *   Test analysis on extremely large DOMs (10,000+ nodes) to ensure the `MutationObserver` and Normalizer don't freeze the UI thread.
*   **Stress Test 7.2: Network Failure Resilience**
    *   Simulate offline mode and remote API timeouts to ensure the extension falls back to bundled core hashes and ML analysis gracefully.
*   **Stress Test 7.3: Memory Leak Audit**
    *   Run repeated analysis on multiple login pages in a single session to check for TensorFlow.js tensor leaks (`tf.dispose()`).
*   **Stress Test 7.4: Adversarial UI Test**
    *   Test against "anti-detector" techniques: obfuscated HTML, canvas-rendered text, and dynamic DOM shuffling.
