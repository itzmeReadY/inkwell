## 2026-10-22 - Memoize Expensive Markdown Rendering
**Learning:** Heavy components like ReactMarkdown with math plugins can cause typing lag if they re-render on every keystroke when parent state changes.
**Action:** Use React.memo on components rendering markdown and ensure all props passed from parents (like arrays and functions) have stable references via useCallback/useMemo.
