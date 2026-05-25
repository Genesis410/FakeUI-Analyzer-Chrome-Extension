# PRD: FakeUI Detector

## 1. Project Overview
*   **Name:** FakeUI Detector
*   **Tier:** 3 (Specialized Security Infrastructure)
*   **Objective:** A browser extension that identifies fraudulent login screens by analyzing the correlation between the DOM structure and visual layout, moving beyond simple URL-based blacklists.

## 2. Target Audience
*   **General Users:** Non-technical users prone to sophisticated phishing attacks.
*   **Enterprise:** Organizations wanting an additional layer of credential protection for employees.

## 3. Functional Requirements
*   **FR1: Form Trigger:** The extension must automatically trigger analysis whenever a page contains an `<input type="password">` or a common login form pattern.
*   **FR2: Hard Gate Validation:** Immediate binary checks for:
    *   Domain-Action mismatch (Form `action` attribute differs from current domain).
    *   Lack of HTTPS.
    *   Presence of high-risk keywords in the DOM.
*   **FR3: Structural Analysis:** Generate a DOM hash of the login form and compare it against a local cache of known legitimate templates.
*   **FR4: Visual Analysis:** Use a lightweight CNN (via TensorFlow.js) to score the visual "spoofiness" of the form compared to known brands.
*   **FR5: Verdict System:** Combine signals into a tripartite verdict: `SAFE`, `WARNING`, or `PHISHING`.
*   **FR6: User Notification:** Non-intrusive UI alerts that block or warn the user before they enter credentials.
*   **FR7: Dynamic Updates:** Background synchronization of the legitimate hash list from a static remote source.

## 4. Non-Functional Requirements
*   **NFR1: Performance:** Total analysis latency must be `< 200ms` to avoid degrading UX.
*   **NFR2: Resource Footprint:** Minimal CPU/RAM usage; ML models must be quantized/small.
*   **NFR3: Privacy:** No user-entered credentials should ever be read or transmitted; analysis is based on structure and visuals.
*   **NFR4: Cost:** $0 operational cost (utilizing static hosting and local browser storage).

## 5. Success Metrics
*   **Precision:** Minimize False Positives to avoid "alert fatigue."
*   **Recall:** High detection rate for visually identical clones of top 50 phished sites.
*   **Latency:** Average time from page load to verdict.
