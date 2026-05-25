# 🛡️ FakeUI Detector

**FakeUI Detector** is a high-performance browser extension designed to combat sophisticated phishing attacks by analyzing the structural and visual integrity of login forms. Unlike traditional anti-phishing tools that rely solely on URL blacklists, FakeUI Detector examines the **actual UI layout** to identify fraudulent clones in real-time.

---

## 🚀 Key Features

-   **⚡ Hard-Gate Validation**: Immediate detection of critical red flags (e.g., Non-HTTPS sites, Domain-Action mismatches).
-   **🧬 DOM Structural Hashing**: Normalizes and hashes the DOM structure of login forms to match against a database of verified legitimate templates.
-   **👁️ Visual Spoofing Analysis**: Integrates a lightweight, quantized CNN (TensorFlow.js) to detect visual mimicry of known brands.
-   **⚖️ Weighted Confidence Scoring**: Combines symbolic and neural signals into a deterministic verdict: `SAFE`, `WARNING`, or `PHISHING`.
-   **🚨 Proactive Interruption**: High-visibility overlays block users from entering credentials on high-risk pages.
-   **☁️ Delta Sync**: Background synchronization of legitimate UI hashes from a remote static store.

---

## 🛠️ Technical Architecture

The extension operates as a pipelined filter to ensure latency stays below **200ms**:

### 1. The Analysis Pipeline
`Trigger` $\rightarrow$ `Hard Gates` $\rightarrow$ `DOM Hash Lookup` $\rightarrow$ `Visual CNN Inference` $\rightarrow$ `Weighted Score` $\rightarrow$ `Verdict`

### 2. Component Breakdown
-   **Content Script**: Monitors the DOM using `MutationObserver`. When a password field is detected, it captures the form's normalized structure and a visual snapshot.
-   **Background Worker**: The "Brain" of the system. It handles the heavy lifting:
    -   **Symbolic Reasoning**: Binary checks for protocol and domain consistency.
    -   **Structural Matching**: SHA-256 hashing of normalized DOM strings.
    -   **Neural Inference**: Executes a quantized MobileNetV3-Small model via TensorFlow.js.
-   **UI Layer**: A non-intrusive badge for safe sites and a critical blocking overlay for phishing attempts.

### 3. Tech Stack
-   **Language**: JavaScript (ES6+)
-   **API**: WebExtensions API (Manifest V3)
-   **ML Framework**: TensorFlow.js (WebGL Backend)
-   **Storage**: `chrome.storage.local` (Local Cache)
-   **Hashing**: SubtleCrypto (SHA-256)

---

## 📦 Installation Guide

Since this is a developer-tier security tool, it is installed via **Developer Mode**:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Genesis410/FakeUI-Analyzer-Chrome-Extension.git
    cd FakeUI-Analyzer-Chrome-Extension
    ```
2.  **Open Chrome Browser** and go to: `chrome://extensions/`
3.  **Enable "Developer mode"** (toggle switch in the top-right corner).
4.  **Click "Load unpacked"** (top-left button).
5.  **Select the project folder** (`FakeUI-Analyzer-Chrome-Extension`).

---

## 📖 Usage

Once installed, the extension works automatically in the background:

-   **Automatic Detection**: When you visit a page with a login form, the extension analyzes it instantly.
-   **Phishing Alert**: If a site is flagged as `PHISHING`, a red overlay will block the form and warn you to leave the page.
-   **Warning Alert**: If a site is `WARNING`, a yellow overlay will notify you of structural anomalies.
-   **Safe Verification**: A small shield icon `🛡️` appears in the bottom-right corner for verified legitimate sites.
-   **Management**: Click the extension icon in the toolbar to adjust sensitivity or update the hash database.

---

## ⚙️ Configuration & Development

### Adding Legitimate Templates
To add a new legitimate site to the "Safe" list:
1.  Capture the normalized DOM string of the target login form.
2.  Generate a SHA-256 hash of that string.
3.  Add the `domain -> hash` mapping to the `legit_hashes.json` file in the remote static store.

### Model Training
The CNN is based on a quantized MobileNetV3-Small. For refinement:
-   Focus on using a Knowledge-Distilled Lightweight CNN approach for browser efficiency.
-   Train using a mix of real-world phishing samples (PhishTank) and synthetic clones.

---

## 📄 License

This project is licensed under the **MIT License**.

```text
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
