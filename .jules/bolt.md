## 2026-11-02 - Prevent Cascading Re-renders in React App
**Learning:** Passing inline fallback arrays (like `|| []`) and inline function references to child components causes unnecessary re-renders on every keystroke, especially expensive when children have heavy Markdown/LaTeX rendering.
**Action:** Use predefined constant variables (e.g., `const EMPTY_ARRAY = []`) and `useCallback` to ensure stable references when passing props, and wrap child components in `React.memo()`.
