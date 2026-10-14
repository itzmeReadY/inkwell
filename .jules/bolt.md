
## 2026-10-14 - ReactMarkdown with remark/rehype plugins requires stable plugin references
**Learning:** Even when `ReactMarkdown` receives the exact same string as `children`, it will trigger a full re-parse and re-render of the computationally expensive Markdown and LaTeX (KaTeX) AST if the `remarkPlugins` or `rehypePlugins` arrays are defined inline. The arrays have new identities on each render, breaking React's ability to bail out of rendering.
**Action:** Always define plugin arrays (like `[remarkMath]` and `[rehypeKatex]`) outside of the component body to maintain a stable reference, and wrap the markdown renderer in `React.memo` to prevent UI lag when parent components (like a drawing canvas) trigger frequent re-renders.
