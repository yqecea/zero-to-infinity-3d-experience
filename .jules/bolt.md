# Bolt's Journal

## 2024-05-22 - [Performance Pattern: JS-Driven Animation vs CSS Transitions]
**Learning:** In a loop-driven animation system (like `requestAnimationFrame`), mixing CSS transitions on the same properties being updated by JS causes conflict and jitter. When JS updates the DOM every frame (16ms), a CSS transition (e.g., 0.1s) tries to interpolate between the previous frame and the new one, lagging behind the true state.
**Action:** When moving animation logic to a JS loop, explicitly remove CSS transitions on the affected elements to ensure the visual state perfectly matches the internal physics state.
