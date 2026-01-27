## 2024-05-23 - Asset Optimization & Retention
**Learning:** While bulk converting PNGs to WebP offers significant performance gains, certain assets (like `hero_bg.png`) serve as critical fallbacks for complex rendering systems (e.g., WebGL shaders) and must be preserved even if unused in the main HTML.
**Action:** Always verify "fallback" or "error prevention" asset requirements in project documentation/memory before performing destructive cleanup of original assets.
