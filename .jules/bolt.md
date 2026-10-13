## 2026-10-13 - [Memoize expensive ReactMarkdown component]
**Learning:** ReactMarkdown and LaTeX rendering (using react-markdown, remark-math, rehype-katex) in the frontend is computationally expensive. It can cause input lag when sibling state changes if not properly memoized.
**Action:** Always use React.memo to isolate these components and prevent UI/typing lag caused by unrelated state changes. Extract the arrays passed to remarkPlugins and rehypePlugins outside the component to prevent array identity changes from breaking memoization.
