# AI/ML Refinement: FakeUI Detector

Because this must run in a browser with `< 200ms` latency, we will use a **Knowledge-Distilled Lightweight CNN**.

## 1. Model Architecture: "FakeUI-Net"
*   **Base Model:** MobileNetV3-Small or SqueezeNet (chosen for their extreme parameter efficiency).
*   **Customization:**
    *   **Input:** $224 \times 224$ grayscale images (color is often used to trick CNNs; structure is the real signal).
    *   **Final Layer:** A single sigmoid output (0.0 = Legitimate, 1.0 = Spoof).
    *   **Quantization:** Post-training quantization to **INT8** using TensorFlow Lite / TF.js converter. This reduces model size from ~10MB to ~2.5MB.

## 2. Dataset Strategy
To avoid "overfitting" to specific sites, the training set must be diverse:
*   **Legitimate Set:** Scraped screenshots of the login containers of the Top 500 most visited websites (using a headless browser).
*   **Phishing Set:**
    *   **Real-world:** Data from PhishTank and OpenPhish.
    *   **Synthetic:** Generated "clones" using CSS/HTML modification to create slightly altered versions of the legitimate set (adds robustness to minor UI changes).
*   **Negative Samples:** Random login forms from obscure, legitimate sites to ensure the model doesn't just flag "everything unfamiliar" as phishing.

## 3. Training & Refinement Loop
*   **Loss Function:** Binary Cross-Entropy.
*   **Optimizer:** Adam with a decaying learning rate.
*   **Augmentation:** Random cropping, slight rotation, and Gaussian noise (to simulate different screen resolutions and rendering engines).
*   **Validation:** 80/10/10 split (Train/Val/Test).

## 4. Inference Optimization
*   **WebGL Acceleration:** Force TensorFlow.js to use the `webgl` backend for GPU acceleration.
*   **Lazy Loading:** The model is only loaded into RAM when the first login form is detected on a session, reducing initial extension load time.
*   **Input Pipeline:**
    `Canvas` $\rightarrow$ `GrayScale` $\rightarrow$ `Resize` $\rightarrow$ `Normalize [-1, 1]` $\rightarrow$ `Tensors`.

## 5. Benchmark & Evaluation
*   **Precision/Recall:** Target $\text{Precision} > 98\%$ (False positives are highly annoying) and $\text{Recall} > 90\%$.
*   **Latency Test:** Measured as `T(inference) + T(preprocess)`. Target: $< 100\text{ms}$ on mid-range laptops.
