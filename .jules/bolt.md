## 2024-05-22 - Static Asset Management
**Learning:** The project lacks a build system (no package.json), so standard image optimization pipelines (like next/image or vite-imagemin) are unavailable.
**Action:** Use custom Python scripts (Pillow) to optimize assets in place. Ensure future optimizations (CSS/JS minification) also consider this constraint or introduce a light build step.
