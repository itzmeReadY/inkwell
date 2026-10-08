## 2024-05-24 - ReactMarkdown re-renders
**Learning:** ReactMarkdown re-renders expensively if `remarkPlugins` and `rehypePlugins` arrays are created inline during every render.
**Action:** Always extract stable array references outside of the React component or use `useMemo`, and wrap the markdown component with `React.memo` to prevent re-renders when parent state changes.
