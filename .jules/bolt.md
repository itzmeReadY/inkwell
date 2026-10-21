## 2024-11-20 - Memoizing Expensive Markdown Rendering
**Learning:** Extracting plugin arrays outside of React components is necessary to ensure `React.memo` correctly prevents re-renders, as inline array definitions change object identity on every render.
**Action:** When memoizing components that receive configuration objects or arrays, always extract these static definitions outside the component scope.
