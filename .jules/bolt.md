## 2024-05-24 - React Context and Inline Props causing massive re-renders
**Learning:** Passing inline arrays (e.g. `|| []`) or inline arrow functions to child components breaks `React.memo`, causing expensive Markdown and LaTeX re-rendering on every single keystroke.
**Action:** Always extract fallback arrays as static constants outside the component and wrap callback functions in `useCallback` to ensure stable references are passed to heavy memoized components.
