# UI/UX Component Slicing: FakeUI Detector

The UI is split into three distinct layers to balance safety with usability.

## 1. The "Interruption" Overlay (Critical)
This is a high-z-index overlay that appears over the login form when a `PHISHING` or `WARNING` verdict is reached.
*   **Visual States:**
    *   **Red (Phishing):** Solid red border, flashing warning icon. Text: "🛑 STOP! This page is a fraudulent clone."
    *   **Yellow (Warning):** Amber border, caution icon. Text: "⚠️ CAUTION: This login looks unusual."
*   **Components:**
    *   **Verdict Header:** Large, color-coded status.
    *   **Evidence List:** A bulleted list of reasons (e.g., "❌ Domain mismatch", "❌ Visual anomaly detected").
    *   **Primary Action:** "Leave Page Now" (Redirects to safe search or home).
    *   **Secondary Action:** "I trust this site" (Collapses the warning, saves exception to local storage).

## 2. The "Passive" Badge (Informational)
A small, unobtrusive icon in the browser toolbar or a tiny corner badge on the page for `SAFE` sites.
*   **Visual:** A green shield icon $\checkmark$.
*   **Interaction:** On hover, shows: "Verified Legitimate UI structure."

## 3. The Extension Popup (Management)
Accessed by clicking the extension icon in the browser bar.
*   **Dashboard:** 
    *   Total attacks blocked counter.
    *   Current protection status (Active/Inactive).
*   **Settings:**
    *   Sensitivity Slider (Adjusts the `0.40 - 0.85` warning threshold).
    *   "Whitelist" manager (List of domains the user has manually trusted).
    *   "Update Now" button for the hash dataset.
*   **Report Button:** Allows the user to report a False Positive, which sends the normalized DOM hash to the dev for dataset refinement.
