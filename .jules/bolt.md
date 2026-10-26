## 2024-05-24 - Typing Lag from Un-memoized Global State

**Learning:** Typing lag can occur severely when a parent component (like `App.tsx`) manages raw text state directly in a top-level component, forcing expensive sibling or child components (like `Preview` rendering ReactMarkdown with KaTeX) to re-render on every keystroke, even if they aren't the ones receiving the edit (like in plain text input). Memoizing an expensive child component only works if ALL of its props maintain referential equality.

**Action:** When isolating expensive rendering components like Markdown/KaTeX previewers, ensure the component itself is wrapped in `React.memo`, AND use `useCallback` (or stable values like constants defined outside the component) for ALL functions and arrays passed to it as props to preserve memoization across parent renders.
