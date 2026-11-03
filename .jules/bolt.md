
## 2023-11-03 - Prevent React Typing Lag with React.memo and useCallback
**Learning:** In a highly interactive React application with expensive child components (like `react-markdown` with `rehype-katex`), passing inline arrays (like `[]`) or inline functions directly as props will break `React.memo()`. This causes the child component to re-render on every keystroke in the parent state, resulting in noticeable typing lag.
**Action:** Always extract static fallback arrays into external constants (e.g., `const EMPTY_ARRAY = []`), wrap event handlers in `useCallback()`, and wrap the heavy child component in `React.memo()`.
